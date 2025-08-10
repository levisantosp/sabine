import { calcPlayerOvr, getPlayer } from 'players'
import { SabineUser } from '../../database/index.ts'
import createCommand from '../../structures/command/createCommand.ts'

export default createCommand({
  name: 'remove',
  nameLocalizations: {
    'pt-BR': 'remover'
  },
  description: 'Remove a player from active roster!',
  descriptionLocalizations: {
    'pt-BR': 'Remova um jogador do elenco principal'
  },
  category: 'simulator',
  options: [
    {
      type: 3,
      name: 'player',
      nameLocalizations: {
        'pt-BR': 'jogador'
      },
      description: 'Select a player',
      descriptionLocalizations: {
        'pt-BR': 'Selecione um jogador'
      },
      autocomplete: true,
      required: true
    }
  ],
  userInstall: true,
  async run({ ctx }) {
    const p = getPlayer(Number(ctx.args[0]))
    if(!ctx.db.user.roster!.active.includes(ctx.args[0].toString()) || !p) {
      return ctx.reply('commands.remove.player_not_found')
    }
    const i = ctx.db.user.roster!.active.findIndex(pl => pl === p.id.toString())
    ctx.db.user.roster!.reserve.push(p.id.toString())
    ctx.db.user.roster!.active.splice(i, 1)
    await ctx.db.user.save()
    return await ctx.reply('commands.remove.player_removed', { p: p.name })
  },
  async createAutocompleteInteraction({ i }) {
    const user = (await SabineUser.fetch(i.user.id))!
    const players: Array<{ name: string, ovr: number, id: string }> = []
    for(const p_id of user.roster!.active) {
      const p = getPlayer(Number(p_id))
      if(!p) break
      const ovr = parseInt(calcPlayerOvr(p).toString())
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