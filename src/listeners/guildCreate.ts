import type { TextChannel } from 'oceanic.js'
import createListener from '../structures/client/createListener.ts'
import EmbedBuilder from '../structures/builders/EmbedBuilder.ts'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default createListener({
  name: 'guildCreate',
  async run(client, guild) {
    const blacklist = (await prisma.blacklists.findFirst())!
    const ban = blacklist.guilds.find(g => g.id === guild.id)
    if(ban) return await guild.leave()
    const embed = new EmbedBuilder()
      .setTitle(`I've been added to \`${guild.name} (${guild.id})\``)
      .setDesc(`Now I'm on ${client.guilds.size} guilds`)
      .addField('Owner', `\`${guild.owner?.username} (${guild.ownerID})`, true)
      .addField('Member count', guild.memberCount.toString(), true)
      .setThumb(guild.iconURL()!)
    const channel = await client.rest.channels.get(process.env.GUILDS_LOG!) as TextChannel
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.find(w => w.name === `${client.user.username} Logger`)
    if(!webhook) webhook = await channel.createWebhook({ name: `${client.user.username} Logger` })
    webhook.execute({
      embeds: [embed],
      avatarURL: client.user.avatarURL()
    }, webhook.token!)
  }
})