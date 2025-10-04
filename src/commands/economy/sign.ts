import { ApplicationCommandOptionTypes } from 'oceanic.js'
import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'

export default createCommand({
  name: 'sign',
  nameLocalizations: {
    'pt-BR': 'contratar'
  },
  description: 'Sign a player',
  descriptionLocalizations: {
    'pt-BR': 'Contrate um jogador'
  },
  category: 'economy',
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
  messageComponentInteractionTime: 5 * 60 * 1000,
  async run({ ctx, t, client }) {
    const player = client.players.get(ctx.args[0].toString())

    if(!player || !player.purchaseable) return await ctx.reply('commands.sign.player_not_found')

    const price = player.price

    const embed = new EmbedBuilder()
      .setTitle(player.name)
      .setDesc(t(
        'commands.sign.embed.desc',
        {
          price: price.toLocaleString()
        }
      ))
      .setImage(`${process.env.CDN_URL}/cards/${player.id}.png`)

    const button = new ButtonBuilder()
      .setStyle('green')
      .setLabel(t('commands.sign.buy'))
      .setCustomId(`sign;${ctx.interaction.user.id};${player.id}`)

    await ctx.reply(embed.build(button.build()))
  },
  async createAutocompleteInteraction({ i, client }) {
    const players: Array<{ name: string, ovr: number, id: number }> = []

    for(const p of client.players.values()) {
      if(!p.purchaseable) continue

      const ovr = Math.floor(p.ovr)

      players.push({
        name: `${p.name} (${ovr}) — ${p.collection}`,
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
  async createMessageComponentInteraction({ ctx, i, client }) {
    await i.defer(64)

    const player = client.players.get(ctx.args[2])

    if(!player) return

    const price = player.price

    if(price > ctx.db.user.coins) return ctx.reply('commands.sign.coins_needed')

    ctx.db.user.coins -= BigInt(price)
    ctx.db.user.reserve_players.push(player.id.toString())

    await client.prisma.transaction.create({
      data: {
        userId: ctx.db.user.id,
        player: player.id,
        type: 'SIGN_PLAYER'
      }
    })

    await ctx.db.user.save()

    await ctx.reply('commands.sign.signed', {
      player: `${player.name} (${Math.floor(player.ovr)})`,
      price: price.toLocaleString()
    })
  }
})