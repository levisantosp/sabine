import { Guild } from '../../database/index.js'
import Listener from '../structures/client/Listener.js'
import CommandRunner from '../structures/command/CommandRunner.js'

export default class MessageCreateListener extends Listener {
  constructor(client) {
    super({
      client,
      name: 'messageCreate'
    })
  }
  async on(message) {
    const guild = await Guild.findById(message.guildID) || new Guild(
      {
        _id: message.guildID
      }
    )

    await guild.save()
    new CommandRunner(
      {
        client: this.client,
        message,
        locale: guild.lang
      }
    )
    .run()
  }
}