import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyBaseLogger, RawServerDefault, FastifyInstance } from 'fastify'
import type { IncomingMessage, ServerResponse } from 'http'
import { REST, Routes, TextChannel } from 'discord.js'
import { app } from '../../../structures/app/App'
import { emojis } from '../../../util/emojis'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder'
import locales from '../../../i18n'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder'

const rest = new REST().setToken(process.env.BOT_TOKEN)

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

        const messages: Promise<unknown>[] = []

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

        await Promise.allSettled(messages)
    })
}