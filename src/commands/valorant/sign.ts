import { ApplicationCommandOptionTypes } from 'oceanic.js'
import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import getPlayer from '../../simulator/valorant/players/getPlayer.ts'
import calcPlayerPrice from '../../structures/util/calcPlayerPrice.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'
import getPlayers from '../../simulator/valorant/players/getPlayers.ts'
import calcPlayerOvr from '../../structures/util/calcPlayerOvr.ts'

export default createCommand({
  name: 'sign',
  nameLocalizations: {
    'pt-BR' : 'contratar'
  },
  description: 'Sign a player',
  descriptionLocalizations: {
    'pt-BR': 'Contrate um jogador'
  },
  category: 'simulator',
  options: [
    {
      type: ApplicationCommandOptionTypes.STRING,
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
  async run({ ctx, t }) {
    const player = getPlayer(Number(ctx.args[0]))
    if(!player) return await ctx.reply('commands.sign.player_not_found')
    const price = calcPlayerPrice(player)
    const embed = new EmbedBuilder()
    .setTitle(player.name)
    .setDesc(t(
      'commands.sign.embed.desc',
      {
        price: price.toLocaleString('en-US')
      }
    ))
    .setImage(`${process.env.CDN_URL}/cards/${player.id}.png`)
    const button = new ButtonBuilder()
    .setStyle('green')
    .setLabel(t('commands.sign.buy'))
    .setCustomId(`sign;${ctx.interaction.user.id};${player.id}`)
    await ctx.reply(embed.build(button.build()))
  },
  async createAutocompleteInteraction({ i }) {
    const players: Array<{ name: string, ovr: number, id: number }> = []
    for(const p of getPlayers()) {
      const ovr = parseInt(calcPlayerOvr(p).toString())
      players.push({
        name: `${p.name} (${ovr})`,
        ovr,
        id: p.id
      })
    }
    await i.result(
      players.sort((a, b) => b.ovr - a.ovr)
      .filter(p => {
        if(p.name.toLowerCase().includes(i.data.options.getOptions()[0].value.toString().toLowerCase())) return p
      })
      .slice(0, 25)
      .map(p => ({ name: p.name, value: p.id.toString() }))
    )
  },
  async createInteraction({ ctx, i }) {
    await i.defer(64)
    const player = getPlayer(Number(ctx.args[2]))
    if(!player) return
    const price = calcPlayerPrice(player)
    const ovr = parseInt(calcPlayerOvr(player).toString())
    if(price > ctx.db.user.coins) return ctx.reply('commands.sign.coins_needed')
    ctx.db.user.coins -= BigInt(price)
    ctx.db.user.roster!.reserve.push(player.id.toString())
    await ctx.db.user.save()
    await ctx.reply('commands.sign.signed', {
      player: `${player.name} (${ovr})`,
      price: price.toLocaleString('en-US')
    })
  }
})