import Service from "../../api/index.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"
import Logger from "../../structures/util/Logger.ts"
const service = new Service(process.env.AUTH)

export default createCommand({
  name: "player",
  category: "esports",
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
  syntax: "player [player]",
  examples: [
    "player Less",
    "player aspas",
    "player Demon1"
  ],
  botPermissions: ["EMBED_LINKS"],
  userInstall: true,
  async run({ ctx, t }) {
    const player = await service.getPlayerById(ctx.args[0])
    if(player.user === "") {
      return await ctx.reply("commands.player.player_not_found")
    }
    const embed = new EmbedBuilder()
      .setTitle(`:flag_${player.country.flag}: ${player.user}`)
      .setThumb(player.avatar)
      .setDesc(t("commands.player.embed.desc", {
        name: player.realName,
        team: `[${player.team.name}](${player.team.url})`,
        pt: player.pastTeams.map(t => `[${t.name}](${t.url})`).join(", "),
        lt: `[${player.lastResults[0].teams[0].score}-${player.lastResults[0].teams[1].score} vs ${player.lastResults[0].teams[1].name}](${player.lastResults[0].url})`
      }))
    await ctx.reply(embed.build())
  },
  async createAutocompleteInteraction({ i }) {
    const res = await service.getAllPlayers()
    const players = res
      .filter(e => {
        if(e.name.toLowerCase().includes((i.data.options.getOptions()[0].value.toString()).toLowerCase())) return e
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 25)
    await i.result(players.map(p => ({ name: `${p.name} (${p.teamTag})`, value: p.id })))
  }
})