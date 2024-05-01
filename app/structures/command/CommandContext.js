import { get } from '../../../locales/index.js'

export default class CommandContext {
  constructor(options) {
    this.client = options.client
    this.db = options.db
    this.guild = options.guild
    this.message = options.message
    this.locale = options.locale
  }
  async reply(content, options) {
    switch (typeof content) {
      case 'string': {
        if(options?.name && options?.file) {
          return this.message.channel.createMessage(
            {
              content: await get(this.locale, content ?? content, options),
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
            content: await get(this.locale, content, options),
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