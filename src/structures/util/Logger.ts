import colors from 'colors'
import moment from 'moment'
import EmbedBuilder from '../builders/EmbedBuilder'
import App from '../client/App'
import { TextChannel } from 'oceanic.js'
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
  async error(error: string | Error, shardId?: number) {
    const errors = [
      'Missing Permissions'
    ]
    if(errors.some(e => error.toString().includes(e))) return
    switch(typeof error) {
      case 'string': {
        const embed = new EmbedBuilder()
        .setTitle('An error has occurred')
        .setDescription(`\`\`\`js\n${error}\`\`\``)
        if(shardId) embed.addField('Shard ID', shardId.toString())

        const channel = await this.client.rest.channels.get(process.env.ERROR_LOG!) as TextChannel
        const webhooks = await channel.getWebhooks()
        let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
        if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
        webhook.execute({
          embeds: [embed],
          avatarURL: this.client.user.avatarURL()
        }, webhook.token!)
        return console.log(colors.red(`[${moment(Date.now()).format('hh:mm')}] ${error}`))
      }
      default: {
        const embed = new EmbedBuilder()
        .setTitle('An error has occurred')
        .setDescription(`\`\`\`js\n${error.stack}\`\`\``)
        if(shardId) embed.addField('Shard ID', shardId.toString())

        const channel = await this.client.rest.channels.get(process.env.ERROR_LOG!) as TextChannel
        const webhooks = await channel.getWebhooks()
        let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
        if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
        webhook.execute({
          embeds: [embed],
          avatarURL: this.client.user.avatarURL()
        }, webhook.token!)
        return console.log(colors.red(`[${moment(Date.now()).format('hh:mm')}] ${error.stack}`))
      }
    }
  }
}