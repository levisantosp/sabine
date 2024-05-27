import Command from '../structures/command/Command.js'
import Util from 'util'
import { Guild, User, Matches, Client } from '../../database/index.js'

export default class EvalCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'eval',
      aliases: ['e', 'ev'],
      onlyDev: true
    })
  }
  async run(ctx) {
    try {
      const ev = Util.inspect(eval(ctx.args.join(' ')))
      ctx.reply(`\`\`\`js\n${ev.slice(0, 1800)}\`\`\``)
    }
    catch(e) {
      ctx.reply(`\`\`\`${e}\`\`\``.slice(0, 1800))
    }
  }
}