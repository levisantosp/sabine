import { Constants, SelectOption } from "oceanic.js"
import { User } from "../../database/index.js"
import getPlayer from "../../simulator/valorant/players/getPlayer.js"
import SelectMenuBuilder from "../../structures/builders/SelectMenuBuilder.js"
import createCommand from "../../structures/command/createCommand.js"
import calcPlayerOvr from "../../structures/util/calcPlayerOvr.js"

export default createCommand({
  name: "promote",
  nameLocalizations: {
    "pt-BR": "promover"
  },
  description: "Promote a player to your active roster",
  descriptionLocalizations: {
    "pt-BR": "Promova um jogador para o elenco principal"
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
      required: true,
      autocomplete: true
    }
  ],
  async run({ ctx, locale }) {
    const p = getPlayer(Number(ctx.args[0]))
    if(!p) {
      return ctx.reply("commands.promote.player_not_found")
    }
    const options: SelectOption[] = []
    const players = ctx.db.user.roster.active
    if(players.length < 5) {
      let i = ctx.db.user.roster.reserve.findIndex(pl => pl === p.id.toString())
      ctx.db.user.roster.active.push(p.id.toString())
      ctx.db.user.roster.reserve.splice(i, 1)
      await ctx.db.user.save()
      return await ctx.reply("commands.promote.player_promoted", { p: p.name })
    }
    for(const p_id of players) {
      const p = getPlayer(Number(p_id))
      if(!p) break
      const ovr = parseInt(calcPlayerOvr(p).toString())
      options.push({
        label: `${p.name} (${ovr})`,
        description: p.role,
        value: p_id
      })
    }
    const menu = new SelectMenuBuilder()
    .setCustomId(`promote;${ctx.interaction.user.id};${ctx.args[0]}`)
    .setOptions(...options)
    await ctx.reply(menu.build(locale("commands.promote.select_player")))
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
  },
  async createInteraction({ ctx, i, locale }) {
    if(i.data.componentType === 3) {
      const id = i.data.values.getStrings()[0]
      let index = ctx.db.user.roster.active.findIndex(p => p === id)
      ctx.db.user.roster.active.splice(index, 1)
      ctx.db.user.roster.reserve.push(id)
      index = ctx.db.user.roster.reserve.findIndex(p => p === ctx.args[2])
      ctx.db.user.roster.reserve.splice(index, 1)
      ctx.db.user.roster.active.push(ctx.args[2])
      await ctx.db.user.save()
      const p = getPlayer(Number(ctx.args[2]))!
      await i.editParent({
        content: locale("commands.promote.player_promoted", { p: p.name }),
        components: []
      })
    }
  }
})