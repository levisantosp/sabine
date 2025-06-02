import Service from "../api/index.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import createCommand from "../structures/command/createCommand.js"
import Logger from "../structures/util/Logger.js"
const service = new Service(process.env.AUTH)

export default createCommand({
  name: "team",
  description: "Shows a team info",
  descriptionLocalizations: {
    "pt-BR": "Mostra as informações de uma equipe"
  },
  options: [
    {
      type: 3,
      name: "team",
      description: "Select a team",
      descriptionLocalizations: {
        "pt-BR": "Selecione uma equipe"
      },
      autocomplete: true,
      required: true
    }
  ],
  syntax: "team [team]",
  examples: [
    "team LOUD",
    "team G2",
    "team Team Vitality",
    "team NRG ESPORTS"
  ],
  botPermissions: ["EMBED_LINKS"],
  isThinking: true,
  async run({ ctx, locale }) {
    const team = await service.getTeamById(ctx.args[0])
    if(team.name === "") {
      ctx.reply("commands.team.team_not_found")
      return
    }
    const embed = new EmbedBuilder()
      .setTitle(`${team.name} (${team.tag})`)
      .setThumb(team.logo)
      .setDesc(locale("commands.team.embed.desc", {
        p: team.roster.players.map(p => `[${p.user}](${p.url})`).join(", "),
        s: team.roster.staffs.map(s => `[${s.user}](${s.url})`).join(", "),
        lt: `[${team.lastResults[0].teams[0].score}-${team.lastResults[0].teams[1].score} vs ${team.lastResults[0].teams[1].name}](${team.lastResults[0].url})`,
        n: team.upcomingMatches.length ? `[vs ${team.upcomingMatches[0].teams[1].name}](${team.upcomingMatches[0].url})` : ""
      }))
    ctx.reply(embed.build())
  },
  async createAutocompleteInteraction({ i, client }) {
    const res = await service.getAllTeams()
    const teams = res.sort((a, b) => a.name.localeCompare(b.name))
      .filter(e => {
        if(e.name.toLowerCase().includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return e
      })
      .slice(0, 25)
    i.result(teams.map(t => ({ name: `${t.name} (${t.country})`, value: t.id })))
      .catch((e) => new Logger(client).error(e))
  }
})