import { AutocompleteInteraction } from 'oceanic.js'
import { App, Command, CommandContext, EmbedBuilder, Logger } from '../structures'
import MainController from '../scraper'
import { TeamData, TeamsData } from '../../types'
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
      descriptionLocalizations: {
        'pt-BR': 'Mostra as informações de determinada equipe'
      },
      options: [
        {
          type: 3,
          name: 'team',
          description: 'Select a team',
          descriptionLocalizations: {
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
      botPermissions: ['EMBED_LINKS']
    })
  }
  async run(ctx: CommandContext) {
    if(!cache.has(ctx.args[0])) {
      const res = await MainController.getTeamById(ctx.args[0])
      cache.set(ctx.args[0], res)
    }
    const team: TeamData = cache.get(ctx.args[0])
    const embed = new EmbedBuilder()
    .setTitle(`${team.name} (${team.tag})`)
    .setThumbnail(team.logo)
    .setDescription(this.locale('commands.team.embed.desc', {
      p: team.roster.players.map(p => `[${p.user}](${p.url})`).join(', '),
      s: team.roster.staffs.map(s => `[${s.user}](${s.url})`).join(', '),
      lt: `[${team.lastResults[0].teams[0].score}-${team.lastResults[0].teams[1].score} vs ${team.lastResults[0].teams[1].name}](${team.lastResults[0].url})`,
      n: team.upcomingMatches.length ? `[vs ${team.upcomingMatches[0].teams[1].name}](${team.upcomingMatches[0].url})` : ''
    }))
    ctx.reply(embed.build())
  }
  async execAutocomplete(i: AutocompleteInteraction) {
    if(!cache.has('teams')) {
      const res = await MainController.getAllTeams()
      cache.set('teams', res)
    }
    const res: TeamsData[] = cache.get('teams')
    const teams = res.sort((a, b) => a.name.localeCompare(b.name))
    .filter(e => {
      if(e.name.toLowerCase().includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return e
    })
    .slice(0, 25)
    i.result(teams.map(t => ({ name: `${t.name} (${t.country})`, value: t.id })))
    .catch((e) => new Logger(this.client).error(e))
  }
}