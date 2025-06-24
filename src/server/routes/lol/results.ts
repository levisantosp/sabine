import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from "fastify"
import type { IncomingMessage, ServerResponse } from "http"
import { Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../../../database/index.ts"
import { client } from "../../../structures/client/App.ts"
import { emojis } from "../../../structures/util/emojis.ts"
import EmbedBuilder from "../../../structures/builders/EmbedBuilder.ts"
import locales from "../../../locales/index.ts"
import ButtonBuilder from "../../../structures/builders/ButtonBuilder.ts"
import { ResultsData } from "../../../types.ts"
import calcOdd from "../../../structures/util/calcOdd.ts"

export default async function(
  fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, TypeBoxTypeProvider>
) {
  fastify.post("/webhooks/results/lol", {
    schema: {
      body: Type.Array(
        Type.Object({
          id: Type.String(),
          teams: Type.Array(
            Type.Object({
              name: Type.String(),
              score: Type.String(),
              winner: Type.Boolean()
            })
          ),
          tournament: Type.Object({
            name: Type.String(),
            full_name: Type.String(),
            image: Type.String()
          }),
          stage: Type.String(),
          when: Type.Number()
        })
      )
    }
  }, async(req) => {
    const guilds = await Guild.find({
      events: { $ne: [] }
    }) as GuildSchemaInterface[]
    const users = await User.find({
      lol_predictions: {
        $ne: []
      }
    }) as UserSchemaInterface[]
    if(!guilds.length) return
    for(const guild of guilds) {
      let data: ResultsData[]
      if(guild.lol_events.length > 5 && !guild.key) {
        req.body
        data = req.body.filter(d => guild.lol_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }
      else data = req.body.filter(d => guild.lol_events.some(e => e.name === d.tournament.name))
      if(!data || !data[0]) continue
      data.reverse()
      for(const d of data) {
        if(d.teams[0].score === "0" && d.teams[1].score === "0") continue
        for(const e of guild.lol_events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const embed = new EmbedBuilder()
              .setAuthor({
                name: d.tournament.full_name!,
                iconURL: d.tournament.image
              })
              .setField(
                `${emoji1} ${d.teams[0].name} \`${d.teams[0].score}\` <:versus:1349105624180330516> \`${d.teams[1].score}\` ${d.teams[1].name} ${emoji2}`,
                `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`,
                true
              )
              .setFooter({ text: d.stage })
            client.rest.channels.createMessage(e.channel2, embed.build({
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }))
          }
        }
      }
      data.reverse()
      guild.lol_last_result = data[0].id
      await guild.save()
    }
    if(!users.length) return
    for(const user of users) {
      for(const data of req.body) {
        const pred = user.lol_predictions.find(p => p.match === data.id)
        if(!pred) continue
        if(pred.teams[0].score === data.teams[0].score && pred.teams[1].score === data.teams[1].score) {
          await user.addCorrectPrediction("lol", data.id)
        }
        else {
          await user.addWrongPrediction("lol", data.id)
        }
        if(pred.bet) {
          const winnerIndex = data.teams.findIndex(t => t.winner)
          const i = user.lol_predictions.findIndex(p => p.match === data.id)
          if(user.lol_predictions[i].teams[winnerIndex].winner) {
            let oddA = 0
            let oddB = 0
            for(const u of users) {
              let index = u.lol_predictions.findIndex(p => p.match === data.id)
              if(!u.lol_predictions[index]) continue
              if(u.lol_predictions[index].teams[0].winner && u.lol_predictions[index].bet) {
                oddA += 1
              }
              else if(u.lol_predictions[index].teams[1].winner && u.lol_predictions[index].bet) {
                oddB += 1
              }
            }
            let odd: number
            if(user.lol_predictions[i].teams[0].winner) {
              odd = calcOdd(oddA)
            }
            else {
              odd = calcOdd(oddB)
            }
            let bonus = 0
            if(user.plan) {
              bonus = Number(pred.bet) / 2
            }
            user.coins += BigInt(Number(pred.bet) * odd) + BigInt(bonus)
            user.lol_predictions[i].odd = odd
            await user.updateOne({
              $set: {
                lol_predictions: user.lol_predictions,
                coins: user.coins
              }
            })
          }
        }
      }
    }
  })
}