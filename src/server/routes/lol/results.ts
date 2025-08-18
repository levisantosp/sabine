import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from "fastify"
import type { IncomingMessage, ServerResponse } from "http"
import { client } from "../../../structures/client/App.ts"
import { emojis } from "../../../util/emojis.ts"
import EmbedBuilder from "../../../structures/builders/EmbedBuilder.ts"
import locales from "../../../locales/index.ts"
import ButtonBuilder from "../../../structures/builders/ButtonBuilder.ts"
import { type ResultsData } from "../../../types.ts"
import calcOdd from "../../../util/calcOdd.ts"
import { PrismaClient } from "@prisma/client"
import { SabineUser } from "../../../database/index.ts"

const prisma = new PrismaClient()

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
    const guilds = await prisma.guilds.findMany({
      where: {
        lol_events: {
          isEmpty: false
        }
      }
    })
    const preds = await prisma.predictions.findMany({
      where: {
        game: "lol"
      }
    })
    if(!guilds.length) return
    for(const guild of guilds) {
      let data: ResultsData[]
      if(guild.lol_events.length > 5 && !guild.key) {
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
                      .setLabel(locales(guild.lang ?? "", "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }))
          }
        }
      }
    }
    if(!preds.length) return
    for(const pred of preds) {
      const user = await SabineUser.fetch(pred.id)
      if(!user) continue
      for(const data of req.body) {
        if(pred.teams[0].score === data.teams[0].score && pred.teams[1].score === data.teams[1].score) {
          await user.addCorrectPrediction("lol", data.id)
        }
        else {
          await user.addWrongPrediction("lol", data.id)
        }
        if(pred.bet) {
          const winnerIndex = data.teams.findIndex(t => t.winner)
          if(pred.teams[winnerIndex].winner) {
            let oddA = 0
            let oddB = 0
            for(const p of preds) {
              if(p.teams[0].winner && p.bet) {
                oddA += 1
              }
              else if(p.teams[1].winner && p.bet) {
                oddB += 1
              }
            }
            let odd: number
            if(pred.teams[0].winner) {
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
            user.fates += 10
            pred.odd = BigInt(odd)
            await Promise.all([
              await prisma.predictions.update({
                where: {
                  id: pred.id
                },
                data: {
                  odd: BigInt(odd)
                }
              }),
              user.save()
            ])
          }
        }
      }
    }
  })
}