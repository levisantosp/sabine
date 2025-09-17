import { calcPlayerPrice } from "players"
import { SabineUser } from "../../database/index.ts"
import createCommand from "../../structures/command/createCommand.ts"

export default createCommand({
  name: "sell",
  nameLocalizations: {
    "pt-BR": "vender"
  },
  description: "Sell a player",
  descriptionLocalizations: {
    "pt-BR" : "Venda um jogador"
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
  cooldown: true,
  async run({ ctx, client }) {
    const player = client.players.get(ctx.args[0].toString())
    const i = ctx.db.user.reserve_players.findIndex(p => p === ctx.args[0])
    if(!player || i === -1) {
      return await ctx.reply("commands.sell.player_not_found")
    }
    await ctx.db.user.sellPlayer(player.id.toString(), BigInt(calcPlayerPrice(player, true)), i)
    await ctx.reply("commands.sell.sold", { p: player.name, price: player.price.toLocaleString("en-US") })
  },
  async createAutocompleteInteraction({ i, client }) {
    const user = await SabineUser.fetch(i.user.id)
    if(!user) return
    const players: Array<{ name: string, ovr: number, id: string }> = []
    for(const p_id of user.reserve_players) {
      const p = client.players.get(p_id)
      if(!p) break
      const ovr = p.ovr
      players.push({
        name: `${p.name} (${ovr})`,
        ovr,
        id: p_id
      })
    }
    await i.result(
      players.sort((a, b) => a.ovr - b.ovr)
      .filter(p => {
        if(p.name.toLowerCase().includes(i.data.options.getOptions()[0].value.toString().toLowerCase())) return p
      })
      .slice(0, 25)
      .map(p => ({ name: p.name, value: p.id }))
    )
  }
})