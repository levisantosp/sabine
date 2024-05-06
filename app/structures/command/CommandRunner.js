import { Guild, User } from '../../../database/index.js'
import { get } from '../../../locales/index.js'
import Logger from '../util/Logger.js'
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
    if(this.message.author.bot) return
    if(this.message.channel.type !== 0) return
    if(guild && guild.prefix) prefix = guild.prefix
    if(!this.message.content.toLowerCase().startsWith(prefix)) return

    let messageArray = this.message.content.split(' ')
    let command = messageArray.shift().toLowerCase()
    let args = messageArray.slice(0)
    let cmd = this.client.commands.get(command.slice(prefix.length)) || this.client.commands.get(this.client.aliases.get(command.slice(prefix.length)))
    if(!cmd) return
    if(cmd.onlyDev && !process.env.DEVS.includes(ctx.message.author.id)) return
    const { permissions } = await import(`../../../locales/locales-${guild.lang}.js`)
    if(cmd.permissions) {
      let perms = []
      for(let perm of cmd.permissions) {
        if(!ctx.message.member.permissions.has(perm)) perms.push(perm)
      }
      if(perms[0]) return ctx.reply('helper.permissions.user', {
        permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
      })
    }
    if(cmd.botPermssions) {
      let perms = []
      let member = this.client.guilds.get(guild.id).members.get(this.client.user.id)
      for(let perm of cmd.botPermssions) {
        if(!member.permissions.has(perm)) perms.push(perm)
      }
      if(perms[0]) return ctx.reply('helper.permissions.bot', {
        permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
      })
    }

    await this.message.channel.sendTyping()

    cmd.locale = async(content, args) => {
      return await get(this.locale, content, args)
    }
    ctx.args = args
    cmd.run(ctx)
    .catch(e => {
      new Logger(this.client).error(e)
      ctx.reply('helper.error', {
        e
      })
    })
  }
}