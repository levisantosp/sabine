import { TextChannel } from 'oceanic.js'
import { App, EmbedBuilder, Listener } from '../structures'

export default class ShardDisconnectListener extends Listener {
  public constructor(client: App) {
    super({
      client,
      name: 'shardResume'
    })
  }
  public async on(id: number) {
    const embed = new EmbedBuilder()
    .setTitle('Shard Resumed')
    .setDescription(`Shard ID: \`${id}\` => \`Resume\``)
    .setFooter(`Instance: ${this.client.user.tag}`, this.client.user.avatarURL())
    .setTimestamp()
    const channel = await this.client.rest.channels.get(process.env.SHARD_LOG!) as TextChannel
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
    if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
    webhook.execute({
      embeds: [embed],
      avatarURL: this.client.user.avatarURL()
    }, webhook.token!)
  }
}