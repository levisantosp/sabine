import Service from "../api/index.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import createCommand from "../structures/command/createCommand.js"
import Logger from "../structures/util/Logger.js"
const service = new Service(process.env.AUTH)

export default createCommand({
  name: "player",
  description: "Shows a player info",
  descriptionLocalizations: {
    "pt-BR": "Mostra as informações de um jogador"
  },
  options: [
    {
      type: 3,
      name: "player",
      description: "Select a player",
      descriptionLocalizations: {
        "pt-BR": "Selecione um jogador"
      },
      autocomplete: true,
      required: true
    }
  ],
  isThinking: true,
  syntax: "player [player]",
  examples: [
    "player Less",
    "player aspas",
    "player Demon1"
  ],
  botPermissions: ["EMBED_LINKS"],
  async run({ ctx, locale }) {
    const player = await service.getPlayerById(ctx.args[0])
    if (player.user === "") {
      ctx.reply("commands.player.player_not_found")
      return
    }
    const embed = new EmbedBuilder()
      .setTitle(`:flag_${player.country.flag}: ${player.user}`)
      .setThumb(player.avatar)
      .setDesc(locale("commands.player.embed.desc", {
        name: player.realName,
        team: `[${player.team.name}](${player.team.url})`,
        pt: player.pastTeams.map(t => `[${t.name}](${t.url})`).join(", "),
        lt: `[${player.lastResults[0].teams[0].score}-${player.lastResults[0].teams[1].score} vs ${player.lastResults[0].teams[1].name}](${player.lastResults[0].url})`
      }))
    ctx.reply(embed.build())
  },
  async createAutocompleteInteraction({ i, client }) {
    const res = await service.getAllPlayers()
    const players = res.sort((a, b) => a.name.localeCompare(b.name))
      .filter(e => {
        if (e.name.toLowerCase().includes((i.data.options.getOptions()[0].value.toString()).toLowerCase())) return e
      })
      .slice(0, 25)
    i.result(players.map(p => ({ name: `${p.name} (${p.teamTag})`, value: p.id })))
      .catch((e) => new Logger(client).error(e))
  }
})