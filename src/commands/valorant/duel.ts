import { ApplicationCommandOptionTypes } from "oceanic.js"
import ValorantMatch from "../../simulator/valorant/ValorantMatch.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"
import createCommand from "../../structures/command/createCommand.js"
import { User } from "../../database/index.js"

const users: {[key: string]: boolean} = {}

export default createCommand({
  name: "duel",
  nameLocalizations: {
    "pt-BR": "confronto"
  },
  category: "simulator",
  description: "Start a duel with someone",
  descriptionLocalizations: {
    "pt-BR": "Inicia um confronto com alguém"
  },
  options: [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: "user",
      nameLocalizations: {
        "pt-BR": "usuario"
      },
      description: "Insert a user",
      descriptionLocalizations: {
        "pt-BR": "Insira um usuário"
      },
      required: true
    }
  ],
  async run({ ctx, client, locale }) {
    const user = await User.get(ctx.args[0])
    if(!ctx.db.user.team.name || !ctx.db.user.team.tag) {
      return ctx.reply("commands.duel.needed_team_name")
    }
    if(ctx.db.user.roster.active.length < 5) {
      return ctx.reply("commands.duel.team_not_completed_1")
    }
    if(!user || user.roster.active.length < 5) {
      return ctx.reply("commands.duel.team_not_completed_2")
    }
    if(!user.team.name || !user.team.tag) {
      return ctx.reply("commands.duel.needed_team_name_2")
    }
    if(users[ctx.interaction.user.id]) {
      return ctx.reply("commands.duel.already_in_match")
    }
    if(users[user.id]) {
      return ctx.reply("commands.already_in_match_2")
    }
    const match = new ValorantMatch({
      __teams: [
        {
          roster: ctx.db.user.roster.active,
          user: {
            name: client.users.get(ctx.db.user.id)!.username,
            id: ctx.db.user.id
          },
          name: ctx.db.user.team.name,
          tag: ctx.db.user.team.tag
        },
        {
          roster: user.roster.active,
          user: {
            name: client.users.get(user.id)!.username,
            id: user.id
          },
          name: user.team.name,
          tag: user.team.tag
        }
      ],
      ctx,
      locale: ctx.db.user.lang ?? ctx.db.guild.lang
    })
    const embed = new EmbedBuilder()
    .setTitle(`${match.__teams[0].name} 0 <:versus:1349105624180330516> 0 ${match.__teams[1].name}`)
    .setDesc(locale("commands.duel.started"))
    match.setContent(embed.description + "\n")
    ctx.reply(embed.build())
    try {
      while(!match.finished) {
        users[ctx.interaction.user.id] = true
        users[user.id] = true
        await match.wait(2000)
        await match.startRound()
      }
    }
    finally {
      delete users[ctx.interaction.user.id]
      delete users[user.id]
    }
  }
})