import Command from '../structures/command/Command.js'

export default class PlayerCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'player',
      aliases: ['jogador', 'p']
    })
  }
  async run(ctx) {
    
  }
}