import { Guild, TextChannel } from 'eris'
import { App, EmbedBuilder, Listener } from '../structures'

export default class GuildDeleteListener extends Listener {
  constructor(client: App) {
    super({
      client,
      name: 'guildDelete'
    })
  }
  async on(guild: Guild) {
    const embed = new EmbedBuilder()
    .setTitle(`I've been removed from \`${guild.name} (${guild.id})\``)
    .setDescription(`Now I'm on ${this.client.guilds.size} guilds`)
    .addField('Owner ID', guild.ownerID, true)
    .addField('Member count', guild.memberCount.toString(), true)
    .setThumbnail(guild.iconURL!)

    const channel = await this.client.getRESTChannel(process.env.GUILDS_LOG!) as TextChannel
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
    if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
    
    this.client.executeWebhook(webhook.id, webhook.token!, {
      embed,
      avatarURL: this.client.user.avatarURL
    })
  }
}