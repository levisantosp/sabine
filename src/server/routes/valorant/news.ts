import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from 'fastify'
import type { IncomingMessage, ServerResponse } from 'http'
import { REST, Routes } from 'discord.js'
import { app } from '../../../structures/app/App'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder'
import locales from '../../../i18n'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder'

const rest = new REST().setToken(process.env.BOT_TOKEN)

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

      const messages: Promise<unknown>[] = []

      for(const guild of guilds) {
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

        messages.push(
          rest.post(Routes.channelMessages(guild.valorant_news_channel!), {
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

      await Promise.allSettled(messages)
  })
}