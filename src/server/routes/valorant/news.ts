import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from 'fastify'
import type { IncomingMessage, ServerResponse } from 'http'
import { TextChannel } from 'discord.js'
import { app } from '../../../structures/app/App.ts'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder.ts'
import locales from '../../../locales/index.ts'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder.ts'

export default async function(
  fastify: FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, TypeBoxTypeProvider>
) {
  fastify.post('/webhooks/news/valorant', {
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
    const guilds = await app.prisma.guild.findMany({
      where: {
        valorant_news_channel: {
          not: null
        }
      }
    })

    if(!guilds.length) return

    for(const guild of guilds) {
      const channel = app.channels.cache.get(guild.valorant_news_channel!) as TextChannel

      if(!channel) continue

      for(const data of req.body) {
        const embed = new EmbedBuilder()
          .setTitle(data.title)

        if(data.description) {
          embed.setDesc(data.description)
        }

        const button = new ButtonBuilder()
          .defineStyle('link')
          .setLabel(locales(guild.lang ?? 'en', 'helper.source'))
          .setURL(data.url)

        await channel.send({
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
  })
}