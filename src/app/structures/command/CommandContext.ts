import { AdvancedMessageContent, Guild, Message } from 'eris'
import locale from '../../../locales'
import App from '../client/App'

interface CommandContextOptions {
  client: App
  db: any
  guild: Guild
  message: Message
  locale: string
}
export default class CommandContext {
  client: App
  db: any
  guild: Guild
  message: Message
  locale: string
  args!: string[]
  constructor(options: CommandContextOptions) {
    this.client = options.client
    this.db = options.db
    this.guild = options.guild
    this.message = options.message
    this.locale = options.locale
  }
  async reply(content: string | AdvancedMessageContent, options?: any) {
    switch(typeof content) {
      case 'string': {
        if(options?.name && options?.file) {
          return this.message.channel.createMessage(
            {
              content: locale(this.locale, content ?? content, options),
              messageReference: {
                messageID: this.message.id
              }
            },
            {
              file: options?.file,
              name: options?.name
            }
          )
        }
        else return this.message.channel.createMessage(
          {
            content: locale(this.locale, content, options),
            messageReference: {
              messageID: this.message.id
            }
          }
        )
      }
      case 'object': {
        if(options?.options && options?.name) {
          return this.message.channel.createMessage(Object.assign(content, {
            messageReference: {
              messageID: this.message.id
            }
          }),
            {
              file: options?.file,
              name: options?.name
            }
          )
        }
        else return this.message.channel.createMessage(Object.assign(content, {
          messageReference: {
            messageID: this.message.id
          }
        }))
      }
    }
  }
}