import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import type { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify"
import calcOdd from "../../../structures/util/calcOdd.ts"
import ButtonBuilder from "../../../structures/builders/ButtonBuilder.ts"
import locales from "../../../locales/index.ts"
import EmbedBuilder from "../../../structures/builders/EmbedBuilder.ts"
import { emojis } from "../../../structures/util/emojis.ts"
import {
  Guild,
  type GuildSchemaInterface,
  User,
  type UserSchemaInterface
} from "../../../database/index.ts"
import { client } from "../../../structures/client/App.ts"
import type { ResultsData } from "../../../types.ts"
import type { IncomingMessage, ServerResponse } from "http"

export default async function(
  fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, TypeBoxTypeProvider>
) {
  fastify.post("/webhooks/results/valorant", {
    schema: {
      body: Type.Array(
        Type.Object(
          {
            id: Type.String(),
            teams: Type.Array(
              Type.Object(
                {
                  name: Type.String(),
                  score: Type.String(),
                  country: Type.String(),
                  winner: Type.Boolean()
                }
              )
            ),
            status: Type.String(),
            tournament: Type.Object(
              {
                name: Type.String(),
                image: Type.String()
              }
            ),
            stage: Type.String(),
            when: Type.Number()
          }
        )
      )
    }
  }, async(req) => {
    console.log(req.body)
    const guilds = await Guild.find({
      events: { $ne: [] }
    }) as GuildSchemaInterface[]
    const users = await User.find({
      valorant_predictions: {
        $ne: []
      }
    }) as UserSchemaInterface[]
    console.log(guilds.length)
    if(!guilds.length) return
    for(const guild of guilds) {
      let data: ResultsData[]
      if(guild.valorant_events.length > 5 && !guild.key) {
        req.body
        data = req.body.filter(d => guild.valorant_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }
      else data = req.body.filter(d => guild.valorant_events.some(e => e.name === d.tournament.name))
      if(!data || !data[0]) continue
      data.reverse()
      for(const d of data) {
        for(const e of guild.valorant_events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const embed = new EmbedBuilder()
              .setAuthor({
                name: d.tournament.name,
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
                      .setLabel(locales(guild.lang, "helper.stats"))
                      .setStyle("link")
                      .setURL(`https://vlr.gg/${d.id}`),
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }))
            .catch(() => {})
          }
        }
      }
      data.reverse()
      guild.valorant_last_result = data[0].id
      await guild.save()
    }
    if(!users.length) return
    for(const user of users) {
      for(const data of req.body) {
        const pred = user.valorant_predictions.find(p => p.match === data.id)
        if(!pred) continue
        if(pred.teams[0].score === data.teams[0].score && pred.teams[1].score === data.teams[1].score) {
          await user.addCorrectPrediction("valorant", data.id)
        }
        else {
          await user.addWrongPrediction("valorant", data.id)
        }
        if(pred.bet) {
          const winnerIndex = data.teams.findIndex(t => t.winner)
          const i = user.valorant_predictions.findIndex(p => p.match === data.id)
          if(user.valorant_predictions[i].teams[winnerIndex].winner) {
            let oddA = 0
            let oddB = 0
            for(const u of users) {
              let index = u.valorant_predictions.findIndex(p => p.match === data.id)
              if(!u.valorant_predictions[index]) continue
              if(u.valorant_predictions[index].teams[0].winner && u.valorant_predictions[index].bet) {
                oddA += 1
              }
              else if(u.valorant_predictions[index].teams[1].winner && u.valorant_predictions[index].bet) {
                oddB += 1
              }
            }
            let odd: number
            if(user.valorant_predictions[i].teams[0].winner) {
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
            user.valorant_predictions[i].odd = odd
            await user.updateOne({
              $set: {
                valorant_predictions: user.valorant_predictions,
                coins: user.coins
              }
            })
          }
        }
      }
    }
  })
}