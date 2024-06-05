import { Message } from 'eris'
import { App, CommandRunner, Listener } from '../structures'
import { Guild } from '../../database'


export default class MessageCreateListener extends Listener {
  constructor(client: App) {
    super({
      client,
      name: 'messageCreate'
    })
  }
  async on(message: Message) {
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