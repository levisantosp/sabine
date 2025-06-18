import {
  CommandInteraction,
  ComponentInteraction,
  EditInteractionContent,
  File,
  Guild,
  InteractionContent,
  ModalSubmitInteraction,
} from "oceanic.js"
import App from "../client/App.js"
import locales, { Args } from "../../locales/index.js"
import { GuildSchemaInterface, UserSchemaInterface } from "../../database/index.js"
import Logger from "../util/Logger.js"

type Database = {
  guild: GuildSchemaInterface
  user: UserSchemaInterface
}
type CommandContextOptions = {
  client: App
  guild: Guild
  interaction: CommandInteraction | ComponentInteraction | ModalSubmitInteraction
  locale: string
  db: Database
  args: string[]
}
export default class CommandContext {
  public client: App
  public guild: Guild
  public interaction: CommandInteraction | ComponentInteraction | ModalSubmitInteraction
  public locale: string
  public db: Database
  public args: string[]
  public constructor(options: CommandContextOptions) {
    this.client = options.client
    this.guild = options.guild
    this.interaction = options.interaction
    this.locale = options.locale
    this.db = options.db
    this.args = options.args
  }
  public async reply(content: string | InteractionContent, options?: Args) {
    switch (typeof content) {
      case "string": {
        if(options?.files) {
          if(this.interaction.acknowledged) return await this.interaction.createFollowup(
            {
              content: locales(this.locale, content, options),
              files: options.files as File[]
            }
          ).catch(e => new Logger(this.client).error(e))
          else return await this.interaction.createMessage(
            {
              content: locales(this.locale, content, options)
            }
          ).catch(e => new Logger(this.client).error(e))
        }
        else {
          if(this.interaction.acknowledged) return await this.interaction.createFollowup(
            {
              content: locales(this.locale, content, options)
            }
          ).catch(e => new Logger(this.client).error(e))
          else return await this.interaction.createMessage(
            {
              content: locales(this.locale, content, options)
            }
          ).catch(e => new Logger(this.client).error(e))
        }
      }
      case "object": {
        if(options?.files) {
          if(this.interaction.acknowledged) return await this.interaction.createFollowup(Object.assign(content, { files: options.files as File[] })).catch(e => new Logger(this.client).error(e))
          else return await this.interaction.createMessage(Object.assign(content, { files: options.files as File[] })).catch(e => new Logger(this.client).error(e))
        }
        else {
          if(this.interaction.acknowledged) return await this.interaction.createFollowup(content).catch(e => new Logger(this.client).error(e))
          else return await this.interaction.createMessage(content).catch(e => new Logger(this.client).error(e))
        }
      }
    }
  }
  public async edit(content: string | EditInteractionContent, options?: Args) {
    if(this.interaction instanceof CommandInteraction) {
      switch (typeof content) {
        case "string": {
          if(options?.files) {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                files: options.files as File[],
                components: []
              }
            ).catch(e => new Logger(this.client).error(e))
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
          else {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                components: []
              }
            ).catch(e => new Logger(this.client).error(e))
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
        }
        case "object": {
          if(options?.files) {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(
              Object.assign(
                content,
                {
                  files: options.files as File[],
                  components: []
                }
              )
            )
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
          else {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal({
              ...content,
              components: []
            })
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
        }
      }
    }
    else if(this.interaction instanceof ComponentInteraction) {
      switch (typeof content) {
        case "string": {
          if(options?.files) {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                files: options.files as File[],
                components: []
              }
            ).catch(e => new Logger(this.client).error(e))
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
          else {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                components: []
              }
            ).catch(e => new Logger(this.client).error(e))
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
        }
        case "object": {
          if(options?.files) {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(Object.assign(content, { files: options.files as File[] })).catch(e => new Logger(this.client).error(e))
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
          else {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal({
              ...content,
              components: !content.components ? [] : content.components,
              content: !content.content ? "" : content.content
            })
            else return await this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            }).catch(e => new Logger(this.client).error(e))
          }
        }
      }
    }
  }
}