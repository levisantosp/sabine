import { Elysia, t } from 'elysia'
import { REST, Routes, TextChannel } from 'discord.js'
import { app } from '../../../structures/app/App'
import { emojis } from '../../../util/emojis'
import EmbedBuilder from '../../../structures/builders/EmbedBuilder'
import locales from '@i18n'
import ButtonBuilder from '../../../structures/builders/ButtonBuilder'

const rest = new REST().setToken(process.env.BOT_TOKEN)

export const lolLive = new Elysia()
    .post(
        '/webhooks/live/lol',
        async(req) => {
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

                    const emoji1 = emojis.find(e =>
                        e?.name === data.teams[0].name.toLowerCase()
                        || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()
                        ))?.emoji ?? emojis[1]?.emoji
                    const emoji2 = emojis.find(e =>
                        e?.name === data.teams[1].name.toLowerCase()
                        || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()
                        ))?.emoji ?? emojis[1]?.emoji

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

            req.set.status = 'OK'

            return { ok: true }
        },
        {
            body: t.Array(t.Object({
                id: t.String(),
                tournament: t.Object({
                    name: t.String(),
                    full_name: t.String(),
                    image: t.String()
                }),
                teams: t.Union([
                    t.Array(t.Never()),
                    t.Array(t.Object({
                        name: t.String(),
                        score: t.String()
                    }))
                ]),
                stage: t.Optional(t.String()),
                streams: t.Array(t.Object({
                    mani: t.Boolean(),
                    language: t.String(),
                    embed_url: t.String(),
                    official: t.Boolean(),
                    raw_url: t.String()
                }))
            }))
        }
    )