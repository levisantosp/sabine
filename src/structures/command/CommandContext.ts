import { CommandInteraction, CreateMessageOptions, Guild, InitialInteractionContent } from 'oceanic.js'
import locale, { Args } from '../../locales'
import App from '../client/App'
import { GuildSchemaInterface } from '../../database/schemas/Guild'
import { UserSchemaInterface } from '../../database/schemas/User'

type Database = {
  guild: GuildSchemaInterface
  user: UserSchemaInterface
}
interface CommandContextOptions {
  client: App
  db: Database
  guild: Guild
  callback: CommandInteraction
  locale: string
}
export default class CommandContext {
  client: App
  db: Database
  guild: Guild
  callback: CommandInteraction
  locale: string
  args!: string[]
  constructor(options: CommandContextOptions) {
    this.client = options.client
    this.db = options.db
    this.guild = options.guild
    this.callback = options.callback
    this.locale = options.locale
  }
  async reply(content: string | InitialInteractionContent, options?: Args) {
    if(this.callback instanceof CommandInteraction) {
      switch(typeof content) {
        case 'string': {
          if(options?.name && options?.files) {
            await this.callback.defer()
            if(this.callback.acknowledged) return this.callback.createFollowup(
              {
                content: locale(this.locale, content, options)
              }
            )
            else return this.callback.createMessage(
              {
                content: locale(this.locale, content, options)
              }
            )
          }
          else {
            if(this.callback.acknowledged) return this.callback.createFollowup(
              {
                content: locale(this.locale, content, options)
              }
            )
            else return this.callback.createMessage(
              {
                content: locale(this.locale, content, options)
              }
            )
          }
        }
        case 'object': {
          if(options?.options && options?.name) {
            if(this.callback.acknowledged) return this.callback.createFollowup(Object.assign(content))
            else return this.callback.createMessage(Object.assign(content))
          }
          else {
            if(this.callback.acknowledged) return this.callback.createFollowup(Object.assign(content))
            else return this.callback.createMessage(Object.assign(content))
          }
        }
      }
    }
  }
}