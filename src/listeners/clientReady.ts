import { ChannelType, type TextChannel } from 'discord.js'
import Service from '../api/index.ts'
import t from '../i18n/index.ts'
import type { MatchesData } from '../types.ts'
import createListener from '../structures/app/createListener.ts'
import Logger from '../util/Logger.ts'
import { emojis } from '../util/emojis.ts'
import EmbedBuilder from '../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../structures/builders/ButtonBuilder.ts'
import App from '../structures/app/App.ts'
import { SabineUser } from '../database/index.ts'
import type { $Enums } from '@prisma/client'
const service = new Service(process.env.AUTH)

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

const sendValorantMatches = async(app: App) => {
  const res = await service.getMatches('valorant')
  const res2 = await service.getResults('valorant')

  if(!res || !res.length) return

  const guilds = await app.prisma.guild.findMany({
    include: {
      events: {
        where: {
          type: 'valorant'
        }
      },
      key: true,
      tbd_matches: {
        where: {
          type: 'valorant'
        }
      }
    }
  })

  if(!guilds.length) return

  for(const guild of guilds) {
    const matches: {
      matchId: string
      guildId: string
      channel: string
      type: $Enums.EventType
    }[] = []

    if(
      guild.valorant_matches.length &&
      !res2.some(d => d.id === guild.valorant_matches[guild.valorant_matches.length - 1])
    ) continue

    guild.valorant_matches = []

    let data: MatchesData[]

    if(guild.events.length > 5 && !guild.key) {
      if(!guild.events.slice().reverse().slice(0, 5).some(e => Object.keys(tournaments).includes(e.name))) {
        data = res.filter(d => guild.events.slice().reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }

      else {
        data = res.filter(d => {
          const events1 = guild.events.slice()
            .reverse()
            .slice(0, 5)
            .some(e => e.name === d.tournament.name)

          if(events1) return true

          const events2 = guild.events.slice()
            .reverse()
            .slice(0, 5)
            .some(e => {
              const tour = tournaments[e.name]
              if(!tour) return false
              return tour.some(regex =>
                regex.test(d.tournament.name.replace(/\s+/g, ' ').trim().toLowerCase())
              )
            })

          if(events2) return true

          return false
        })
      }
    }
    else {
      if(!guild.events.some(e => Object.keys(tournaments).includes(e.name))) {
        data = res.filter(d => guild.events.some(e => e.name === d.tournament.name))
      }

      else {
        data = res.filter(d => {
          const events1 = guild.events.some(e => e.name === d.tournament.name)

          if(events1) return true

          const events2 = guild.events.some(e => {
            const tour = tournaments[e.name]
            if(!tour) return false
            return tour.some(regex =>
              regex.test(d.tournament.name.replace(/\s+/g, ' ').trim().toLowerCase())
            )
          })

          if(events2) return true

          return false
        })
      }
    }

    if(!data.length) continue

    for(const e of guild.events) {
      const channel = await app.channels.fetch(e.channel1)

      if(!channel || channel.type !== ChannelType.GuildText) continue

      try {
        const messages = await channel.messages.fetch({ limit: 100 })
        const messagesIds = messages.filter(m => m.author.id === app.user?.id).map(m => m.id)

        if(messagesIds.length) {
          await channel.bulkDelete(messagesIds)
        }
      }

      catch { }
    }
    try {
      for(
        const d of data.map(body => ({
          ...body,
          when: new Date(body.when)
        }))
      ) {
        if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue

        for(const e of guild.events) {
          if(
            e.name === d.tournament.name
            || tournaments[e.name]?.some(regex =>
              regex.test(d.tournament.name.trim().replace(/\s+/g, ' ').toLowerCase())
            )
          ) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji

            const index = guild.valorant_matches.findIndex((m) => m === d.id)

            if(index > -1) guild.valorant_matches.splice(index, 1)

            if(!d.stage.toLowerCase().includes('showmatch')) guild.valorant_matches.push(d.id!)

            const embed = new EmbedBuilder()
              .setAuthor({
                iconURL: d.tournament.image,
                name: d.tournament.name
              })
              .setField(`${emoji1} ${d.teams[0].name} <:versus:1349105624180330516> ${d.teams[1].name} ${emoji2}`, `<t:${d.when.getTime() / 1000}:F> | <t:${d.when.getTime() / 1000}:R>`, true)
              .setFooter({
                text: d.stage
              })

            const button = new ButtonBuilder()
              .setLabel(t(guild.lang, 'helper.palpitate'))
              .setCustomId(`predict;valorant;${d.id}`)
              .defineStyle('green')

            const urlButton = new ButtonBuilder()
              .setLabel(t(guild.lang, 'helper.stats'))
              .defineStyle('link')
              .setURL(`https://vlr.gg/${d.id}`)

            if(d.stage.toLowerCase().includes('showmatch')) continue

            const channel = await app.channels.fetch(e.channel1)

            if(!channel || channel.type !== ChannelType.GuildText) continue

            if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await channel.send({
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang, 'helper.bet'))
                      .setCustomId(`bet;valorant;${d.id}`)
                      .defineStyle('gray'),
                    urlButton,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang, 'helper.pickem.label'))
                      .defineStyle('blue')
                      .setCustomId('pickem')
                  ]
                }
              ]
            }).catch(() => { })

            else {
              if(!matches.some(m => m.matchId === d.id)) {
                matches.push({
                  matchId: d.id!,
                  channel: e.channel1,
                  guildId: guild.id,
                  type: 'valorant'
                })
              }
            }

            break
          }
        }
      }
    }
    catch { }

    await app.prisma.guild.update({
      where: {
        id: guild.id
      },
      data: {
        valorant_matches: guild.valorant_matches,
        tbd_matches: {
          deleteMany: {
            type: 'valorant'
          },
          create: matches.length
            ? matches.map(m => ({
              type: m.type,
              matchId: m.matchId,
              channel: m.channel
            }))
            : undefined
        },
        live_messages: {
          deleteMany: {}
        }
      }
    })
  }
}
const sendValorantTBDMatches = async(app: App) => {
  const res = await service.getMatches('valorant')

  if(!res || !res.length) return

  const guilds = await app.prisma.guild.findMany({
    include: {
      tbd_matches: {
        where: {
          type: 'valorant'
        }
      }
    }
  })

  if(!guilds.length) return

  for(const guild of guilds) {
    if(!guild.tbd_matches.length) continue

    for(const match of guild.tbd_matches) {
      const data = res
        .map(body => ({
          ...body,
          when: new Date(body.when)
        }))
        .find(d => d.id === match.id)

      if(!data) continue

      if(data.teams[0].name !== 'TBD' && data.teams[1].name !== 'TBD') {
        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji

        const channel = await app.channels.fetch(match.channel) as TextChannel

        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.name,
            iconURL: data.tournament.image
          })
          .setField(`${emoji1} ${data.teams[0].name} <:versus:1349105624180330516> ${data.teams[1].name} ${emoji2}`, `<t:${data.when.getTime() / 1000}:F> | <t:${data.when.getTime() / 1000}:R>`, true)
          .setFooter({ text: data.stage })

        channel.send({
          embeds: [embed],
          components: [
            {
              type: 1,
              components: [
                new ButtonBuilder()
                  .setLabel(t(guild.lang, 'helper.palpitate'))
                  .setCustomId(`predict;valorant;${match.id}`)
                  .defineStyle('green'),
                new ButtonBuilder()
                  .setLabel(t(guild.lang, 'helper.bet'))
                  .setCustomId(`bet;valorant;${data.id}`)
                  .defineStyle('gray'),
                new ButtonBuilder()
                  .setLabel(t(guild.lang, 'helper.stats'))
                  .defineStyle('link')
                  .setURL(`https://vlr.gg/${data.id}`)
              ]
            }
          ]
        })
          .catch(() => { })

        const m = guild.tbd_matches.filter((m) => m.id === match.id)[0]

        await app.prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            tbd_matches: {
              delete: {
                id: m.id
              }
            }
          }
        })
      }
    }
  }
}

const sendLolMatches = async(app: App) => {
  const res = await service.getMatches('lol')
  const res2 = await service.getResults('lol')

  if(!res || !res.length) return

  const guilds = await app.prisma.guild.findMany({
    include: {
      events: {
        where: {
          type: 'lol'
        }
      },
      key: true,
      tbd_matches: {
        where: {
          type: 'lol'
        }
      }
    }
  })

  if(!guilds.length) return

  for(const guild of guilds) {
    const matches: {
      matchId: string
      guildId: string
      channel: string
      type: $Enums.EventType
    }[] = []

    if(guild.lol_matches.length && !res2.some(d => d.id === guild.lol_matches[guild.lol_matches.length - 1])) continue

    guild.lol_matches = []

    let data: MatchesData[]

    if(guild.events.length > 5 && !guild.key) {
      data = res.filter(d => guild.events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
    }

    else data = res.filter(d => guild.events.some(e => e.name === d.tournament.name))

    for(const e of guild.events) {
      const channel = await app.channels.fetch(e.channel1)
      if(!channel || channel.type !== ChannelType.GuildText) continue

      try {
        const messages = await channel.messages.fetch({ limit: 100 })
        const messagesIds = messages.filter(m => m.author.id === app.user?.id).map(m => m.id)
        if(messagesIds.length) {
          await channel.bulkDelete(messagesIds)
        }
      }
      catch { }
    }

    try {
      for(
        const d of data.map(body => ({
          ...body,
          when: new Date(body.when)
        }))
      ) {
        if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue

        for(const e of guild.events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji

            const index = guild.lol_matches.findIndex((m) => m === d.id)

            if(index > -1) guild.lol_matches.splice(index, 1)

            if(!d.stage.toLowerCase().includes('showmatch')) guild.lol_matches.push(d.id!)

            const embed = new EmbedBuilder()
              .setAuthor({
                iconURL: d.tournament.image,
                name: d.tournament.full_name!
              })
              .setField(`${emoji1} ${d.teams[0].name} <:versus:1349105624180330516> ${d.teams[1].name} ${emoji2}`, `<t:${d.when.getTime() / 1000}:F> | <t:${d.when.getTime() / 1000}:R>`, true)
              .setFooter({
                text: d.stage
              })

            const button = new ButtonBuilder()
              .setLabel(t(guild.lang, 'helper.palpitate'))
              .setCustomId(`predict;lol;${d.id}`)
              .defineStyle('green')

            if(d.stage.toLowerCase().includes('showmatch')) continue

            const channel = await app.channels.fetch(e.channel1)

            if(!channel || channel.type !== ChannelType.GuildText) continue

            if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await channel.send({
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang, 'helper.bet'))
                      .setCustomId(`bet;lol;${d.id}`)
                      .defineStyle('gray'),
                    new ButtonBuilder()
                      .setLabel(t(guild.lang, 'helper.pickem.label'))
                      .defineStyle('blue')
                      .setCustomId('pickem')
                  ]
                }
              ]
            }).catch(() => { })

            else {
              matches.push({
                matchId: d.id!,
                channel: e.channel1,
                guildId: guild.id,
                type: 'lol'
              })
            }

            break
          }
        }
      }
    }
    catch { }

    await app.prisma.guild.update({
      where: {
        id: guild.id
      },
      data: {
        lol_matches: guild.lol_matches,
        tbd_matches: {
          deleteMany: {
            type: 'lol'
          },
          create: matches.map(m => ({
            type: m.type,
            matchId: m.matchId,
            channel: m.channel
          }))
        },
        live_messages: {
          deleteMany: {}
        }
      }
    })
  }
}

const sendLolTBDMatches = async(app: App) => {
  const res = await service.getMatches('lol')

  if(!res || !res.length) return

  const guilds = await app.prisma.guild.findMany({
    include: {
      tbd_matches: {
        where: {
          type: 'lol'
        }
      }
    }
  })

  if(!guilds.length) return

  for(const guild of guilds) {
    if(!guild.tbd_matches.length) continue

    for(const match of guild.tbd_matches) {
      const data = res
        .map(d => ({
          ...d,
          when: new Date(d.when)
        }))
        .find(d => d.id === match.id)

      if(!data) continue

      if(data.teams[0].name !== 'TBD' && data.teams[1].name !== 'TBD') {
        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji

        const channel = await app.channels.fetch(match.channel) as TextChannel

        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.full_name!,
            iconURL: data.tournament.image
          })
          .setField(`${emoji1} ${data.teams[0].name} <:versus:1349105624180330516> ${data.teams[1].name} ${emoji2}`, `<t:${data.when.getTime() / 1000}:F> | <t:${data.when.getTime() / 1000}:R>`, true)
          .setFooter({ text: data.stage })

        await channel.send({
          embeds: [embed],
          components: [
            {
              type: 1,
              components: [
                new ButtonBuilder()
                  .setLabel(t(guild.lang, 'helper.palpitate'))
                  .setCustomId(`predict;lol;${match.id}`)
                  .defineStyle('green'),
                new ButtonBuilder()
                  .setLabel(t(guild.lang, 'helper.bet'))
                  .setCustomId(`bet;lol;${data.id}`)
                  .defineStyle('gray')
              ]
            }
          ]
        })
          .catch(() => { })

        const m = guild.tbd_matches.filter((m) => m.id === match.id)[0]

        await app.prisma.guild.update({
          where: {
            id: guild.id
          },
          data: {
            tbd_matches: {
              delete: {
                id: m.id
              }
            }
          }
        })
      }
    }
  }
}
const runInBatches = async(app: App, tasks: any[], batch_size: number) => {
  for(let i = 0;i < tasks.length;i += batch_size) {
    const batch = tasks.slice(i, i + batch_size)

    await Promise.all(batch.map(task => task(app).catch((e: Error) => new Logger(app).error(e))))
  }
}
const runTasks = async(app: App) => {
  const tasks = [
    sendValorantMatches,
    sendValorantTBDMatches,
    sendLolMatches,
    sendLolTBDMatches
  ]

  await runInBatches(app, tasks, 2)

  setTimeout(async() => await runTasks(app), process.env.INTERVAL ?? 5 * 60 * 1000)
}

export default createListener({
  name: 'clientReady',
  async run(app) {
    Logger.send(`${app.user?.tag} online on Shard ${app.shard?.ids}!`)

    if(app.user?.id !== '1235576817683922954') {
      app.user?.setStatus('dnd')
    }

    else {
      app.user.setActivity({
        name: 'status',
        state: `[Shard ${app.shard?.ids}] Join support server! Link on about me`,
        type: 4
      })
    }

    await app.postCommands()

    app.queue.process('reminder', async job => {
      const user = await SabineUser.fetch(job.data.user)

      if(!user) return

      if(
        !user.remind ||
        user.reminded ||
        !user.remind_in
      ) return

      const channel = await app.channels.fetch(job.data.channel) as TextChannel

      await channel.send(t(user.lang, 'helper.reminder', { user: `<@${user.id}>` }))

      user.reminded = true

      await user.save()
    })
      .catch(e => new Logger(app).error(e))

    await runTasks(app)
  }
})