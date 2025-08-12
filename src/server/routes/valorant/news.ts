import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from "fastify"
import type { IncomingMessage, ServerResponse } from "http"
import { TextChannel } from "oceanic.js"
import { client } from "../../../structures/client/App.ts"
import EmbedBuilder from "../../../structures/builders/EmbedBuilder.ts"
import locales from "../../../locales/index.ts"
import ButtonBuilder from "../../../structures/builders/ButtonBuilder.ts"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function(
  fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, TypeBoxTypeProvider>
) {
  fastify.post("/webhooks/news/valorant", {
    schema: {
      body: Type.Array(
        Type.Object({
          title: Type.String(),
          description: Type.Optional(Type.String()),
          url: Type.String(),
          id: Type.String()
        })
      )
    }
  }, async(req) => {
    const guilds = await prisma.guilds.findMany({
      where: {
        valorant_news_channel: {
          isSet: true
        }
      }
    })
    if(!guilds.length) return
    for(const guild of guilds) {
      if(!guild.partner && !["PREMIUM"].some(x => x === guild.key?.type)) continue
      const channel = client.getChannel(guild.valorant_news_channel!) as TextChannel
      if(!channel) continue
      for(const data of req.body) {
        const embed = new EmbedBuilder()
          .setTitle(data.title)
        if(data.description) {
          embed.setDesc(data.description)
        }
        const button = new ButtonBuilder()
          .setStyle("link")
          .setLabel(locales(guild.lang ?? "en", "helper.source"))
          .setURL(data.url)
        channel.createMessage(embed.build({
          components: [
            {
              type: 1,
              components: [button]
            }
          ]
        }))
      }
    }
  })
}