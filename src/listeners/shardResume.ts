import type { TextChannel } from 'oceanic.js'
import createListener from '../structures/client/createListener.ts'
import EmbedBuilder from '../structures/builders/EmbedBuilder.ts'

export default createListener({
  name: 'shardReady',
  async run(client, shard) {
    const embed = new EmbedBuilder()
      .setTitle('Shard Resumed')
      .setDesc(`Shard ID: \`${shard}\` => \`Resumed\``)
      .setFooter({
        text: `Instance: ${client.user.tag}`,
        iconURL: client.user.avatarURL()
      })
      .setTimestamp()
    const channel = await client.rest.channels.get(process.env.SHARD_LOG!) as TextChannel
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.find(w => w.name === `${client.user.username} Logger`)
    if(!webhook) webhook = await channel.createWebhook({ name: `${client.user.username} Logger` })
    webhook.execute({
      embeds: [embed],
      avatarURL: client.user.avatarURL()
    }, webhook.token!)
  }
})