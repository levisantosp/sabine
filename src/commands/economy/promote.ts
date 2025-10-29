import type { APISelectMenuOption } from 'discord.js'
import SelectMenuBuilder from '../../structures/builders/SelectMenuBuilder.ts'
import createCommand from '../../structures/command/createCommand.ts'
import { SabineUser } from '../../database/index.ts'

export default createCommand({
  name: 'promote',
  nameLocalizations: {
    'pt-BR': 'promover'
  },
  description: 'Promote a player to your active roster',
  descriptionLocalizations: {
    'pt-BR': 'Promova um jogador para o elenco principal'
  },
  category: 'economy',
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
      required: true,
      autocomplete: true
    }
  ],
  userInstall: true,
  messageComponentInteractionTime: 5 * 60 * 1000,
  async run({ ctx, t, app }) {
    const p = app.players.get(ctx.args[0].toString())

    if(!p) {
      return await ctx.reply('commands.promote.player_not_found')
    }

    const options: APISelectMenuOption[] = []

    const players = ctx.db.user.active_players

    if(players.length < 5) {
      const i = ctx.db.user.reserve_players.findIndex(pl => pl === p.id.toString())

      ctx.db.user.active_players.push(p.id.toString())
      ctx.db.user.reserve_players.splice(i, 1)

      await ctx.db.user.save()

      return await ctx.reply('commands.promote.player_promoted', { p: p.name })
    }
    let i = 0

    for(const p_id of players) {
      i++

      const p = app.players.get(p_id)

      if(!p) break

      const ovr = parseInt(p.ovr.toString())

      options.push({
        label: `${p.name} (${ovr})`,
        description: p.role,
        value: `${i}_${p_id}`
      })
    }

    const menu = new SelectMenuBuilder()
      .setCustomId(`promote;${ctx.interaction.user.id};${ctx.args[0]}`)
      .setOptions(...options)

    await ctx.reply(menu.build(t('commands.promote.select_player')))
  },
  async createAutocompleteInteraction({ i, app }) {
    const user = (await SabineUser.fetch(i.user.id))!

    const value = i.options.getString('player', true)

    const players: Array<{ name: string, ovr: number, id: string }> = []

    for(const p_id of user.reserve_players) {
      const p = app.players.get(p_id)

      if(!p) break

      const ovr = parseInt(p.ovr.toString())

      players.push({
        name: `${p.name} (${ovr}) — ${p.collection}`,
        ovr,
        id: p_id
      })
    }
    await i.respond(
      players.sort((a, b) => a.ovr - b.ovr)
        .filter(p => {
          if(p.name.toLowerCase().includes(value.toLowerCase())) return p
        })
        .slice(0, 25)
        .map(p => ({ name: p.name, value: p.id }))
    )
  },
  async createMessageComponentInteraction({ ctx, i, app }) {
    if(!i.isStringSelectMenu()) return

    const id = i.values[0].split('_')[1]

    let index = ctx.db.user.active_players.findIndex(p => p === id)

    ctx.db.user.active_players.splice(index, 1)
    ctx.db.user.reserve_players.push(id)

    index = ctx.db.user.reserve_players.findIndex(p => p === ctx.args[2])

    ctx.db.user.reserve_players.splice(index, 1)
    ctx.db.user.active_players.push(ctx.args[2])

    await ctx.db.user.save()

    const p = app.players.get(ctx.args[2])!

    await ctx.edit('commands.promote.player_promoted', { p: p.name })
  }
})