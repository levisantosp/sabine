import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from 'fastify'
import type { IncomingMessage, ServerResponse } from 'http'
import { app } from '../../../structures/app/App.ts'
import { emojis } from '../../../util/emojis.ts'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder.ts'
import locales from '../../../i18n/index.ts'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder.ts'
import calcOdd from '../../../util/calcOdd.ts'
import { SabineUser } from '../../../database/index.ts'
import { REST, Routes } from 'discord.js'

const rest = new REST().setToken(process.env.BOT_TOKEN)

export default async function(
  fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, TypeBoxTypeProvider>
) {
  fastify.post('/webhooks/results/lol', {
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
          when: Type.String()
        })
      )
    }
  }, async(req) => {
    const guilds = await app.prisma.guild.findMany({
      where: {
        events: {
          some: {
            type: 'lol'
          }
        }
      },
      include: {
        events: {
          where: {
            type: 'lol'
          }
        },
        key: true
      }
    })

    const preds = await app.prisma.prediction.findMany({
      where: {
        game: 'lol'
      },
      include: {
        teams: true
      }
    })

    if(!guilds.length) return

    const messages: Promise<unknown>[] = []

    for(
      const data of req.body
        .map(body => ({
          ...body,
          when: new Date(body.when)
        }))
    ) {
      for(const guild of guilds) {
        const event = guild.events.find(e => e.name === data.tournament.name)

        if(!event) continue

        if(!guild.events.some(e => e.name === data.tournament.name)) continue

        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji

        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.name,
            iconURL: data.tournament.image
          })
          .setField(
            `${emoji1} ${data.teams[0].name} \`${data.teams[0].score}\` <:versus:1349105624180330516> \`${data.teams[1].score}\` ${data.teams[1].name} ${emoji2}`,
            `<t:${data.when.getTime() / 1000}:F> | <t:${data.when.getTime() / 1000}:R>`,
            true
          )
          .setFooter({ text: data.stage })

        messages.push(
          rest.post(Routes.channelMessages(event.channel2), {
            body: {
              embeds: [embed.toJSON()],
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, 'helper.stats'))
                      .defineStyle('link')
                      .setURL(`https://vlr.gg/${data.id}`),
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, 'helper.pickem.label'))
                      .defineStyle('blue')
                      .setCustomId('pickem')
                  ]
                }
              ]
            }
          })
        )
      }
    }

    if(!preds.length) return

    for(const data of req.body) {
      for(const pred of preds) {
        if(data.id !== pred.match) continue

        const user = await SabineUser.fetch(pred.userId)

        if(!user) continue

        if(pred.teams[0].score === data.teams[0].score && pred.teams[1].score === data.teams[1].score) {
          await user.addCorrectPrediction('lol', data.id)

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

              if(user.premium) {
                bonus = Number(pred.bet) / 2
              }

              user.coins += BigInt(Number(pred.bet) * odd) + BigInt(bonus)
              user.fates += 10

              pred.odd = odd

              await Promise.all([
                app.prisma.prediction.update({
                  where: {
                    id: pred.id
                  },
                  data: {
                    odd: odd
                  }
                }),
                user.save()
              ])
            }
          }
        }
        else {
          await user.addWrongPrediction('lol', data.id)
        }
      }
    }

    await Promise.all(messages)
  })
}