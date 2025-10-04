import type { Guild, TextChannel } from 'oceanic.js'
import createListener from '../structures/client/createListener.ts'
import EmbedBuilder from '../structures/builders/EmbedBuilder.ts'

export default createListener({
  name: 'guildDelete',
  async run(client, guild) {
    const embed = new EmbedBuilder()
      .setTitle(`I've been removed from \`${(guild as Guild).name} (${(guild as Guild).id})\``)
      .setDesc(`Now I'm on ${client.guilds.size} guilds`)
      .addField('Owner', `\`${(guild as Guild).owner?.username} (${(guild as Guild).ownerID})`, true)
      .addField('Member count', (guild as Guild).memberCount.toString(), true)
      .setThumb((guild as Guild).iconURL()!)

    const channel = await client.rest.channels.get(process.env.GUILDS_LOG!) as TextChannel
    const webhooks = await channel.getWebhooks()

    let webhook = webhooks.find(w => w.name === `${client.user.username} Logger`)

    if(!webhook) webhook = await channel.createWebhook({ name: `${client.user.username} Logger` })

    if(await client.prisma.guild.findUnique({ where: { id: guild.id } })) {
      await client.prisma.guild.delete({
        where: {
          id: guild.id
        }
      })
    }
    
    await webhook.execute({
      embeds: [embed],
      avatarURL: client.user.avatarURL()
    }, webhook.token!)
  }
})