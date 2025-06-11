import ValorantMatch from "../../simulator/valorant/ValorantMatch.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"
import createCommand from "../../structures/command/createCommand.js"

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
  async run({ ctx, client, locale }) {
    if(!ctx.db.user.team.name || !ctx.db.user.team.tag) {
      return ctx.reply("commands.duel.needed_team_name")
    }
    if(users[ctx.interaction.user.id]) {
      return ctx.reply("commands.duel.already_in_match")
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
          roster: [
            "31",
            "32",
            "33",
            "34",
            "35"
          ],
          user: {
            name: "IA",
            id: "934070086766051379"
          },
          name: "FNATIC",
          tag: "FNC"
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
        await match.wait(2000)
        await match.startRound()
      }
    }
    finally {
      delete users[ctx.interaction.user.id]
    }
  }
})