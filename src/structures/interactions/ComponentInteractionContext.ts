import type { ComponentInteraction, EditInteractionContent, File, Guild, InteractionContent } from 'oceanic.js'
import App from '../client/App.ts'
import locales, { type Args } from '../../locales/index.ts'
import { SabineGuild, SabineUser } from '../../database/index.ts'

type Database = {
  guild?: SabineGuild
  user: SabineUser
}
type ComponentInteractionContextOptions = {
  client: App
  guild?: Guild | null
  interaction: ComponentInteraction
  locale: string
  db: Database
  args: string[]
}
export default class ComponentInteractionContext {
  public client: App
  public guild?: Guild | null
  public interaction: ComponentInteraction
  public locale: string
  public db: Database
  public args: string[]
  public flags?: number
  public constructor(options: ComponentInteractionContextOptions) {
    this.client = options.client
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
  public async reply(content: string | InteractionContent, options?: Args) {
    switch(typeof content) {
    case 'string': {
      if(options?.files) {
        if(this.interaction.acknowledged) return await this.interaction.createFollowup(
          {
            content: locales(this.locale, content, options),
            files: options.files as File[],
            flags: this.flags
          }
        )
        else return await this.interaction.createMessage(
          {
            content: locales(this.locale, content, options),
            files: options.files as File[],
            flags: this.flags
          }
        )
      }
      else {
        if(this.interaction.acknowledged) return await this.interaction.createFollowup(
          {
            content: locales(this.locale, content, options),
            flags: this.flags
          }
        )
        else return await this.interaction.createMessage(
          {
            content: locales(this.locale, content, options),
            flags: this.flags
          }
        )
      }
    }
    case 'object': {
      if(options?.files) {
        if(this.interaction.acknowledged) return await this.interaction.createFollowup(
            Object.assign(
              content,
              {
                files: options.files,
                flags: this.flags
              }
            )
        )
        else return await this.interaction.createMessage(
            Object.assign(
              content,
              {
                files: options.files,
                flags: this.flags
              }
            )
        )
      }
      else {
        if(this.interaction.acknowledged) return await this.interaction.createFollowup(content)
        else return await this.interaction.createMessage(content)
      }
    }
    }
  }
  public async edit(content: string | EditInteractionContent, options?: Args) {
    switch(typeof content) {
    case 'string': {
      if(options?.files) {
        if(this.interaction.acknowledged) return await this.interaction.editOriginal(
          {
            content: locales(this.locale, content, options),
            files: options.files as File[],
            components: [],
            embeds: []
          }
        )
        else return await this.interaction.editParent(
          {
            content: locales(this.locale, content, options),
            files: options.files as File[],
            components: [],
            embeds: []
          }
        )
      }
      else {
        if(this.interaction.acknowledged) return await this.interaction.editOriginal(
          {
            content: locales(this.locale, content, options),
            components: [],
            embeds: []
          }
        )
        else return await this.interaction.editParent(
          {
            content: locales(this.locale, content, options),
            components: [],
            embeds: []
          }
        )
      }
    }
    case 'object': {
      if(options?.files) {
        if(this.interaction.acknowledged) return await this.interaction.editOriginal(
            Object.assign(
              content,
              {
                files: options.files,
                components: [],
                embeds: []
              }
            )
        )
        else return await this.interaction.editParent(
            {
              ...content,
              files: options.files,
              components: [],
              embeds: []
            } as InteractionContent
        )
      }
      else {
        if(this.interaction.acknowledged) return await this.interaction.editOriginal(content as InteractionContent)
        else return await this.interaction.editParent(content as InteractionContent)
      }
    }
    }
  }
}