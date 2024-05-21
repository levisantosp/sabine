import { ComponentInteraction } from 'eris'
import { User } from '../../database/index.js'
import Command from '../structures/command/Command.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'

export default class LeaderboardCommand extends Command {
  constructor(client) {    
    super({
      client,
      name: 'leaderboard',
      aliases: ['lb', 'top', 'rank'],
      description: 'Ranking of guesses',
      syntax: 'leaderboard <page>',
      examples: [
        'leaderboard',
        'leaderboard 1',
        'leaderboard 2',
        'leaderboard 5'
      ]
    })
  }
  async run(ctx) {
    let users = (await User.find({
      guessesRight: {
        $gt: 0
      }
    })).sort((a, b) => b.guessesRight - a.guessesRight)
    let array = users
    let page = ctx.args[0]
    if(!page || page === 1 || isNaN(page)) {
      users = users.slice(0, 10)
      page = 1
    }
    else users = users.slice(page * 10 - 10, page * 10)
  
    const embed = new EmbedBuilder()
    .setAuthor(await this.locale('commands.leaderboard.author', {
      page,
      pages: Math.ceil(array.length / 10)
    }))
    .setTitle(await this.locale('commands.leaderboard.title'))
    .setThumbnail((await this.getUser(array[0].id)).avatarURL)

    let pos = 1
    if(!isNaN(page) && page > 1) pos = page * 10
    for(const user of users) {
      const u = await this.getUser(user.id)
      if(u) embed.addField(`${pos++} - ${u.username} (${user.guessesRight})`, await this.locale('commands.leaderboard.field', {
        v: user.history.length
      }))
    }
    embed.setFooter(await this.locale('commands.leaderboard.footer', {
      pos: array.findIndex(user => user.id === ctx.message.author.id) + 1
    }))
    ctx.reply(embed.build())
  }
}