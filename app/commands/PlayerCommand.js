import Command from '../structures/command/Command.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'

//username, equipe, equipes passadas, ultimapartida, nome, timestamp
const playersCached = {}
const playersAPICache = (await (await fetch('https://vlr.orlandomm.net/api/v1/players?limit=all', {
  method: 'GET'
})).json())
const playerAPICache = {}

export default class PlayerCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'player',
      aliases: ['jogador', 'p'],
      description: 'Shows a player info',
      syntax: 'player [player]',
      examples: [
        'player less',
        'player qck',
        'player tuyz',
        'player dgzin'
      ],
      botPermissions: ['embedLinks']
    })
  }
  async run(ctx) {
    if(!ctx.args.slice(0).join(' ')) return ctx.reply('commands.player.insert_player')
    const username = ctx.args.slice(0).join(' ').toLowerCase()
    if(!playerAPICache[username]) {
      playerAPICache[username] = playersAPICache.data.find(p => p.name.toLowerCase() === ctx.args.slice(0).join(' ').toLowerCase())
    }

    const playerAPI = playerAPICache[username]
    if(!playerAPI) return ctx.reply('commands.player.no_player_found')
    let playerCache = playersCached[playerAPI.user]
    if(!playerCache) {
      const p = (await (await fetch(`https://vlr.orlandomm.net/api/v1/players/${playerAPI.id}`, {
        method: 'GET'
      })).json()).data
      playerCache = playersCached[p.id] = {
        team: `[${p.team.name}](${p.team.url})`,
        pt: p.pastTeams.map(t => `[${t.name}](${t.url})`).join(', '),
        thumbnail: p.info.img,
        user: p.info.user,
        lt: `[${p.results[0].teams[0].name} ${p.results[0].teams[0].points}-${p.results[0].teams[1].points} ${p.results[0].teams[1].name}](${p.results[0].match.url})`,
        flag: p.info.flag,
        name: p.info.name
      }
    }

    const embed = new EmbedBuilder()
    .setTitle(`:flag_${playerCache.flag}: ${playerCache.user}`)
    .setThumbnail(playerCache.thumbnail)
    .setDescription(await this.locale('commands.player.embed.desc', {
      name: playerCache.name,
      team: playerCache.team,
      pt: playerCache.pt,
      lt: playerCache.lt
    }))
    ctx.reply(embed.build())
  }
}