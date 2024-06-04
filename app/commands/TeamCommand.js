import Command from '../structures/command/Command.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'
import Logger from '../structures/util/Logger.js'
const teamsCached = {}
const teamsAPICache = await (await fetch('https://vlr.orlandomm.net/api/v1/teams?limit=all', {
  method: 'GET'
})).json().catch(() => Logger.warn('API is down'))
const teamAPICache = {}

export default class TeamCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'team',
      aliases: ['equipe', 'time', 't'],
      description: 'Shows a team info',
      syntax: 'team [team]',
      examples: [
        'team loud',
        'team sentinels',
        'team nrg esports',
        'team fnatic',
        'team natus vincere'
      ],
      botPermissions: ['embedLinks']
    })
  }
  async run(ctx) {
    let team = ctx.args.slice(0).join(' ')
    if (!team) return ctx.reply('commands.team.insert_team')
    if(!teamAPICache[team]) {
      teamAPICache[team] = teamsAPICache.data.find(t => t.name.toLowerCase() === team.toLowerCase())
    }

    const teamAPI = teamAPICache[team]
    if(!teamAPI) return ctx.reply('commands.team.no_team_found')
    let teamCache = teamsCached[teamAPI.id]
    if(!teamCache) {
      const t = (await (await fetch(`https://vlr.orlandomm.net/api/v1/teams/${teamAPI.id}`, {
        method: 'GET'
      })).json()).data
      teamCache = teamsCached[t.id] = {
        players: t.players.map(p => `[${p.user}](${p.url})`).join(', '),
        staff: t.staff.map(s => `[${s.user}](${s.url})`).join(', '),
        lastMatch: `[${t.results[0].teams[0].name} ${t.results[0].teams[0].points}-${t.results[0].teams[1].points} ${t.results[0].teams[1].name}](${t.results[0].match.url})`,
        nextMatch: `[${t.upcoming[0]?.teams[0].name} x ${t.upcoming[0]?.teams[1].name}](${t.upcoming[0]?.match.url})`,
        title: `${t.info.name} (${t.info.tag})`,
        logo: t.info.logo
      }
    }
    const embed = new EmbedBuilder()
    .setTitle(teamCache.title)
    .setThumbnail(teamCache.logo)
    .setDescription(await this.locale('commands.team.embed.desc', {
      p: teamCache.players,
      s: teamCache.staff,
      lt: teamCache.lastMatch,
      n: teamCache.nextMatch
    }))
    ctx.reply(embed.build())
  }
}