import Listener from '../structures/client/Listener.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'

export default class GuildCreateListener extends Listener {
  constructor(client) {
    super({
      client,
      name: 'guildCreate'
    })
  }
  async on(guild) {
    const embed = new EmbedBuilder()
    .setTitle(`I've been added to \`${guild.name} (${guild.id})\``)
    .setDescription(`Now I'm on ${this.client.guilds.size} guilds`)
    .addField('Owner ID', guild.ownerID, true)
    .addField('Member count', guild.memberCount, true)
    .setThumbnail(guild.iconURL)

    const channel = await this.client.getRESTChannel(process.env.GUILDS_LOG)
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.find(w => w.name === `${this.client.user.username} Logger`)
    if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
    
    this.client.executeWebhook(webhook.id, webhook.token, {
      embed,
      avatarURL: this.client.user.avatarURL
    })
  }
}