import { SabineUser } from "../../database/index.ts"
import createCommand from "../../structures/command/createCommand.ts"

export default createCommand({
  name: "remove",
  nameLocalizations: {
    "pt-BR": "remover"
  },
  description: "Remove a player from active roster!",
  descriptionLocalizations: {
    "pt-BR": "Remova um jogador do elenco principal"
  },
  category: "economy",
  options: [
    {
      type: 3,
      name: "player",
      nameLocalizations: {
        "pt-BR": "jogador"
      },
      description: "Select a player",
      descriptionLocalizations: {
        "pt-BR": "Selecione um jogador"
      },
      autocomplete: true,
      required: true
    }
  ],
  userInstall: true,
  async run({ ctx, client }) {
    const p = client.players.get(ctx.args[0].toString())
    if(!ctx.db.user.active_players.includes(ctx.args[0].toString()) || !p) {
      return await ctx.reply("commands.remove.player_not_found")
    }
    const i = ctx.db.user.active_players.findIndex(pl => pl === p.id.toString())
    ctx.db.user.reserve_players.push(p.id.toString())
    ctx.db.user.active_players.splice(i, 1)
    await ctx.db.user.save()
    return await ctx.reply("commands.remove.player_removed", { p: p.name })
  },
  async createAutocompleteInteraction({ i, client }) {
    const user = (await SabineUser.fetch(i.user.id))!
    const players: Array<{ name: string, ovr: number, id: string }> = []
    for(const p_id of user.active_players) {
      const p = client.players.get(p_id)
      if(!p) break
      const ovr = parseInt(p.ovr.toString())
      players.push({
        name: `${p.name} (${ovr}) — ${p.collection}`,
        ovr,
        id: p_id
      })
    }
    await i.result(
      players.sort((a, b) => a.ovr - b.ovr)
      .filter(p => {
        if(p.name.toLowerCase().includes(i.data.options.getOptions()[0].value.toString().toLowerCase())) return p
      })
      .map(p => ({ name: p.name, value: p.id }))
    )
  }
})