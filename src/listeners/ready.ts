import type { TextChannel } from "oceanic.js"
import Service from "../api/index.ts"
import t from "../locales/index.ts"
import type { MatchesData } from "../types.ts"
import createListener from "../structures/client/createListener.ts"
import Logger from "../util/Logger.ts"
import { emojis } from "../util/emojis.ts"
import EmbedBuilder from "../structures/builders/EmbedBuilder.ts"
import ButtonBuilder from "../structures/builders/ButtonBuilder.ts"
import App from "../structures/client/App.ts"
import { PrismaClient } from "@prisma/client"
import { SabineUser } from "../database/index.ts"
const service = new Service(process.env.AUTH)

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
const sendValorantMatches = async(client: App) => {
  const res = await service.getMatches("valorant")
  const res2 = await service.getResults("valorant")
  if(!res || !res.length) return
  const guilds = await prisma.guild.findMany({
    include: {
      events: {
        where: {
          type: "valorant"
        }
      },
      key: true,
      tbd_matches: {
        where: {
          type: "valorant"
        }
      }
    }
  })
  if(!guilds.length) return
  for(const guild of guilds) {
    const matches: typeof guild.tbd_matches = []
    if(
      guild.valorant_matches.length &&
      !res2.some(d => d.id === guild.valorant_matches[guild.valorant_matches.length - 1])
    ) continue
    guild.valorant_matches = []
    let data: MatchesData[]
    if(guild.events.length > 5 && !guild.key) {
      if(guild.events.slice().reverse().slice(0, 5).some(e => Object.keys(tournaments).includes(e.name))) {
        data = res.filter(d =>
          guild.events.some(e => {
            const tour = tournaments[e.name]
            if(!tour) return false
            return tour.some(regex =>
              regex.test(d.tournament.name.replace(/\s+/g, " ").trim().toLowerCase())
            )
          })
        )
      }
      else data = res.filter(d => guild.events.slice().reverse().slice(0, 5).some(e => e.name === d.tournament.name))
    }
    else {
      if(guild.events.some(e => Object.keys(tournaments).includes(e.name))) {
        data = res.filter(d =>
          guild.events.some(e => {
            const tour = tournaments[e.name]
            if(!tour) return false
            return tour.some(regex =>
              regex.test(d.tournament.name.replace(/\s+/g, " ").trim().toLowerCase())
            )
          })
        )
      }
      else data = res.filter(d => guild.events.some(e => e.name === d.tournament.name))
    }
    if(!data.length) continue
    for(const e of guild.events) {
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
        for(const e of guild.events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const index = guild.valorant_matches.findIndex((m) => m === d.id)
            if(index > -1) guild.valorant_matches.splice(index, 1)
            if(!d.stage.toLowerCase().includes("showmatch")) guild.valorant_matches.push(d.id!)
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
              .setLabel(t(guild.lang ?? "en", "helper.palpitate"))
              .setCustomId(`predict;valorant;${d.id}`)
              .setStyle("green")
            const urlButton = new ButtonBuilder()
              .setLabel(t(guild.lang ?? "en", "helper.stats"))
              .setStyle("link")
              .setURL(`https://vlr.gg/${d.id}`)
            if(d.stage.toLowerCase().includes("showmatch")) continue
            if(d.teams[0].name !== "TBD" && d.teams[1].name !== "TBD") await client.rest.channels.createMessage(e.channel1, {
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? "en", "helper.bet"))
                      .setCustomId(`bet;valorant;${d.id}`)
                      .setStyle("gray"),
                    urlButton,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? "en", "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }).catch(() => { })
            else {
              matches.push({
                id: d.id!,
                channel: e.channel1,
                guildId: guild.id,
                type: "valorant"
              })
            }
          }
          else if(
            tournaments[e.name] &&
            tournaments[e.name].some(regex =>
              regex.test(d.tournament.name.replace(/\s+/g, " ").trim().toLowerCase())
            )
          ) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const index = guild.valorant_matches.findIndex((m) => m === d.id)
            if(index > -1) guild.valorant_matches.splice(index, 1)
            if(!d.stage.toLowerCase().includes("showmatch")) guild.valorant_matches.push(d.id!)
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
              .setLabel(t(guild.lang ?? "en", "helper.palpitate"))
              .setCustomId(`predict;valorant;${d.id}`)
              .setStyle("green")
            const urlButton = new ButtonBuilder()
              .setLabel(t(guild.lang ?? "en", "helper.stats"))
              .setStyle("link")
              .setURL(`https://vlr.gg/${d.id}`)
            if(d.stage.toLowerCase().includes("showmatch")) continue
            if(d.teams[0].name !== "TBD" && d.teams[1].name !== "TBD") await client.rest.channels.createMessage(e.channel1, {
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? "en", "helper.bet"))
                      .setCustomId(`bet;valorant;${d.id}`)
                      .setStyle("gray"),
                    urlButton,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? "en", "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }).catch(() => { })
            else {
              matches.push({
                id: d.id!,
                channel: e.channel1,
                guildId: guild.id,
                type: "valorant"
              })
            }
          }
        }
      }
    }
    catch{ }
    await prisma.guild.update({
      where: {
        id: guild.id
      },
      data: {
        valorant_matches: guild.valorant_matches,
        tbd_matches: {
          create: matches
        },
        live_messages: {
          deleteMany: {}
        }
      }
    })
  }
}
const sendValorantTBDMatches = async(client: App) => {
  const res = await service.getMatches("valorant")
  if(!res || !res.length) return
  const guilds = await prisma.guild.findMany({
    include: {
      tbd_matches: {
        where: {
          type: "valorant"
        }
      }
    }
  })
  if(!guilds.length) return
  for(const guild of guilds) {
    if(!guild.tbd_matches.length) continue
    for(const match of guild.tbd_matches) {
      const data = res.find(d => d.id === match.id)
      if(!data) continue
      if(data.teams[0].name !== "TBD" && data.teams[1].name !== "TBD") {
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
                  .setLabel(t(guild.lang ?? "en", "helper.palpitate"))
                  .setCustomId(`predict;valorant;${match.id}`)
                  .setStyle("green"),
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? "en", "helper.bet"))
                  .setCustomId(`bet;valorant;${data.id}`)
                  .setStyle("gray"),
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? "en", "helper.stats"))
                  .setStyle("link")
                  .setURL(`https://vlr.gg/${data.id}`)
              ]
            }
          ]
        })
        .catch(() => {})
        const m = guild.tbd_matches.filter((m) => m.id === match.id)[0]
        await prisma.guild.update({
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
const sendLolMatches = async(client: App) => {
  const res = await service.getMatches("lol")
  const res2 = await service.getResults("lol")
  if(!res || !res.length) return
  const guilds = await prisma.guild.findMany({
    include: {
      events: {
        where: {
          type: "lol"
        }
      },
      key: true,
      tbd_matches: {
        where: {
          type: "lol"
        }
      }
    }
  })
  if(!guilds.length) return
  for(const guild of guilds) {
    const matches: typeof guild.tbd_matches = []
    if(guild.lol_matches.length && !res2.some(d => d.id === guild.lol_matches[guild.lol_matches.length - 1])) continue
    guild.lol_matches = []
    let data: MatchesData[]
    if(guild.events.length > 5 && !guild.key) {
      data = res.filter(d => guild.events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
    }
    else data = res.filter(d => guild.events.some(e => e.name === d.tournament.name))
    for(const e of guild.events) {
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
        for(const e of guild.events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const index = guild.lol_matches.findIndex((m) => m === d.id)
            if(index > -1) guild.lol_matches.splice(index, 1)
            if(!d.stage.toLowerCase().includes("showmatch")) guild.lol_matches.push(d.id!)
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
              .setLabel(t(guild.lang ?? "en", "helper.palpitate"))
              .setCustomId(`predict;lol;${d.id}`)
              .setStyle("green")
            if(d.stage.toLowerCase().includes("showmatch")) continue
            if(d.teams[0].name !== "TBD" && d.teams[1].name !== "TBD") await client.rest.channels.createMessage(e.channel1, {
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button,
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? "en", "helper.bet"))
                      .setCustomId(`bet;lol;${d.id}`)
                      .setStyle("gray"),
                    new ButtonBuilder()
                      .setLabel(t(guild.lang ?? "en", "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }).catch(() => { })
            else {
              matches.push({
                id: d.id!,
                channel: e.channel1,
                guildId: guild.id,
                type: "lol"
              })
            }
          }
        }
      }
    }
    catch{ }
    await prisma.guild.update({
      where: {
        id: guild.id
      },
      data: {
        lol_matches: guild.lol_matches,
        tbd_matches: {
          create: matches
        },
        live_messages: {
          deleteMany: {}
        }
      }
    })
  }
}
const sendLolTBDMatches = async(client: App) => {
  const res = await service.getMatches("lol")
  if(!res || !res.length) return
  const guilds = await prisma.guild.findMany({
    include: {
      tbd_matches: {
        where: {
          type: "lol"
        }
      }
    }
  })
  if(!guilds.length) return
  for(const guild of guilds) {
    if(!guild.tbd_matches.length) continue
    for(const match of guild.tbd_matches) {
      const data = res.find(d => d.id === match.id)
      if(!data) continue
      if(data.teams[0].name !== "TBD" && data.teams[1].name !== "TBD") {
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
                  .setLabel(t(guild.lang ?? "en", "helper.palpitate"))
                  .setCustomId(`predict;lol;${match.id}`)
                  .setStyle("green"),
                new ButtonBuilder()
                  .setLabel(t(guild.lang ?? "en", "helper.bet"))
                  .setCustomId(`bet;lol;${data.id}`)
                  .setStyle("gray")
              ]
            }
          ]
        })
          .catch(() => { })
        const m = guild.tbd_matches.filter((m) => m.id === match.id)[0]
        await prisma.guild.update({
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
const runInBatches = async(client: App, tasks: any[], batch_size: number) => {
  for(let i = 0; i < tasks.length; i += batch_size) {
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
  name: "ready",
  async run(client) {
    Logger.send(`${client.user.tag} online!`)
    if(client.user.id !== "1235576817683922954") {
      client.editStatus("dnd")
    }
    else {
      client.editStatus("online", [
        {
          name: "status",
          state: "Join support server! Link on about me",
          type: 4
        }
      ])
    }
    await client.bulkEditGlobalCommands()
    client.queue.process("reminder", async job => {
      const user = await SabineUser.fetch(job.data.user)
      if(!user) return
      if(
        !user.remind ||
        user.reminded ||
        !user.remind_in
      ) return
      const channel = client.getChannel(job.data.channel) as TextChannel
      await channel.createMessage({
        content: t(user.lang, "helper.reminder", { user: `<@${user.id}>` })
      })
      user.reminded = true
      await user.save()
    })
    .catch(e => new Logger(client).error(e))
    await runTasks(client)
  }
})