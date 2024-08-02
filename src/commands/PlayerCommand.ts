import { AutocompleteInteraction } from 'eris'
import { App, Command, CommandContext, EmbedBuilder, Logger } from '../structures'
import MainController from '../scraper'
import { PlayerData, PlayersData } from '../../types'
const cache = new Map()

type AutocompleteOptions = {
  value: string
  type: number
  name: string
}
export default class PlayerCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'player',
      description: 'Shows a player info',
      description_localizations: {
        'pt-BR': 'Mostra as informações de determinado jogador'
      },
      options: [
        {
          type: 3,
          name: 'player',
          description: 'Select a player',
          description_localizations: {
            'pt-BR': 'Selecione um jogador'
          },
          autocomplete: true,
          required: true
        }
      ],
      syntax: 'player [player]',
      examples: [
        'player aspas',
        'player benjyfishy',
        'player Less'
      ],
      botPermissions: ['embedLinks']
    })
  }
  async run(ctx: CommandContext) {
    if(!cache.has(ctx.args[0])) {
      const res = await MainController.getPlayerById(ctx.args[0])
      cache.set(ctx.args[0], res)
    }
    const player: PlayerData = cache.get(ctx.args[0])
    const embed = new EmbedBuilder()
    .setTitle(`:flag_${player.country.flag}: ${player.user}`)
    .setThumbnail(player.avatar)
    .setDescription(this.locale('commands.player.embed.desc', {
      name: player.realName,
      team: `[${player.team.name}](${player.team.url})`,
      pt: player.pastTeams.map(t => `[${t.name}](${t.url})`).join(', '),
      lt: `[${player.lastResults[0].teams[0].score}-${player.lastResults[0].teams[1].score} vs ${player.lastResults[0].teams[1].name}](${player.lastResults[0].url})`
    }))
    ctx.reply(embed.build())
  }
  async execAutocomplete(i: AutocompleteInteraction) {
    if(!cache.has('players')) {
      const res = await MainController.getAllPlayers()
      cache.set('players', res)
    }
    const res: PlayersData[] = cache.get('players')
    const players = res.sort((a, b) => a.name.localeCompare(b.name))
    .filter(e => {
      if(e.name.toLowerCase().includes((i.data.options[0] as AutocompleteOptions).value.toLowerCase())) return e
    })
    .slice(0, 25)
    i.result(players.map(p => ({ name: `${p.name} (${p.teamTag})`, value: p.id })))
    .catch((e) => new Logger(this.client).error(e))
  }
}