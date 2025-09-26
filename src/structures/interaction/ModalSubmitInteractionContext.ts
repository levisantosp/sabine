import * as Oceanic from "oceanic.js"
import App from "../client/App.ts"
import locales, { type Content, type Args } from "../../locales/index.ts"
import { SabineGuild, SabineUser } from "../../database/index.ts"

type Database = {
  guild?: SabineGuild
  user: SabineUser
}

type ModalSubmitInteractionContextOptions = {
  client: App
  guild?: Oceanic.Guild | null
  interaction: Oceanic.ModalSubmitInteraction
  locale: string
  db: Database
  args: string[]
}

export default class ModalSubmitInteractionContext {
  public client: App
  public guild?: Oceanic.Guild | null
  public interaction: Oceanic.ModalSubmitInteraction
  public locale: string
  public db: Database
  public args: string[]
  public flags?: number

  public constructor(options: ModalSubmitInteractionContextOptions) {
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

  public async reply(content: Content | Oceanic.InteractionContent, options?: Args): Promise<Oceanic.Message> {
    if(typeof content === "string") {
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
    if(typeof content === "string") {
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
      return await this.interaction.editOriginal(content)
    }

    else return await (await this.interaction.createMessage({
      content: locales(this.locale, "helper.interaction_failed"),
      flags: 64
    })).getMessage()
  }
}