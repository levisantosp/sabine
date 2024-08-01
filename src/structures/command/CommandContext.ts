import { AdvancedMessageContent, CommandInteraction, Guild, Message } from 'eris'
import locale from '../../locales'
import App from '../client/App'

interface CommandContextOptions {
  client: App
  db: any
  guild: Guild
  callback: CommandInteraction
  locale: string
}
export default class CommandContext {
  client: App
  db: any
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
  async reply(content: string | AdvancedMessageContent, options?: any) {
    if(this.callback instanceof CommandInteraction) {
      switch(typeof content) {
        case 'string': {
          if(options?.name && options?.file) {
            return this.callback.createMessage(
              {
                content: locale(this.locale, content ?? content, options)
              },
              {
                file: options?.file,
                name: options?.name
              }
            )
          }
          else return this.callback.createMessage(
            {
              content: locale(this.locale, content, options)
            }
          )
        }
        case 'object': {
          if(options?.options && options?.name) {
            return this.callback.createMessage(Object.assign(content),
              {
                file: options?.file,
                name: options?.name
              }
            )
          }
          else return this.callback.createMessage(Object.assign(content))
        }
      }
    }
  }
}