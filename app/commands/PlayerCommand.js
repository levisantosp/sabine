import Command from '../structures/command/Command.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'

export default class PlayerCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'player',
      aliases: ['jogador', 'p']
    })
  }
  async run(ctx) {
    if(!ctx.args.slice(0).join(' ')) return ctx.reply('commands.player.insert_player')
    const players = (await (await fetch('https://vlr.orlandomm.net/api/v1/players?limit=all', {
      method: 'GET'
    })).json()).data.filter(p => p.name.toLowerCase() === ctx.args.slice(0).join(' ').toLowerCase())
    if(players.length === 0) return ctx.reply('commands.player.no_player_found')
    
    const player = players[0]
    const p = (await (await fetch(`https://vlr.orlandomm.net/api/v1/players/${player.id}`, {
      method: 'GET'
    })).json()).data
    const embed = new EmbedBuilder()
    .setTitle(`:flag_${p.info.flag}: ${p.info.user}`)
    .setThumbnail(p.info.img)
    .setDescription(await this.locale('commands.player.embed.desc', {
      name: p.info.name,
      team: `[${p.team.name}](${p.team.url})`,
      pt: p.pastTeams.map(t => `[${t.name}](${t.url})`).join(', '),
      lt: `[${p.results[0].teams[0].name} ${p.results[0].teams[0].points}-${p.results[0].teams[1].points} ${p.results[0].teams[1].name}](${p.results[0].match.url})`
    }))
    ctx.reply(embed.build())
  }
}