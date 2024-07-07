import { AutocompleteInteraction } from 'eris'
import { App, Command, CommandContext, EmbedBuilder, Logger } from '../structures'
import { Player, PlayerRes } from '../../../types'
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
      ]
    })
  }
  async run(ctx: CommandContext) {
    if(!cache.has(ctx.args[0])) {
      const res: PlayerRes = await (await fetch(`https://vlr.orlandomm.net/api/v1/players/${ctx.args[0]}`, {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      cache.set(ctx.args[0], res)
    }
    const player: PlayerRes = cache.get(ctx.args[0])
    const embed = new EmbedBuilder()
    .setTitle(`:flag_${player.data.info.flag}: ${player.data.info.user}`)
    .setThumbnail(player.data.info.img)
    .setDescription(this.locale('commands.player.embed.desc', {
      name: player.data.info.name,
      team: `[${player.data.team.name}](${player.data.team.url})`,
      pt: player.data.pastTeams.map(t => `[${t.name}](${t.url})`).join(', '),
      lt: `[${player.data.results[0].teams[0].name} ${player.data.results[0].teams[0].points}-${player.data.results[0].teams[1].points} ${player.data.results[0].teams[1].name}](${player.data.results[0].match.url})`
    }))
    ctx.reply(embed.build())
  }
  async execAutocomplete(i: AutocompleteInteraction) {
    if(!cache.has('players')) {
      const res: Player = await (await fetch('https://vlr.orlandomm.net/api/v1/players?limit=all', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      cache.set('players', res)
    }
    const res: Player = cache.get('players')
    const players = res.data.sort((a, b) => a.name.localeCompare(b.name))
    .filter(e => {
      if(e.name.toLowerCase().includes((i.data.options[0] as AutocompleteOptions).value.toLowerCase())) return e
    })
    .slice(0, 25)
    i.result(players.map(p => ({ name: `${p.name} (${p.teamTag})`, value: p.id })))
    .catch((e) => new Logger(this.client).error(e))
  }
}