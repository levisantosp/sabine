import Command from '../structures/command/Command.js'

export default class PingCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'ping',
      description: 'Shows my latency on this shard'
    })
  }
  async run(ctx) {
    ctx.reply(`Pong! \`${ctx.guild.shard.latency}ms\``)
  }
}