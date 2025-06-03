import { CreateApplicationCommandOptions, TextChannel } from "oceanic.js"
import { Guild, GuildSchemaInterface } from "../database/index.js"
import Service from "../api/index.js"
import locales from "../locales/index.js"
import { MatchesData } from "../../types/index.js"
import createListener from "../structures/client/createListener.js"
import Logger from "../structures/util/Logger.js"
import { emojis } from "../structures/util/emojis.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"
import App from "../structures/client/App.js"
const service = new Service(process.env.AUTH)

const delete_guild = async(client: App) => {
  const guilds = await Guild.find()
  for(const guild of guilds) {
    if(!client.guilds.get(guild.id)) {
      await guild.deleteOne()
    }
  }
}
const send_valorant_matches = async(client: App) => {
  const res = await service.getMatches("valorant")
  if(!res || !res.length) return
  const guilds = await Guild.find({
    events: {
      $ne: []
    }
  }) as GuildSchemaInterface[]
  if(!guilds.length) return
  const res2 = await service.getResults("valorant")
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
        let messages = await client.rest.channels.getMessages(e.channel1, { limit: 100 })
        let messagesIds = messages.filter(m => m.author.id === client.user.id).map(m => m.id)
        if(messagesIds.length) {
          client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
        }
      }
      catch { }
    }
    try {
      for(const d of data) {
        if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
        for(const e of guild.valorant_events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            let index = guild.valorant_matches.findIndex((m) => m === d.id)
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
              .setLabel(locales(guild.lang, "helper.palpitate"))
              .setCustomId(`predict;valorant;${d.id}`)
              .setStyle("green")
            const urlButton = new ButtonBuilder()
              .setLabel(locales(guild.lang, "helper.stats"))
              .setStyle("link")
              .setURL(`https://vlr.gg/${d.id}`)
            if(d.stage.toLowerCase().includes("showmatch")) continue
            if(d.teams[0].name !== "TBD" && d.teams[1].name !== "TBD") await client.rest.channels.createMessage(e.channel1, {
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    button, urlButton,
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
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
    catch { }
    await guild.save()
  }
}
const send_valorant_TBD_matches = async(client: App) => {
  const res = await service.getMatches("valorant")
  if(!res || !res.length) return
  const guilds = await Guild.find({
    valorant_tbd_matches: {
      $ne: []
    }
  }) as GuildSchemaInterface[]
  if(!guilds.length) return
  for(const guild of guilds) {
    if(!guild.valorant_tbd_matches.length) continue
    for(const match of guild.valorant_tbd_matches) {
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
                  .setLabel(locales(guild.lang, "helper.palpitate"))
                  .setCustomId(`predict;valorant;${match.id}`)
                  .setStyle("green"),
                new ButtonBuilder()
                  .setLabel(locales(guild.lang, "helper.stats"))
                  .setStyle("link")
                  .setURL(`https://vlr.gg/${data.id}`)
              ]
            }
          ]
        })
          .catch(() => { })
        let index = guild.valorant_tbd_matches.findIndex((m) => m.id === match.id)
        guild.valorant_tbd_matches.splice(index, 1)
        await guild.save()
      }
    }
  }
}
const send_lol_matches = async(client: App) => {
  const res = await service.getMatches("lol")
  const res2 = await service.getResults("lol")

  if(!res || !res.length) return

  const guilds = await Guild.find({
    lol_events: {
      $ne: []
    }
  }) as GuildSchemaInterface[]

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
        let messages = await client.rest.channels.getMessages(e.channel1, { limit: 100 })
        let messagesIds = messages.filter(m => m.author.id === client.user.id).map(m => m.id)
        if(messagesIds.length) {
          client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
        }
      }
      catch { }
    }
    try {
      for(const d of data) {
        if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
        for(const e of guild.lol_events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            let index = guild.lol_matches.findIndex((m) => m === d.id)
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
              .setLabel(locales(guild.lang, "helper.palpitate"))
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
                      .setLabel(locales(guild.lang, "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
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
    catch { }
    await guild.save()
  }
}
const send_lol_tbd_matches = async(client: App) => {
  const res = await service.getMatches("lol")
  if(!res || !res.length) return
  const guilds = await Guild.find({
    lol_tbd_matches: {
      $ne: []
    }
  }) as GuildSchemaInterface[]
  if(!guilds.length) return
  for(const guild of guilds) {
    if(!guild.lol_tbd_matches.length) continue
    for(const match of guild.lol_tbd_matches) {
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
                  .setLabel(locales(guild.lang, "helper.palpitate"))
                  .setCustomId(`predict;lol;${match.id}`)
                  .setStyle("green"),
                new ButtonBuilder()
                  .setLabel(locales(guild.lang, "helper.stats"))
                  .setStyle("link")
                  .setURL(`https://loltv.gg/match/${data.id}`)
              ]
            }
          ]
        })
          .catch(() => { })
        let index = guild.lol_tbd_matches.findIndex((m) => m.id === match.id)
        guild.lol_tbd_matches.splice(index, 1)
        await guild.save()
      }
    }
  }
}
const run_in_batches = async(client: App, tasks: any[], batch_size: number) => {
  for(let i = 0;i < tasks.length;i += batch_size) {
    const batch = tasks.slice(i, i + batch_size)
    await Promise.all(batch.map(task => task(client).catch((e: Error) => new Logger(client).error(e))))
  }
}
const run_tasks = async(client: App) => {
  const tasks = [
    delete_guild,
    send_valorant_matches,
    send_valorant_TBD_matches,
    send_lol_matches,
    send_lol_tbd_matches
  ]
  await run_in_batches(client, tasks, 2)
  setTimeout(async() => await run_tasks(client), process.env.INTERVAL ?? 5 * 60 * 1000)
}

export default createListener({
  name: "ready",
  async run(client) {
    Logger.send(`${client.user.tag} online!`)
    if(client.user.id !== "1235576817683922954") {
      client.editStatus("dnd", [
        {
          name: "status",
          state: "Join support server! Link on about me",
          type: 4
        }
      ])
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
    const commands: CreateApplicationCommandOptions[] = []
    client.commands.forEach(cmd => {
      commands.push({
        name: cmd.name,
        nameLocalizations: cmd.nameLocalizations,
        description: cmd.description,
        descriptionLocalizations: cmd.descriptionLocalizations,
        options: cmd.options,
        type: 1
      })
    })
    await client.application.bulkEditGlobalCommands(commands)
    await run_tasks(client)
  }
})