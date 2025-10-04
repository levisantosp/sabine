import * as Oceanic from 'oceanic.js'
import App from '../client/App.ts'
import locales from '../../locales/index.ts'
import type { Args, Content } from '../../locales/index.ts'
import { SabineGuild, SabineUser } from '../../database/index.ts'

type Database = {
  guild?: SabineGuild
  user: SabineUser
}

type CommandContextOptions = {
  client: App
  guild?: Oceanic.Guild | null
  interaction: Oceanic.CommandInteraction
  locale: string
  db: Database
  args: (string | number | boolean)[]
}

export default class CommandContext {
  public client: App
  public guild?: Oceanic.Guild | null
  public interaction: Oceanic.CommandInteraction | Oceanic.ComponentInteraction | Oceanic.ModalSubmitInteraction
  public locale: string
  public db: Database
  public args: (string | number | boolean)[]

  public constructor(options: CommandContextOptions) {
    this.client = options.client
    this.guild = options.guild
    this.interaction = options.interaction
    this.locale = options.locale
    this.db = options.db
    this.args = options.args
  }

  public t(content: Content, args?: Args) {
    return locales(this.locale, content, args)
  }

  public async reply(content: Content | Oceanic.InteractionContent, options?: Args): Promise<Oceanic.Message> {
    if(typeof content === 'string') {
      content = {
        content: locales(this.locale, content, options)
      }
    }

    if(options && options.files) {
      content = {
        ...content,
        files: options.files as Oceanic.File[]
      }
    }

    if(this.interaction.acknowledged) {
      return await (await this.interaction.createFollowup(content)).getMessage()
    }

    else return await (await this.interaction.createMessage(content)).getMessage()
  }
  
  public async edit(content: Content | Oceanic.EditInteractionContent, options?: Args): Promise<Oceanic.Message> {
    if(typeof content === 'string') {
      content = {
        content: locales(this.locale, content, options)
      }
    }

    if(options && options.files) {
      content = {
        ...content,
        files: options.files as Oceanic.File[]
      }
    }

    if(!content.components) {
      content = {
        ...content,
        components: []
      }
    }

    if(this.interaction.acknowledged) {
      return await this.interaction.editOriginal(content)
    }

    else return await (await this.interaction.createMessage({
      content: locales(this.locale, 'helper.interaction_failed'),
      flags: 64
    })).getMessage()
  }
}