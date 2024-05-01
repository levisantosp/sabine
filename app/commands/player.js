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
    
    const embed = new EmbedBuilder()
    if (players.length === 1) {
      for(const player of players) {
        const p = (await (await fetch(`https://vlr.orlandomm.net/api/v1/players/${player.id}`, {
          method: 'GET'
        })).json()).data
        embed.setTitle(`:flag_${p.info.flag}: ${p.info.user}`)
        embed.setThumbnail(p.info.img)
        embed.setDescription(await this.locale('commands.player.embed.desc', {
          name: p.info.name,
          team: `[${p.team.name}](${p.team.url})`,
          pt: p.pastTeams.map(t => `[${t.name}](${t.url})`).join(', ')
        }))
      }
    }
    else {
      embed.setDescription(await this.locale('commands.player.embed.desc2', {
        q: players.length,
        s: ctx.args.slice(0).join(' ')
      }))
      for(const player of players) {
        embed.addField(`:flag_${player.country}: ${player.name}`, await this.locale('commands.player.embed.field', {
          id: player.id,
          t: player.teamTag,
          p: player.url
        }))
      }
    }
    ctx.reply(embed.build())
  }
}