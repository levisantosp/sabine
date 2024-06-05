import { App, Command, CommandContext } from '../../structures'


export default class PingCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'ping',
      description: 'Shows my latency on this shard'
    })
  }
  async run(ctx: CommandContext) {
    ctx.reply(`Pong! \`${ctx.guild.shard.latency}ms\``)
  }
}