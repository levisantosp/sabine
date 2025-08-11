import type { TextChannel } from 'oceanic.js'
import Service from '../api/index.ts'
import t from '../locales/index.ts'
import type { MatchesData } from '../types.ts'
import createListener from '../structures/client/createListener.ts'
import Logger from '../util/Logger.ts'
import { emojis } from '../util/emojis.ts'
import EmbedBuilder from '../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../structures/builders/ButtonBuilder.ts'
import App from '../structures/client/App.ts'
import { PrismaClient } from '@prisma/client'
const service = new Service(process.env.AUTH)

const prisma = new PrismaClient()
const sendValorantMatches = async(client: App) => {
  const res = await service.getMatches('valorant')
  if(!res || !res.length) return
  const guilds = await prisma.guilds.findMany()
  if(!guilds.length) return
  const res2 = await service.getResults('valorant')
  for(const guild of guilds) {
    if(guild.valorant_matches.length && !res2.some(d => d.id === guild.valorant_matches[guild.valorant_matches.length - 1])) continue
    guild.valorant_matches = []
    let data: MatchesData[]
    if(guild.valorant_events.length > 5 && !guild.key) {
      data = res.filter(d => guild.valorant_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
    }
    else data = res.filter(d => guild.valorant_events.some(e => e.name === d.tournament.name))
    for(const e of guild.valorant_events) {
      if(!client.getChannel(e.channel1)) continue
      try {
        const messages = await client.rest.channels.getMessages(e.channel1, { limit: 100 })
        const messagesIds = messages.filter(m => m.author.id === client.user.id).map(m => m.id)
        if(messagesIds.length) {
          client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
        }
      }
      catch{ }
    }
    try {
      for(const d of data) {
        if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
        for(const e of guild.valorant_events) {
          if(e.name === d.tournament.name) {
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
              .setField(`${emoji1} ${d.teams[0].name} <:versus:1349105624180330516> ${d.teams[1].name} ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`, true)
              .setFooter({
                text: d.stage
              })
            const button = new ButtonBuilder()
              .setLabel(t(guild.lang ?? 'en', 'helper.palpitate'))
              .setCustomId(`predict;valorant;${d.id}`)
              .setStyle('green')
            const urlButton = new ButtonBuilder()
              .setLabel(t(guild.lang ?? 'en', 'helper.stats'))
              .setStyle('link')
              .setURL(`https://vlr.gg/${d.id}`)
            if(d.stage.toLowerCase().includes('showmatch')) continue
            if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await client.rest.channels.createMessage(e.channel1, {
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? 'en', 'helper.bet'))
                      .setCustomId(`bet;valorant;${d.id}`)
                      .setStyle('gray'),
                    urlButton,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? 'en', 'helper.pickem.label'))
                      .setStyle('blue')
                      .setCustomId('pickem')
                  ]
                }
              ]
            }).catch(() => { })
            else {
              guild.valorant_tbd_matches.push({
                id: d.id!,
                channel: e.channel1
              })
            }
          }
        }
      }
    }
    catch{ }
    await prisma.guilds.update({
      where: {
        id: guild.id
      },
      data: {
        valorant_matches: guild.valorant_matches,
        valorant_tbd_matches: guild.valorant_tbd_matches
      }
    })
  }
}
const sendValorantTBDMatches = async(client: App) => {
  const res = await service.getMatches('valorant')
  if(!res || !res.length) return
  const guilds = await prisma.guilds.findMany()
  if(!guilds.length) return
  for(const guild of guilds) {
    if(!guild.valorant_tbd_matches.length) continue
    for(const match of guild.valorant_tbd_matches) {
      const data = res.find(d => d.id === match.id)
      if(!data) continue
      if(data.teams[0].name !== 'TBD' && data.teams[1].name !== 'TBD') {
        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
        const channel = client.getChannel(match.channel) as TextChannel
        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.name,
            iconURL: data.tournament.image
          })
          .setField(`${emoji1} ${data.teams[0].name} <:versus:1349105624180330516> ${data.teams[1].name} ${emoji2}`, `<t:${data.when / 1000}:F> | <t:${data.when / 1000}:R>`, true)
          .setFooter({ text: data.stage })
        channel.createMessage({
          embeds: [embed],
          components: [
            {
              type: 1,
              components: [
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? 'en', 'helper.palpitate'))
                  .setCustomId(`predict;valorant;${match.id}`)
                  .setStyle('green'),
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? 'en', 'helper.bet'))
                  .setCustomId(`bet;valorant;${data.id}`)
                  .setStyle('gray'),
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? 'en', 'helper.stats'))
                  .setStyle('link')
                  .setURL(`https://vlr.gg/${data.id}`)
              ]
            }
          ]
        })
        .catch(() => {})
        const index = guild.valorant_tbd_matches.findIndex((m) => m.id === match.id)
        guild.valorant_tbd_matches.splice(index, 1)
        await prisma.guilds.update({
          where: {
            id: guild.id
          },
          data: {
            valorant_tbd_matches: guild.valorant_tbd_matches
          }
        })
      }
    }
  }
}
const sendLolMatches = async(client: App) => {
  const res = await service.getMatches('lol')
  const res2 = await service.getResults('lol')
  if(!res || !res.length) return
  const guilds = await prisma.guilds.findMany()
  if(!guilds.length) return
  for(const guild of guilds) {
    if(guild.lol_matches.length && !res2.some(d => d.id === guild.lol_matches[guild.lol_matches.length - 1])) continue
    guild.lol_matches = []
    let data: MatchesData[]
    if(guild.lol_events.length > 5 && !guild.key) {
      data = res.filter(d => guild.lol_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
    }
    else data = res.filter(d => guild.lol_events.some(e => e.name === d.tournament.name))
    for(const e of guild.lol_events) {
      if(!client.getChannel(e.channel1)) continue
      try {
        const messages = await client.rest.channels.getMessages(e.channel1, { limit: 100 })
        const messagesIds = messages.filter(m => m.author.id === client.user.id).map(m => m.id)
        if(messagesIds.length) {
          client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
        }
      }
      catch{}
    }
    try {
      for(const d of data) {
        if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
        for(const e of guild.lol_events) {
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
              .setField(`${emoji1} ${d.teams[0].name} <:versus:1349105624180330516> ${d.teams[1].name} ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`, true)
              .setFooter({
                text: d.stage
              })
            const button = new ButtonBuilder()
              .setLabel(t(guild.lang ?? 'en', 'helper.palpitate'))
              .setCustomId(`predict;lol;${d.id}`)
              .setStyle('green')
            if(d.stage.toLowerCase().includes('showmatch')) continue
            if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await client.rest.channels.createMessage(e.channel1, {
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? 'en', 'helper.bet'))
                      .setCustomId(`bet;lol;${d.id}`)
                      .setStyle('gray'),
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? 'en', 'helper.pickem.label'))
                      .setStyle('blue')
                      .setCustomId('pickem')
                  ]
                }
              ]
            }).catch(() => { })
            else {
              guild.lol_tbd_matches.push({
                id: d.id!,
                channel: e.channel1
              })
            }
          }
        }
      }
    }
    catch{ }
    await prisma.guilds.update({
      where: {
        id: guild.id
      },
      data: {
        lol_matches: guild.lol_matches,
        lol_tbd_matches: guild.lol_tbd_matches
      }
    })
  }
}
const sendLolTBDMatches = async(client: App) => {
  const res = await service.getMatches('lol')
  if(!res || !res.length) return
  const guilds = await prisma.guilds.findMany()
  if(!guilds.length) return
  for(const guild of guilds) {
    if(!guild.lol_tbd_matches.length) continue
    for(const match of guild.lol_tbd_matches) {
      const data = res.find(d => d.id === match.id)
      if(!data) continue
      if(data.teams[0].name !== 'TBD' && data.teams[1].name !== 'TBD') {
        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
        const channel = client.getChannel(match.channel) as TextChannel
        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.full_name!,
            iconURL: data.tournament.image
          })
          .setField(`${emoji1} ${data.teams[0].name} <:versus:1349105624180330516> ${data.teams[1].name} ${emoji2}`, `<t:${data.when / 1000}:F> | <t:${data.when / 1000}:R>`, true)
          .setFooter({ text: data.stage })
        channel.createMessage({
          embeds: [embed],
          components: [
            {
              type: 1,
              components: [
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? 'en', 'helper.palpitate'))
                  .setCustomId(`predict;lol;${match.id}`)
                  .setStyle('green'),
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? 'en', 'helper.bet'))
                  .setCustomId(`bet;lol;${data.id}`)
                  .setStyle('gray')
              ]
            }
          ]
        })
          .catch(() => { })
        const index = guild.lol_tbd_matches.findIndex((m) => m.id === match.id)
        guild.lol_tbd_matches.splice(index, 1)
        await prisma.guilds.update({
          where: {
            id: guild.id
          },
          data: {
            lol_tbd_matches: guild.lol_tbd_matches
          }
        })
      }
    }
  }
}
const remindUsers = async(client: App) => {
  const users = await client.prisma.users.findMany({
    where: {
      remind: {
        not: false
      },
      reminded: {
        not: true
      },
      remindIn: {
        not: null
      },
      claim_time: {
        lte: Date.now()
      }
    }
  })
  for(const user of users) {
    if(!user.remindIn) continue
    const channel = await client.rest.channels.get(user.remindIn) as TextChannel
    await channel.createMessage({
      content: t(user.lang, 'helper.reminder', { user: `<@${user.id}>` })
    })
    await client.prisma.users.update({
      where: {
        id: user.id
      },
      data: {
        reminded: true
      }
    })
  }
  setTimeout(async() => await remindUsers(client), 60 * 1000)
}
const runInBatches = async(client: App, tasks: any[], batch_size: number) => {
  for(let i = 0;i < tasks.length;i += batch_size) {
    const batch = tasks.slice(i, i + batch_size)
    await Promise.all(batch.map(task => task(client).catch((e: Error) => new Logger(client).error(e))))
  }
}
const runTasks = async(client: App) => {
  const tasks = [
    sendValorantMatches,
    sendValorantTBDMatches,
    sendLolMatches,
    sendLolTBDMatches
  ]
  await runInBatches(client, tasks, 2)
  setTimeout(async() => await runTasks(client), process.env.INTERVAL ?? 5 * 60 * 1000)
}

export default createListener({
  name: 'ready',
  async run(client) {
    Logger.send(`${client.user.tag} online!`)
    if(client.user.id !== '1235576817683922954') {
      client.editStatus('dnd')
    }
    else {
      client.editStatus('online', [
        {
          name: 'status',
          state: 'Join support server! Link on about me',
          type: 4
        }
      ])
    }
    await client.bulkEditGlobalCommands()
    await remindUsers(client)
    await runTasks(client)
  }
})