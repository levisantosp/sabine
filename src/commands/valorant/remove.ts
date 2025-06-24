import { SabineUser } from "../../database/index.ts"
import getPlayer from "../../simulator/valorant/players/getPlayer.ts"
import createCommand from "../../structures/command/createCommand.ts"
import calcPlayerOvr from "../../structures/util/calcPlayerOvr.ts"

type Player = {
  id: number
  name: string
  collection: string
  team: string
  country: string
  role: string
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
  ovr?: number
  price?: number
}
export default createCommand({
  name: "remove",
  nameLocalizations: {
    "pt-BR": "remover"
  },
  description: "Remove a player from active roster!",
  descriptionLocalizations: {
    "pt-BR": "Remova um jogador do elenco principal"
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
  userInstall: true,
  async run({ ctx, client }) {
    const p = getPlayer(Number(ctx.args[0]))
    if(!ctx.db.user.roster!.active.includes(ctx.args[0]) || !p) {
      return ctx.reply("commands.remove.player_not_found")
    }
    const players = ctx.db.user.roster!.active
    if(players.length < 5) {
      let i = ctx.db.user.roster!.active.findIndex(pl => pl === p.id.toString())
      ctx.db.user.roster!.reserve.push(p.id.toString())
      ctx.db.user.roster!.active.splice(i, 1)
      await client.prisma.users.update({
        where: {
          id: ctx.db.user.id
        },
        data: {
          roster: ctx.db.user.roster
        }
      })
      return await ctx.reply("commands.remove.player_removed", { p: p.name })
    }
  },
  async createAutocompleteInteraction({ i }) {
    const user = (await new SabineUser(i.user.id).get())!
    const players: Array<{ name: string, ovr: number, id: string }> = []
    for(const p_id of user.roster!.active) {
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