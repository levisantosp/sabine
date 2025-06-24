import * as Oceanic from "oceanic.js"
import App from "../client/App.ts"
import locales from "../../locales/index.ts"
import type { Args } from "../../locales/index.ts"
import Logger from "../util/Logger.ts"
import type { guilds, users } from "@prisma/client"

type Database = {
  guild: guilds
  user: users
}
type CommandContextOptions = {
  client: App
  guild: Oceanic.Guild | null
  interaction: Oceanic.CommandInteraction | Oceanic.ComponentInteraction | Oceanic.ModalSubmitInteraction
  locale: string
  db: Database
  args: string[]
}
export default class CommandContext {
  public client: App
  public guild: Oceanic.Guild | null
  public interaction: Oceanic.CommandInteraction | Oceanic.ComponentInteraction | Oceanic.ModalSubmitInteraction
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
  public async reply(content: string | Oceanic.InteractionContent, options?: Args) {
    switch(typeof content) {
      case "string": {
        if(options?.files) {
          if(this.interaction.acknowledged) return await this.interaction.createFollowup(
            {
              content: locales(this.locale, content, options),
              files: options.files as Oceanic.File[]
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
          if(this.interaction.acknowledged) return await this.interaction.createFollowup(Object.assign(content, { files: options.files as Oceanic.File[] })).catch(e => new Logger(this.client).error(e))
          else return await this.interaction.createMessage(Object.assign(content, { files: options.files as Oceanic.File[] })).catch(e => new Logger(this.client).error(e))
        }
        else {
          if(this.interaction.acknowledged) return await this.interaction.createFollowup(content).catch(e => new Logger(this.client).error(e))
          else return await this.interaction.createMessage(content).catch(e => new Logger(this.client).error(e))
        }
      }
    }
  }
  public async edit(content: string | Oceanic.EditInteractionContent, options?: Args) {
    if(this.interaction instanceof Oceanic.CommandInteraction) {
      switch(typeof content) {
        case "string": {
          if(options?.files) {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                files: options.files as Oceanic.File[],
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
                  files: options.files as Oceanic.File[],
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
    else if(this.interaction instanceof Oceanic.ComponentInteraction) {
      switch(typeof content) {
        case "string": {
          if(options?.files) {
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                files: options.files as Oceanic.File[],
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
            if(this.interaction.acknowledged) return await this.interaction.editOriginal(Object.assign(content, { files: options.files as Oceanic.File[] })).catch(e => new Logger(this.client).error(e))
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