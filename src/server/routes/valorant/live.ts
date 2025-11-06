import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from 'fastify'
import type { IncomingMessage, ServerResponse } from 'http'
import { REST, Routes } from 'discord.js'
import { app } from '../../../structures/app/App.ts'
import { emojis } from '../../../util/emojis.ts'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder.ts'
import locales from '../../../i18n/index.ts'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder.ts'

const tournaments: { [key: string]: RegExp[] } = {
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

const rest = new REST().setToken(process.env.BOT_TOKEN)

export default async function(
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    TypeBoxTypeProvider
  >
) {
  fastify.post('/webhooks/live/valorant', {
    schema: {
      body: Type.Array(
        Type.Object({
          teams: Type.Array(
            Type.Object({
              name: Type.String(),
              score: Type.String()
            })
          ),
          currentMap: Type.String(),
          score1: Type.String(),
          score2: Type.String(),
          id: Type.String(),
          url: Type.String(),
          stage: Type.String(),
          tournament: Type.Object({
            name: Type.String(),
            image: Type.String()
          })
        })
      )
    }
  }, async(req) => {
    const guilds = await app.prisma.guild.findMany({
      where: {
        valorant_live_feed_channel: {
          not: null
        }
      },
      include: {
        events: {
          where: {
            type: 'valorant'
          }
        },
        live_messages: true
      }
    })

    if(!guilds.length) return

    const messages: Promise<unknown>[] = []

    for(const data of req.body) {
      for(const guild of guilds) {
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
          .setTitle(locales(guild.lang ?? 'en', 'helper.live_now'))
          .setField(
            `${emoji1} ${data.teams[0].name} \`${data.teams[0].score}\` <:versus:1349105624180330516> \`${data.teams[1].score}\` ${data.teams[1].name} ${emoji2}`,
            locales(guild.lang ?? 'en', 'helper.live_feed_value', {
              map: data.currentMap,
              score: `${data.score1}-${data.score2}`
            })
          )
          .setFooter({ text: data.stage })

        const button = new ButtonBuilder()
          .defineStyle('link')
          .setLabel(locales(guild.lang ?? 'en', 'helper.stats'))
          .setURL(data.url)

        messages.push(
          rest.post(Routes.channelMessages(guild.valorant_live_feed_channel!), {
            body: {
              embeds: [embed.toJSON()],
              components: [
                {
                  type: 1,
                  components: [button]
                }
              ]
            }
          })
        )
      }
    }

    await Promise.all(messages)
  })
}