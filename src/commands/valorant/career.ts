import { ApplicationCommandOptionTypes, ComponentInteraction } from "oceanic.js"
import createCommand from "../../structures/command/createCommand.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.js"

export default createCommand({
  name: "career",
  nameLocalizations: {
    "pt-BR": "carreira"
  },
  description: "See your career",
  descriptionLocalizations: {
    "pt-BR": "Veja sua carreira"
  },
  category: "simulator",
  options: [
    {
      type: ApplicationCommandOptionTypes.INTEGER,
      name: "page",
      nameLocalizations: {
        "pt-BR": "página"
      },
      description: "Insert a number page",
      descriptionLocalizations: {
        "pt-BR": "Insira o número de uma página"
      }
    }
  ],
  async run({ ctx, locale }) {
    let career = ctx.db.user.career.reverse()
    let page = Number(ctx.args[0] ?? "1")
    let pages = Math.ceil(career.length / 5)
    if(page === 1 || page < 1) {
      career = career.slice(0, 5)
    }
    else {
      career = career.slice(page * 5 - 5, page * 5)
    }
    if(!career.length) {
      return await ctx.reply("commands.career.no_pages")
    }
    let content = locale(
      "commands.career.embed.desc",
      {
        wins: ctx.db.user.wins,
        defeats: ctx.db.user.defeats,
        total: ctx.db.user.career.length
      }
    ) + "\n\n"
    const embed = new EmbedBuilder()
    .setAuthor({
      name: locale("commands.career.embed.author"),
      iconURL: ctx.interaction.user.avatarURL()
    })
    .setFooter({
      text: locale("commands.career.embed.footer", {
        page: page < 1 ? 1 : page,
        pages
      })
    })
    for(const match of career) {
      content += `**<@${match.teams[0].user}> ${match.teams[0].score} <:versus:1349105624180330516> ${match.teams[1].score} <@${match.teams[1].user}>**\n`
    }
    embed.setDesc(content)
    const previous = new ButtonBuilder()
    .setStyle("gray")
    .setEmoji("◀️")
    .setCustomId(`career;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous`)
    const next = new ButtonBuilder()
    .setStyle("gray")
    .setEmoji("▶")
    .setCustomId(`career;${ctx.interaction.user.id};${page + 1 > pages ? pages : page + 1};next`)
    if(page <= 1) {
      previous.setDisabled()
    }
    if(page >= pages) {
      next.setDisabled()
    }
    await ctx.reply(embed.build({
      components: [
        {
          type: 1,
          components: [previous, next]
        }
      ]
    }))
  },
  async createInteraction({ ctx, locale }) {
    await (ctx.interaction as ComponentInteraction).deferUpdate()
    let career = ctx.db.user.career.reverse()
    let page = Number(ctx.args[2])
    let pages = Math.ceil(career.length / 5)
    if(page === 1 || page < 1) {
      career = career.slice(0, 5)
    }
    else {
      career = career.slice(page * 5 - 5, page * 5)
    }
    if(!career.length) {
      return await ctx.reply("commands.career.no_pages")
    }
    let content = locale(
      "commands.career.embed.desc",
      {
        wins: ctx.db.user.wins,
        defeats: ctx.db.user.defeats,
        total: ctx.db.user.career.length
      }
    ) + "\n\n"
    const embed = new EmbedBuilder()
    .setAuthor({
      name: locale("commands.career.embed.author"),
      iconURL: ctx.interaction.user.avatarURL()
    })
    .setFooter({
      text: locale("commands.career.embed.footer", {
        page: page < 1 ? 1 : page,
        pages
      })
    })
    for(const match of career) {
      content += `**<@${match.teams[0].user}> ${match.teams[0].score} <:versus:1349105624180330516> ${match.teams[1].score} <@${match.teams[1].user}>**\n`
    }
    embed.setDesc(content)
    const previous = new ButtonBuilder()
    .setStyle("gray")
    .setEmoji("◀️")
    .setCustomId(`career;${ctx.interaction.user.id};${page - 1};previous`)
    const next = new ButtonBuilder()
    .setStyle("gray")
    .setEmoji("▶")
    .setCustomId(`career;${ctx.interaction.user.id};${page + 1};next`)
    if(page <= 1) {
      previous.setDisabled()
    }
    if(page >= pages) {
      next.setDisabled()
    }
    await ctx.edit(embed.build({
      components: [
        {
          type: 1,
          components: [previous, next]
        }
      ]
    }))
  }
})