import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from 'fastify'
import type { IncomingMessage, ServerResponse } from 'http'
import { TextChannel } from 'discord.js'
import { app } from '../../../structures/app/App.ts'
import { emojis } from '../../../util/emojis.ts'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder.ts'
import locales from '../../../i18n/index.ts'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder.ts'

export default async function(
  fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, TypeBoxTypeProvider>
) {
  fastify.post('/webhooks/live/lol', {
    schema: {
      body: Type.Array(
        Type.Object({
          id: Type.String(),
          tournament: Type.Object({
            name: Type.String(),
            full_name: Type.String(),
            image: Type.String()
          }),
          teams: Type.Union([
            Type.Array(
              Type.Object({
                name: Type.String(),
                score: Type.String()
              })
            ),
            Type.Array(Type.Never())
          ]),
          stage: Type.Optional(Type.String()),
          streams: Type.Array(
            Type.Object({
              main: Type.Boolean(),
              language: Type.String(),
              embed_url: Type.String(),
              official: Type.Boolean(),
              raw_url: Type.String()
            })
          )
        })
      )
    }
  }, async(req) => {
    const guilds = await app.prisma.guild.findMany({
      where: {
        lol_live_feed_channel: {
          not: null
        }
      },
      include: {
        events: {
          where: {
            type: 'lol'
          }
        },
        live_messages: true
      }
    })

    if(!guilds.length) return

    for(const data of req.body) {
      for(const guild of guilds) {
        const channel = app.channels.cache.get(guild.lol_live_feed_channel!) as TextChannel

        if(!channel) continue

        if(!guild.events.some(e => e.name === data.tournament.name)) continue

        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji

        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.full_name,
            iconURL: data.tournament.image
          })
          .setTitle(locales(guild.lang ?? 'en', 'helper.live_now'))
          .setField(
            `${emoji1} ${data.teams[0].name} \`${data.teams[0].score}\` <:versus:1349105624180330516> \`${data.teams[1].score}\` ${data.teams[1].name} ${emoji2}`,
            ''
          )

        if(data.stage) embed.setFooter({ text: data.stage })

        const button = new ButtonBuilder()
          .defineStyle('blue')
          .setLabel(locales(guild.lang ?? 'en', 'helper.streams'))
          .setCustomId(`stream;lol;${data.id}`)

        const messages = await channel.messages.fetch({ limit: 10 })
        const message = messages.find(m =>
          guild.live_messages.some(msg =>
            msg.message === m.id &&
            msg.event === data.tournament.name
          )
        )

        if(!message || guild.spam_live_messages) {
          const msg = await channel.send({
            embeds: [embed],
            components: [
              {
                type: 1,
                components: [button]
              }
            ]
          })

          const liveMessage = guild.live_messages.filter(m => m.event === data.tournament.name)[0]

          await app.prisma.guild.update({
            where: {
              id: guild.id
            },
            data: {
              live_messages: {
                upsert: {
                  where: {
                    id: liveMessage.id
                  },
                  update: {
                    event: data.tournament.name,
                    message: msg.id
                  },
                  create: {
                    event: data.tournament.name,
                    message: msg.id
                  }
                }
              }
            }
          })
        }

        else {
          await message.edit({
            embeds: [embed],
            components: [
              {
                type: 1,
                components: [button]
              }
            ]
          })
        }
      }
    }
  })
}