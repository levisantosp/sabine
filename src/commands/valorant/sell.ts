import { User } from "../../database/index.js"
import getPlayer from "../../simulator/valorant/players/getPlayer.js"
import createCommand from "../../structures/command/createCommand.js"
import calcPlayerOvr from "../../structures/util/calcPlayerOvr.js"
import calcPlayerPrice from "../../structures/util/calcPlayerPrice.js"
import Logger from "../../structures/util/Logger.js"

export default createCommand({
  name: "sell",
  nameLocalizations: {
    "pt-BR": "vender"
  },
  description: "Sell a player",
  descriptionLocalizations: {
    "pt-BR" : "Venda um jogador"
  },
  category: "simulator",
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
  async run({ ctx }) {
    const player = getPlayer(Number(ctx.args[0]))
    let i = ctx.db.user.roster.reserve.findIndex(p => p === ctx.args[0])
    if(!player || i === -1) {
      return ctx.reply("commands.sell.player_not_found")
    }
    const price = parseInt((calcPlayerPrice(player) * 0.2).toString())
    await ctx.db.user.sellPlayer(player.id.toString(), price, i)
    await ctx.reply("commands.sell.sold", { p: player.name, price: price.toLocaleString("en-US") })
  },
  async createAutocompleteInteraction({ i }) {
    const user = await User.get(i.user.id)
    const players: Array<{ name: string, ovr: number, id: string }> = []
    for(const p_id of user.roster.reserve) {
      const p = getPlayer(Number(p_id))
      if(!p) break
      const ovr = parseInt(calcPlayerOvr(p).toString())
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
      .map(p => ({ name: p.name, value: p.id }))
    )
  }
})