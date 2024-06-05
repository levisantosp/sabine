import colors from 'colors'
import moment from 'moment'
import EmbedBuilder from '../builders/EmbedBuilder'
import App from '../client/App'
import { TextChannel } from 'eris'
moment.locale('pt-br')

export default class Logger {
  client: App
  constructor(client: App) {
    this.client = client
  }
  static send(message: string) {
    return console.log(colors.green(`[${moment(Date.now()).format('hh:mm')}] ${message}`))
  }
  static warn(message: string) {
    return console.log(colors.yellow(`[${moment(Date.now()).format('hh:mm')}] ${message}`))
  }
  async error(error: Error) {
    const embed = new EmbedBuilder()
    .setTitle('An error has occurred')
    .setDescription(`\`\`\`js\n${error.stack}\`\`\``)

    const channel = await this.client.getRESTChannel(process.env.ERROR_LOG) as TextChannel
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
    if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
    
    this.client.executeWebhook(webhook.id, webhook.token!, {
      embed,
      avatarURL: this.client.user.avatarURL
    })
    return console.log(colors.red(`[${moment(Date.now()).format('hh:mm')}] ${error.stack}`))
  }
}