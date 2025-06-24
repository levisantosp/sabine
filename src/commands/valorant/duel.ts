import { ApplicationCommandOptionTypes } from "oceanic.js"
import ValorantMatch from "../../simulator/valorant/ValorantMatch.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import { SabineUser } from "../../database/index.ts"

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
  userInstall: true,
  async run({ ctx, t }) {
    const user = await new SabineUser(ctx.db.user.id).get()
    if(!ctx.db.user.team?.name || !ctx.db.user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name")
    }
    if(!ctx.db.user.roster || ctx.db.user.roster.active.length < 5) {
      return await  ctx.reply("commands.duel.team_not_completed_1")
    }
    if(!user || !user.roster || user.roster.active.length < 5) {
      return await ctx.reply("commands.duel.team_not_completed_2")
    }
    if(!user.team?.name || !user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name_2")
    }
    if(users[ctx.interaction.user.id]) {
      return ctx.reply("commands.duel.already_in_match")
    }
    if(users[user.id]) {
      return ctx.reply("commands.already_in_match_2")
    }
    const button = new ButtonBuilder()
    .setStyle("green")
    .setLabel(t("commands.duel.button"))
    .setCustomId(`duel;${ctx.args[0]};${ctx.interaction.user.id}`)
    await ctx.reply(button.build(t("commands.duel.request", {
      author: ctx.interaction.user.mention,
      opponent: `<@${ctx.args[0]}>`
    })))
  },
  async createInteraction({ ctx, client, t, i }) {
    await i.deferUpdate()
    const user = await new SabineUser(ctx.args[2]).get()
    if(!ctx.db.user.team?.name || !ctx.db.user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name")
    }
    if(!ctx.db.user.roster || ctx.db.user.roster.active.length < 5) {
      return await  ctx.reply("commands.duel.team_not_completed_1")
    }
    if(!user || !user.roster || user.roster.active.length < 5) {
      return await ctx.reply("commands.duel.team_not_completed_2")
    }
    if(!user.team?.name || !user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name_2")
    }
    if(users[ctx.interaction.user.id]) {
      return await ctx.reply("commands.duel.already_in_match")
    }
    if(users[user.id]) {
      return await ctx.reply("commands.already_in_match_2")
    }
    const match = new ValorantMatch({
      __teams: [
        {
          roster: user.roster.active,
          user: {
            name: client.users.get(user.id)!.username,
            id: user.id
          },
          name: user.team.name!,
          tag: user.team.tag!
        },
        {
          roster: ctx.db.user.roster.active,
          user: {
            name: ctx.interaction.user.username,
            id: ctx.db.user.id
          },
          name: ctx.db.user.team.name,
          tag: ctx.db.user.team.tag!
        }
      ],
      ctx,
      locale: ctx.db.user.lang ?? ctx.db.guild.lang
    })
    const embed = new EmbedBuilder()
    .setTitle(`${match.__teams[0].name} 0 <:versus:1349105624180330516> 0 ${match.__teams[1].name}`)
    .setDesc(t("commands.duel.started"))
    match.setContent(embed.description + "\n")
    await ctx.edit(embed.build())
    try {
      while(!match.finished) {
        users[ctx.interaction.user.id] = true
        users[user.id] = true
        await match.wait(2000)
        await match.startRound()
      }
    }
    catch {
      delete users[ctx.interaction.user.id]
      delete users[user.id]
    }
    finally {
      delete users[ctx.interaction.user.id]
      delete users[user.id]
    }
  }
})