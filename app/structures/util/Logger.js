import colors from 'colors'
import moment from 'moment'
import EmbedBuilder from '../embed/EmbedBuilder.js'
moment.locale('pt-br')

export default class Logger {
  constructor(client) {
    this.client = client
  }
  static send(message) {
    return console.log(colors.green(`[${moment(Date.now()).format('hh:mm')}] ${message}`))
  }
  static warn(message) {
    return console.log(colors.yellow(`[${moment(Date.now()).format('hh:mm')}] ${message}`))
  }
  async error(error) {
    const embed = new EmbedBuilder()
    .setTitle('An error has occurred')
    .setDescription(`\`\`\`js\n${error.stack}\`\`\``)

    const channel = await this.client.getRESTChannel(process.env.ERROR_LOG)
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
    if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
    
    this.client.executeWebhook(webhook.id, webhook.token, {
      embed,
      avatarURL: this.client.user.avatarURL
    })
    return console.log(colors.red(`[${moment(Date.now()).format('hh:mm')}] ${error.stack}`))
  }
}