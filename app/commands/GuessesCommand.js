import Command from '../structures/command/Command.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'

export default class GuessesCommand extends Command {
  constructor(client) {
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
  async run(ctx) {
    if(!ctx.db.user.history?.length) return ctx.reply('commands.history.no_guesses')
    let history = ctx.db.user.history.reverse()
    if(!ctx.args[0] || ctx.args[0] == 1) history = history.slice(0, 5)
    else history = history.slice(ctx.args[0] * 5 - 5, ctx.args[0] * 5)

    const embed = new EmbedBuilder()
    .setAuthor(await this.locale('commands.history.embed.author'), ctx.message.author.avatarURL)
    .setDescription(await this.locale('commands.history.embed.desc', {
      right: ctx.db.user.guessesRight,
      wrong: ctx.db.user.guessesWrong,
      t: ctx.db.user.history.length
    }))
    .setFooter(await this.locale('commands.history.embed.footer', { 
      p1: isNaN(ctx.args[0]) ? 1 : ctx.args[0],
      p2: Math.ceil(ctx.db.user.history.length / 5)
    }))

    for (const guess of history) {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json()
      const res2 = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json()
      let data = res.data.filter(d => d.id == guess.match)[0]
      if(!data) {
        data = res2.data.filter(d => d.id == guess.match)[0]
        embed.addField(`${guess.teams[0].name} x ${guess.teams[1].name}`, await this.locale('commands.history.embed.field', {
          score1: guess.teams[0].score,
          score2: guess.teams[1].score,
          link: `https://www.vlr.gg/${data.id}`
        }))
      }
      else embed.addField(`${guess.teams[0].name} x ${guess.teams[1].name}`, await this.locale('commands.history.embed.field2', {
        score1: guess.teams[0].score,
        score2: guess.teams[1].score,
        score3: data.teams[0].score,
        score4: data.teams[1].score,
        link: `https://www.vlr.gg/${data.id}`
      }))
    }

    ctx.reply(embed.build())
  }
}