import * as Discord from 'discord.js'
import App from '../app/App.ts'
import locales from '../../locales/index.ts'
import type { Args, Content } from '../../locales/index.ts'
import { SabineGuild, SabineUser } from '../../database/index.ts'

type Database = {
  guild?: SabineGuild
  user: SabineUser
}

type CommandContextOptions = {
  app: App
  guild?: Discord.Guild | null
  interaction: Discord.ChatInputCommandInteraction
  locale: string
  db: Database
  args: (string | number | boolean)[]
}

export default class CommandContext {
  public app: App
  public guild?: Discord.Guild | null
  public interaction: Discord.ChatInputCommandInteraction
  public locale: string
  public db: Database
  public args: (string | number | boolean)[]

  public constructor(options: CommandContextOptions) {
    this.app = options.app
    this.guild = options.guild
    this.interaction = options.interaction
    this.locale = options.locale
    this.db = options.db
    this.args = options.args
  }

  public t(content: Content, args?: Args) {
    return locales(this.locale, content, args)
  }

  public async reply(content: Content | Discord.InteractionReplyOptions, options?: Args): Promise<Discord.Message | null | undefined> {
    if(typeof content === 'string') {
      content = {
        content: locales(this.locale, content, options)
      }
    }

    if(options && options.files) {
      content = {
        ...content,
        files: options.files as (Discord.AttachmentBuilder | Discord.AttachmentPayload)[]
      }
    }

    if(this.interaction.replied || this.interaction.deferred) {
      return await this.interaction.followUp(content)
    }

    else return (await this.interaction.reply({ ...content, withResponse: true })).resource?.message
  }

  public async edit(
    content:
      | Content
      | Discord.InteractionEditReplyOptions,
    options?: Args
  ): Promise<Discord.Message | null | undefined> {
    if(typeof content === 'string') {
      content = {
        content: locales(this.locale, content, options)
      }
    }

    if(options && options.files) {
      content = {
        ...content,
        files: options.files as (Discord.AttachmentBuilder | Discord.AttachmentPayload)[]
      }
    }

    if(!content.components) {
      content = {
        ...content,
        components: []
      }
    }

    if(this.interaction.replied || this.interaction.deferred) {
      return await this.interaction.editReply(content)
    }

    else return (await this.interaction.reply({
      content: locales(this.locale, 'helper.interaction_failed'),
      flags: 64,
      withResponse: true
    })).resource?.message
  }
}