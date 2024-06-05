import { User } from '../../../database'
import { App, Command, CommandContext, EmbedBuilder } from '../../structures'


export default class LeaderboardCommand extends Command {
  constructor(client: App) {    
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
  async run(ctx: CommandContext) {
    let users = (await User.find({
      guessesRight: {
        $gt: 0
      }
    })).sort((a: any, b: any) => b.guessesRight - a.guessesRight)
    let array = users
    let page = Number(ctx.args[0])
    if(!page || page === 1 || isNaN(page)) {
      users = users.slice(0, 10)
      page = 1
    }
    else users = users.slice(page * 10 - 10, page * 10)
  
    const embed = new EmbedBuilder()
    .setAuthor(this.locale('commands.leaderboard.author', {
      page,
      pages: Math.ceil(array.length / 10)
    }))
    .setTitle(this.locale('commands.leaderboard.title'))
    .setThumbnail((await this.getUser(array[0].id))?.avatarURL!)

    let pos = 1
    if(!isNaN(page) && page > 1) pos = page * 10
    for(const user of users) {
      const u = await this.getUser(user.id)
      if(u) embed.addField(`${pos++} - ${u.username} (${user.guessesRight})`, this.locale('commands.leaderboard.field', {
        v: user.history.length
      }))
    }
    embed.setFooter(this.locale('commands.leaderboard.footer', {
      pos: array.findIndex((user: any) => user.id === ctx.message.author.id) + 1
    }))
    ctx.reply(embed.build())
  }
}