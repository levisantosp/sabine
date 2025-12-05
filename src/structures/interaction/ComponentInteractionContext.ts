import * as Discord from 'discord.js'
import App from '../app/App'
import locales, { type Content, type Args } from '@i18n'
import { SabineGuild, SabineUser } from '@db'

type Database = {
  guild?: SabineGuild
  user: SabineUser
}

type ComponentInteractionContextOptions = {
  app: App
  guild?: Discord.Guild | null
  interaction: Discord.MessageComponentInteraction
  locale: string
  db: Database
  args: string[]
}

export default class ComponentInteractionContext {
  public app: App
  public guild?: Discord.Guild | null
  public interaction: Discord.MessageComponentInteraction
  public locale: string
  public db: Database
  public args: string[]
  public flags?: number

  public constructor(options: ComponentInteractionContextOptions) {
    this.app = options.app
    this.guild = options.guild
    this.interaction = options.interaction
    this.locale = options.locale
    this.db = options.db
    this.args = options.args
  }

  public setFlags(flags: number) {
    this.flags = flags
    return this
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

    if(this.flags) {
      content = {
        ...content,
        flags: this.flags
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
  ): Promise<Discord.Message | Discord.InteractionCallbackResponse> {
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

    else return await this.interaction.update({ ...content, withResponse: true })
  }
}