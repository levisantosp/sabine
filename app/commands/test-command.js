import Command from '../structures/command/Command.js'

export default class PingCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'test'
    })
  }
  async run(ctx) {
    ctx.reply(`hello world`)
  }
}