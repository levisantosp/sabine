import { CommandInteraction, TextChannel } from 'oceanic.js'
import { Guild, User } from '../../database'
import locale from '../../locales'
import EmbedBuilder from '../builders/EmbedBuilder.js'
import App from '../client/App'
import Logger from '../util/Logger.js'
import CommandContext from './CommandContext.js'
import { UserSchemaInterface } from '../../database/schemas/User'
import { GuildSchemaInterface } from '../../database/schemas/Guild'

interface CommandRunnerOptions {
  client: App
  callback: CommandInteraction
  locale: string
}
export default class CommandRunner {
  client: App
  callback: CommandInteraction
  locale: string
  constructor(options: CommandRunnerOptions) {
    this.client = options.client
    this.callback = options.callback
    this.locale = options.locale
  }
  async run() {
    if(this.callback instanceof CommandInteraction) {
      const guild = await Guild.findById(this.callback.guildID)
      const user = await User.findById(this.callback.member?.id)
      const db = {
        user: user as UserSchemaInterface,
        guild: guild as GuildSchemaInterface
      }
      const ctx = new CommandContext(
        {
          client: this.client,
          db,
          guild: this.client.guilds.get(this.callback.guildID!)!,
          callback: this.callback,
          locale: this.locale
        }
      )
      let cmd = this.client.commands.get(this.callback.data.name)
      if(!cmd) return
      const { permissions } = await import(`../../locales/${this.locale}.js`)
      if(cmd.permissions) {
        let perms: string[] = []
        for(let perm of cmd.permissions) {
          if(!ctx.callback.member?.permissions.has(perm as any)) perms.push(perm)
        }
        if(perms[0]) return ctx.reply('helper.permissions.user', {
          permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
        })
      }
      if(cmd.botPermissions) {
        let perms = []
        let member = this.client.guilds.get(guild?.id)?.members.get(this.client.user.id)
        for(let perm of cmd.botPermissions) {
          if(!member?.permissions.has(perm as any)) perms.push(perm)
        }
        if(perms[0]) return ctx.reply('helper.permissions.bot', {
          permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
        })
      }
      if(cmd.ephemeral) {
        await this.callback.defer(64)
      }
      else await this.callback.defer()

      cmd.locale = (content: string, args: any) => {
        return locale(this.locale, content, args)
      }
      cmd.getUser = async(user: string) => {
        try {
          if(isNaN(Number(user))) return await this.client.rest.users.get(user.replace(/[<@!>]/g, ''))
          else return await this.client.rest.users.get(user as string)
        }
        catch(e) {
          new Logger(this.client).error(e as Error)
        }
      }
      ctx.args = ctx.callback.data.options.getSubCommand() ?? []
      if(ctx.args.length > 0) {
        for(const option of ctx.callback.data.options.getOptions()) {
          ctx.args.push(option.value.toString())
        }
      }
      else for(const option of ctx.callback.data.options.getOptions()) {
        ctx.args.push(option.value.toString())
      }
      cmd.id = ctx.callback.data.id
      cmd.run(ctx)
      .catch((e: Error) => {
        new Logger(this.client).error(e)
        ctx.reply('helper.error', {
          e
        })
      })
      .then(async() => {
        const embed = new EmbedBuilder()
        .setAuthor(`${(ctx.callback as CommandInteraction).member?.username}`, ctx.callback.member?.avatarURL())
        .setTitle('New slash command executed')
        .setDescription(`The command \`${cmd.name}\` has been executed in \`${ctx.guild.name}\``)
        .addField('Server ID', `\`${ctx.guild.id}\``)
        .addField('Owner', `\`${ctx.guild.owner?.username}\` (\`${ctx.guild.ownerID}\`)`)
        .addField('Command author', `\`${(ctx.callback as CommandInteraction).member?.username}\``)
        .setThumbnail(ctx.guild.iconURL()!)
  
        const channel = await this.client.rest.channels.get(process.env.COMMAND_LOG!) as TextChannel
        const webhooks = await channel.getWebhooks()
        let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
        if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
        webhook.execute({
          embeds: [embed],
          avatarURL: this.client.user.avatarURL()
        }, webhook.token!)
      })
    }
  }
}