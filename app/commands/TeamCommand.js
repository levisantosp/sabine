import Command from '../structures/command/Command.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'

export default class TeamCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'team',
      aliases: ['equipe', 'time', 't']
    })
  }
  async run(ctx) {
    let team = ctx.args.slice(0).join(' ')
    if (!team) return ctx.reply('commands.team.insert_team')
    const teams = (await (await fetch('https://vlr.orlandomm.net/api/v1/teams?limit=all', {
      method: 'GET'
    })).json()).data.filter(t => t.name.toLowerCase() === team.toLowerCase())
    if (teams.length === 0) return ctx.reply('commands.team.no_team_found')
    
    team = teams[0]
    const t = (await (await fetch(`https://vlr.orlandomm.net/api/v1/teams/${team.id}`, {
      method: 'GET'
    })).json()).data
    const embed = new EmbedBuilder()
    .setTitle(`${t.info.name} (${t.info.tag})`)
    .setThumbnail(t.info.logo)
    .setDescription(await this.locale('commands.team.embed.desc', {
      p: t.players.map(p => `[${p.user}](${p.url})`).join(', '),
      s: t.staff.map(s => `[${s.user}](${s.url})`).join(', '),
      lt: `[${t.results[0].teams[0].name} ${t.results[0].teams[0].points}-${t.results[0].teams[1].points} ${t.results[0].teams[1].name}](${t.results[0].match.url})`,
      n: `[${t.upcoming[0]?.teams[0].name} x ${t.upcoming[0]?.teams[1].name}](${t.upcoming[0]?.match.url})`
    }))
    ctx.reply(embed.build())
  }
}