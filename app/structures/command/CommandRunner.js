import { Guild, User } from '../../../database/index.js'
import { get } from '../../../locales/index.js'
import CommandContext from './CommandContext.js'

export default class CommandRunner {
  constructor(options) {
    this.client = options.client
    this.message = options.message
    this.locale = options.locale
  }
  async run() {
    let prefix = process.env.PREFIX
    const guild = await Guild.findById(this.message.guildID)
    const user = await User.findById(this.message.author.id)
    if(this.message.author.bot) return
    if(this.message.channel.type !== 0) return
    if(guild && guild.prefix) prefix = guild.prefix
    if(!this.message.content.toLowerCase().startsWith(prefix)) return

    let messageArray = this.message.content.split(' ')
    let command = messageArray.shift().toLowerCase()
    let args = messageArray.slice(0)
    let cmd = this.client.commands.get(command.slice(prefix.length)) || this.client.commands.get(this.client.aliases.get(command.slice(prefix.length)))
    if(!cmd) return
    
    const db = {
      user,
      guild
    }
    const ctx = new CommandContext(
      {
        client: this.client,
        db,
        guild: this.client.guilds.get(this.message.guildID),
        message: this.message,
        locale: this.locale
      }
    )
    cmd.locale = async(content, args) => {
      return await get(this.locale, content, args)
    }
    ctx.args = args
    cmd.run(ctx)
  }
}