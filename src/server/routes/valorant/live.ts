import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from "fastify"
import type { IncomingMessage, ServerResponse } from "http"
import { TextChannel } from "oceanic.js"
import { client } from "../../../structures/client/App.ts"
import { emojis } from "../../../util/emojis.ts"
import EmbedBuilder from "../../../structures/builders/EmbedBuilder.ts"
import locales from "../../../locales/index.ts"
import ButtonBuilder from "../../../structures/builders/ButtonBuilder.ts"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const tournaments: {[key: string]: RegExp[]} = {
  "Valorant Champions Tour": [
    /valorant champions/,
    /valorant masters/,
    /vct \d{4}/
  ],
  "Valorant Challengers League": [
    /challengers \d{4}/
  ],
  "Valorant Game Changers": [
    /game changers \d{4}/
  ]
}

export default async function(
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    TypeBoxTypeProvider
  >
) {
  fastify.post("/webhooks/live/valorant", {
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
    const guilds = await prisma.guild.findMany({
      where: {
        valorant_livefeed_channel: {
          isSet: true
        }
      }
    })
    if(!guilds.length) return
    for(const data of req.body) {
      for(const guild of guilds) {
        const channel = client.getChannel(guild.valorant_livefeed_channel!) as TextChannel
        if(!channel) continue
        if(
          !guild.valorant_events.some(e => e.name === data.tournament.name) &&
          !guild.valorant_events.some(e =>
            tournaments[e.name]?.some(regex =>
              regex.test(data.tournament.name.replace(/\s+/g, " ").trim().toLowerCase())
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
          .setTitle(locales(guild.lang ?? "en", "helper.live_now"))
          .setField(
            `${emoji1} ${data.teams[0].name} \`${data.teams[0].score}\` <:versus:1349105624180330516> \`${data.teams[1].score}\` ${data.teams[1].name} ${emoji2}`,
            locales(guild.lang ?? "en", "helper.live_feed_value", {
              map: data.currentMap,
              score: `${data.score1}-${data.score2}`
            })
          )
          .setFooter({ text: data.stage })
        const button = new ButtonBuilder()
          .setStyle("link")
          .setLabel(locales(guild.lang ?? "en", "helper.stats"))
          .setURL(data.url)
        const messages = await channel.getMessages({ limit: 7 })
        const message = messages.find(m =>
          guild.live_messages.some(msg =>
            msg.message === m.id &&
            msg.event === data.tournament.name
          )
        )
        if(!message || guild.spam_live_messages) {
          const msg = await channel.createMessage(embed.build({
            components: [
              {
                type: 1,
                components: [button]
              }
            ]
          }))
          const index = guild.live_messages.findIndex(m => m.event === data.tournament.name)
          guild.live_messages.splice(index, 1)
          guild.live_messages.push({
            message: msg.id,
            event: data.tournament.name
          })
          await prisma.guild.update({
            where: {
              id: guild.id
            },
            data: {
              live_messages: guild.live_messages
            }
          })
        }
        else {
          await message.edit(embed.build({
            components: [
              {
                type: 1,
                components: [button]
              }
            ]
          }))
        }
      }
    }
  })
}