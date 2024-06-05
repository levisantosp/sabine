import Command from '../../structures/command/Command'
import Util from 'util'
import { Guild, User, Matches, Client } from '../../../database'
import { App, CommandContext } from '../../structures'

export default class EvalCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'eval',
      aliases: ['e', 'ev'],
      onlyDev: true
    })
  }
  async run(ctx: CommandContext) {
    try {
      const ev = Util.inspect(eval(ctx.args.join(' ')))
      ctx.reply(`\`\`\`js\n${ev.slice(0, 1800)}\`\`\``)
    }
    catch(e) {
      ctx.reply(`\`\`\`${e}\`\`\``.slice(0, 1800))
    }
  }
}