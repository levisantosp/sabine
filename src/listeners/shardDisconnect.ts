import { ChannelType } from 'discord.js'
import createListener from '../structures/app/createListener.ts'
import EmbedBuilder from '../structures/builders/EmbedBuilder.ts'

export default createListener({
  name: 'shardDisconnect',
  async run(client, close, shard) {
    const embed = new EmbedBuilder()
      .setTitle('Shard Disconnected')
      .setDesc(`Shard ID: \`${shard}\` => \`Disconnected\`\nCode: \`${close.code}\``)
      .setFooter({
        text: `Instance: ${client.user?.tag}`,
        iconURL: client.user?.displayAvatarURL({ size: 2048 })
      })
      .setTimestamp()

    const channel = await client.channels.fetch(process.env.SHARD_LOG!)

    if(!channel || channel.type !== ChannelType.GuildText) return

    const webhooks = await channel.fetchWebhooks()

    let webhook = webhooks.find(w => w.name === `${client.user?.username} Logger`)

    if(!webhook) webhook = await channel.createWebhook({ name: `${client.user?.username} Logger` })

    await webhook.send({
      embeds: [embed],
      avatarURL: client.user?.displayAvatarURL({ size: 2048 })
    })
  }
})