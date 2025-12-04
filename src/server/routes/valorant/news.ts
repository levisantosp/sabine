import { Elysia, t } from 'elysia'
import { REST, Routes } from 'discord.js'
import { app } from '../../../structures/app/App'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder'
import locales from '@i18n'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder'

const rest = new REST().setToken(process.env.BOT_TOKEN)

export const news = new Elysia()
    .post(
        '/webhooks/news/valorant',
        async(req) => {
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

            req.set.status = 'OK'

            return { ok: true }
        },
        {
            body: t.Array(t.Object({
                title: t.String(),
                description: t.String(),
                url: t.String(),
                id: t.String()
            }))
        }
    )