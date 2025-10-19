import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyBaseLogger, FastifyInstance, RawServerDefault } from 'fastify'
import calcOdd from '../../../util/calcOdd.ts'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder.ts'
import locales from '../../../locales/index.ts'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder.ts'
import { emojis } from '../../../util/emojis.ts'
import { client } from '../../../structures/client/App.ts'
import type { IncomingMessage, ServerResponse } from 'http'
import { PrismaClient } from '@prisma/client'
import { SabineUser } from '../../../database/index.ts'
import * as Oceanic from 'oceanic.js'

const prisma = new PrismaClient()
const tournaments: {[key: string]: RegExp[]} = {
  'Valorant Champions Tour': [
    /valorant champions/,
    /valorant masters/,
    /vct \d{4}/
  ],
  'Valorant Challengers League': [
    /challengers \d{4}/
  ],
  'Valorant Game Changers': [
    /game changers \d{4}/
  ]
}

export default async function(
  fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, TypeBoxTypeProvider>
) {
  fastify.post('/webhooks/results/valorant', {
    schema: {
      body: Type.Array(
        Type.Object(
          {
            id: Type.String(),
            status: Type.String(),
            stage: Type.String(),
            when: Type.String(),
            url: Type.String(),
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
            tournament: Type.Object(
              {
                name: Type.String(),
                image: Type.String()
              }
            ),
          }
        )
      )
    }
  }, async(req) => {
    const guilds = await prisma.guild.findMany({
      where: {
        events: {
          some: {
            type: 'valorant'
          }
        }
      },
      include: {
        events: {
          where: {
            type: 'valorant'
          }
        },
        key: true
      }
    })

    const preds = await prisma.prediction.findMany({
      where: {
        game: 'valorant'
      },
      include: {
        teams: true
      }
    })

    if(!guilds.length) return

    for(
      const data of req.body
        .map(body => ({
          ...body,
          when: new Date(body.when)
        }))
    ) {
      for(const guild of guilds) {
        const channel = client.getChannel(guild.events.filter(e =>
          Object.keys(tournaments).includes(e.name))[0].channel2
        )
          || client.getChannel(guild.events.filter(e =>
            e.name === data.tournament.name)[0].channel2
          )

        if(!channel || channel.type !== Oceanic.ChannelTypes.GUILD_TEXT) continue

        if(
          !guild.events.some(e => e.name === data.tournament.name) &&
          !guild.events.some(e =>
            tournaments[e.name]?.some(regex =>
              regex.test(data.tournament.name.replace(/\s+/g, ' ').trim().toLowerCase())
            )
          )
        ) continue

        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji

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
        
        channel.createMessage(embed.build({
          components: [
            {
              type: 1,
              components: [
                new ButtonBuilder()
                  .setLabel(locales(guild.lang, 'helper.stats'))
                  .setStyle('link')
                  .setURL(`https://vlr.gg/${data.id}`),
                new ButtonBuilder()
                  .setLabel(locales(guild.lang ?? 'en', 'helper.pickem.label'))
                  .setStyle('blue')
                  .setCustomId('pickem')
              ]
            }
          ]
        }))
      }
    }

    if(!preds.length) return

    for(const data of req.body) {
      for(const pred of preds) {
        if(data.id !== pred.match) continue

        const user = await SabineUser.fetch(pred.userId)

        if(!user) continue

        if(pred.teams[0].score === data.teams[0].score && pred.teams[1].score === data.teams[1].score) {
          await user.addCorrectPrediction('valorant', data.id)

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
                prisma.prediction.update({
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
          await user.addWrongPrediction('valorant', data.id)
        }
      }
    }
  })
}