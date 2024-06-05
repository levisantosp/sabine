import { App, Command, CommandContext, EmbedBuilder } from '../../structures'

export default class GuessesCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'guesses',
      aliases: ['historico', 'histórico', 'palpites'],
      description: 'Shows your guesses',
      syntax: 'guesses <page>',
      examples: [
        'guesses',
        'guesses 1',
        'guesses 2',
        'guesses 3'
      ],
      botPermissions: ['embedLinks']
    })
  }
  async run(ctx: CommandContext) {
    if(!ctx.db.user?.history?.length) return ctx.reply('commands.history.no_guesses')
    let history = ctx.db.user.history.reverse()
    if(!Number(ctx.args[0]) || isNaN(Number(ctx.args[0])) || Number(ctx.args[0]) == 1) history = history.slice(0, 5)
    else history = history.slice(Number(ctx.args[0]) * 5 - 5, Number(ctx.args[0]) * 5)

    const embed = new EmbedBuilder()
    .setAuthor(this.locale('commands.history.embed.author'), ctx.message.author.avatarURL)
    .setDescription(this.locale('commands.history.embed.desc', {
      right: ctx.db.user.guessesRight,
      wrong: ctx.db.user.guessesWrong,
      t: ctx.db.user.history.length
    }))
    .setFooter(this.locale('commands.history.embed.footer', { 
      p1: isNaN(Number(ctx.args[0])) ? 1 : Number(ctx.args[0]),
      p2: Math.ceil(ctx.db.user.history.length / 5)
    }))

    for (const guess of history) {
      embed.addField(`${guess.teams[0].name} x ${guess.teams[1].name}`, this.locale('commands.history.embed.field', {
        score1: guess.teams[0].score,
        score2: guess.teams[1].score,
        link: `https://www.vlr.gg/${guess.match}`
      }))
    }
    ctx.reply(embed.build())
  }
}