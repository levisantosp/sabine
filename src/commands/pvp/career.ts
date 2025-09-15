import { ApplicationCommandOptionTypes } from "oceanic.js"
import createCommand from "../../structures/command/createCommand.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"

export default createCommand({
  name: "career",
  nameLocalizations: {
    "pt-BR": "carreira"
  },
  description: "See your career",
  descriptionLocalizations: {
    "pt-BR": "Veja sua carreira"
  },
  category: "economy",
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
  userInstall: true,
  messageComponentInteractionTime: 5 * 60 * 1000,
  async run({ ctx, t, client }) {
    const matches = await client.prisma.match.findMany({
      where: {
        userId: ctx.db.user.id
      },
      include: {
        teams: true
      }
    })
    let career = matches.sort((a, b) => b.when.getTime() - a.when.getTime())
    const page = Number(ctx.args[0] ?? "1")
    const pages = Math.ceil(career.length / 10)
    if(page === 1 || page < 1) {
      career = career.slice(0, 10)
    }
    else {
      career = career.slice(page * 10 - 10, page * 10)
    }
    if(!career.length) {
      return await ctx.reply("commands.career.no_pages")
    }
    const ranked_wins = ctx.db.user.ranked_wins
    const unranked_defeats = ctx.db.user.unranked_defeats
    const unranked_wins = ctx.db.user.unranked_wins
    const ranked_swiftplay_wins = ctx.db.user.ranked_swiftplay_wins
    const swiftplay_wins = ctx.db.user.swiftplay_wins
    const ranked_defeats = ctx.db.user.ranked_defeats
    const ranked_swiftplay_defeats = ctx.db.user.ranked_swiftplay_defeats
    const swiftplay_defeats = ctx.db.user.swiftplay_defeats
    const total_wins = ranked_wins + unranked_wins + swiftplay_wins + ranked_swiftplay_wins
    const total_defeats = ranked_defeats + unranked_defeats + swiftplay_defeats + ranked_swiftplay_defeats
    let content = t(
      "commands.career.embed.desc",
      {
        ranked_wins,
        unranked_wins,
        ranked_swiftplay_wins,
        swiftplay_wins,
        ranked_defeats,
        unranked_defeats,
        ranked_swiftplay_defeats,
        swiftplay_defeats,
        total_wins,
        total_defeats,
        total: matches.length,
        elo: t(`commands.career.elo.${ctx.db.user.elo}`),
        rr: ctx.db.user.rank_rating
      }
    ) + "\n\n"
    const embed = new EmbedBuilder()
    .setAuthor({
      name: t("commands.career.embed.author"),
      iconURL: ctx.interaction.user.avatarURL()
    })
    .setFooter({
      text: t("commands.career.embed.footer", {
        page: page < 1 ? 1 : page,
        pages
      })
    })
    for(const match of career) {
      if(match.mode.toLowerCase().includes("ranked") && match.mode.toLowerCase() !== "unranked")  {
        const timestamp = (match.when.getTime() / 1000).toFixed(0)
        const type = match.winner ? "win" : "defeat"
        content += `- [<t:${timestamp}:d> <t:${timestamp}:t> | <t:${timestamp}:R>] **[${t(`commands.career.mode.${match.mode}`)}]** ${t(`commands.career.type.ranked_${type}`, {
          score: `${match.teams[0].score}-${match.teams[1].score}`,
          user: `<@${match.teams[1].user}>`,
          points: match.points! > 0 ? `+${match.points}` : match.points
        })}\n`
      }
      else {
        const timestamp = (match.when.getTime() / 1000).toFixed(0)
        const type = match.winner ? "win" : "defeat"
        content += `- [<t:${timestamp}:d> <t:${timestamp}:t> | <t:${timestamp}:R>] **[${t(`commands.career.mode.${match.mode}`)}]** ${t(`commands.career.type.unranked_${type}`, {
          score: `${match.teams[0].score}-${match.teams[1].score}`,
          user: `<@${match.teams[1].user}>`
        })}\n`
      }
    }
    embed.setDesc(content)
    const previous = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176223621611572")
    .setCustomId(`career;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous`)
    const next = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176291829121028")
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
  async createMessageComponentInteraction({ ctx, t, client }) {
    const matches = await client.prisma.match.findMany({
      where: {
        userId: ctx.db.user.id
      },
      include: {
        teams: true
      }
    })
    let career = matches.sort((a, b) => b.when.getTime() - a.when.getTime())
    const page = Number(ctx.args[2])
    const pages = Math.ceil(career.length / 10)
    if(page === 1 || page < 1) {
      career = career.slice(0, 10)
    }
    else {
      career = career.slice(page * 10 - 10, page * 10)
    }
    if(!career.length) {
      return await ctx.reply("commands.career.no_pages")
    }
    const ranked_wins = ctx.db.user.ranked_wins
    const unranked_defeats = ctx.db.user.unranked_defeats
    const unranked_wins = ctx.db.user.unranked_wins
    const ranked_swiftplay_wins = ctx.db.user.ranked_swiftplay_wins
    const swiftplay_wins = ctx.db.user.swiftplay_wins
    const ranked_defeats = ctx.db.user.ranked_defeats
    const ranked_swiftplay_defeats = ctx.db.user.ranked_swiftplay_defeats
    const swiftplay_defeats = ctx.db.user.swiftplay_defeats
    const total_wins = ranked_wins + unranked_wins + swiftplay_wins + ranked_swiftplay_wins
    const total_defeats = ranked_defeats + unranked_defeats + swiftplay_defeats + ranked_swiftplay_defeats
    let content = t(
      "commands.career.embed.desc",
      {
        ranked_wins,
        unranked_wins,
        ranked_swiftplay_wins,
        swiftplay_wins,
        ranked_defeats,
        unranked_defeats,
        ranked_swiftplay_defeats,
        swiftplay_defeats,
        total_wins,
        total_defeats,
        total: matches.length,
        elo: t(`commands.career.elo.${ctx.db.user.elo}`),
        rr: ctx.db.user.rank_rating
      }
    ) + "\n\n"
    const embed = new EmbedBuilder()
    .setAuthor({
      name: t("commands.career.embed.author"),
      iconURL: ctx.interaction.user.avatarURL()
    })
    .setFooter({
      text: t("commands.career.embed.footer", {
        page: page < 1 ? 1 : page,
        pages
      })
    })
    for(const match of career) {
      if(match.mode.toLowerCase().includes("ranked") && match.mode.toLowerCase() !== "unranked")  {
        const timestamp = (match.when.getTime() / 1000).toFixed(0)
        const type = match.winner ? "win" : "defeat"
        content += `- [<t:${timestamp}:d> <t:${timestamp}:t> | <t:${timestamp}:R>] **[${t(`commands.career.mode.${match.mode}`)}]** ${t(`commands.career.type.ranked_${type}`, {
          score: `${match.teams[0].score}-${match.teams[1].score}`,
          user: `<@${match.teams[1].user}>`,
          points: match.points! > 0 ? `+${match.points}` : match.points
        })}\n`
      }
      else {
        const timestamp = (match.when.getTime() / 1000).toFixed(0)
        const type = match.winner ? "win" : "defeat"
        content += `- [<t:${timestamp}:d> <t:${timestamp}:t> | <t:${timestamp}:R>] **[${t(`commands.career.mode.${match.mode}`)}]** ${t(`commands.career.type.unranked_${type}`, {
          score: `${match.teams[0].score}-${match.teams[1].score}`,
          user: `<@${match.teams[1].user}>`
        })}\n`
      }
    }
    embed.setDesc(content)
    const previous = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176223621611572")
    .setCustomId(`career;${ctx.interaction.user.id};${page - 1};previous`)
    const next = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176291829121028")
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