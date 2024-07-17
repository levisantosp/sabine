import { AutocompleteInteraction } from 'eris'
import { App, Command, CommandContext, EmbedBuilder, Logger } from '../structures'
import { TeamRes, TeamResponse } from '../../../types'
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
      name: 'team',
      description: 'Shows a team info',
      description_localizations: {
        'pt-BR': 'Mostra as informações de determinada equipe'
      },
      options: [
        {
          type: 3,
          name: 'team',
          description: 'Select a team',
          description_localizations: {
            'pt-BR': 'Selecione uma equipe'
          },
          autocomplete: true,
          required: true
        }
      ],
      syntax: 'team [team]',
      examples: [
        'team LOUD',
        'team FURIA',
        'team Hero Base',
        'team G2',
        'team Team Heretics'
      ],
      botPermissions: ['embedLinks']
    })
  }
  async run(ctx: CommandContext) {
    if(!cache.has(ctx.args[0])) {
      const res = await (await fetch(`https://vlr.orlandomm.net/api/v1/teams/${ctx.args[0]}`, {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      cache.set(ctx.args[0], res)
    }
    const team: TeamResponse = cache.get(ctx.args[0])
    const embed = new EmbedBuilder()
    .setTitle(`${team.data.info.name} (${team.data.info.tag})`)
    .setThumbnail(team.data.info.logo)
    .setDescription(this.locale('commands.team.embed.desc', {
      p: team.data.players.map(p => `[${p.user}](${p.url})`).join(', '),
      s: team.data.staff.map(s => `[${s.user}](${s.url})`).join(', '),
      lt: `[${team.data.results[0].teams[0].points}-${team.data.results[0].teams[1].points} vs ${team.data.results[0].teams[1].name}](${team.data.results[0].match.url})`,
      n: team.data.upcoming.length ? `[${team.data.upcoming[0]?.teams[0].name} vs ${team.data.upcoming[0]?.teams[1].name}](${team.data.upcoming[0]?.match.url})` : ''
    }))
    ctx.reply(embed.build())
  }
  async execAutocomplete(i: AutocompleteInteraction) {
    if(!cache.has('teams')) {
      const res: TeamRes = await (await fetch('https://vlr.orlandomm.net/api/v1/teams?limit=all', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      cache.set('teams', res)
    }
    const res: TeamRes = cache.get('teams')
    const teams = res.data.sort((a, b) => a.name.localeCompare(b.name))
    .filter(e => {
      if(e.name.toLowerCase().includes((i.data.options[0] as AutocompleteOptions).value.toLowerCase())) return e
    })
    .slice(0, 25)
    i.result(teams.map(t => ({ name: `${t.name} (${t.country})`, value: t.id })))
    .catch((e) => new Logger(this.client).error(e))
  }
}