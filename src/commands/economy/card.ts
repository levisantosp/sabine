import { ApplicationCommandOptionTypes } from 'oceanic.js'
import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import { calcPlayerOvr, calcPlayerPrice, getPlayer, getPlayers } from 'players'

const date = Date.now()
export default createCommand({
  name: 'card',
  category: 'economy',
  nameLocalizations: {
    'pt-BR': 'carta'
  },
  description: 'Search a card',
  descriptionLocalizations: {
    'pt-BR': 'Pesquise uma carta'
  },
  userInstall: true,
  options: [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'card',
      nameLocalizations: {
        'pt-BR': 'carta'
      },
      description: 'Insert the card',
      descriptionLocalizations: {
        'pt-BR': 'Informe a carta'
      },
      autocomplete: true,
      required: true
    }
  ],
  async run({ ctx, t }) {
    const player = getPlayer(Number(ctx.args[0]))
    if(!player) return await ctx.reply('commands.card.player_not_found')
    const embed = new EmbedBuilder()
    .setFields(
      {
        name: t('commands.card.name'),
        value: player.name,
        inline: true
      },
      {
        name: t('commands.card.collection'),
        value: player.collection,
        inline: true
      },
      {
        name: t('commands.card.purchaseable'),
        value: player.purchaseable ? t('helper.yes') : t('helper.no'),
        inline: true
      },
      {
        name: t('commands.card.price'),
        value: calcPlayerPrice(player).toLocaleString('en') + ' coins',
        inline: true
      },
      {
        name: t('commands.card.devalued_price'),
        value: calcPlayerPrice(player, true).toLocaleString('en') + ' coins',
        inline: true
      }
    )
    .setImage(`${process.env.CDN_URL}/cards/${player.id}.png?ts=${date}`)
    await ctx.reply(embed.build())
  },
  async createAutocompleteInteraction({ i }) {
    const players: Array<{ name: string, ovr: number, id: number }> = []
    for(const p of getPlayers()) {
      const ovr = parseInt(calcPlayerOvr(p).toString())
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
  }
})