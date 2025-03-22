import { TextChannel } from "oceanic.js"
import { Blacklist, BlacklistSchemaInterface } from "../database/index.js"
import createListener from "../structures/client/createListener.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"

export default createListener({
  name: "guildCreate",
  async run(client, guild) {
    const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface;
    const ban = blacklist.guilds.find(g => g.id === guild.id);
    if(ban) return await guild.leave();
    const embed = new EmbedBuilder()
    .setTitle(`I've been added to \`${guild.name} (${guild.id})\``)
    .setDesc(`Now I'm on ${client.guilds.size} guilds`)
    .addField("Owner", `\`${guild.owner?.username} (${guild.ownerID})`, true)
    .addField("Member count", guild.memberCount.toString(), true)
    .setThumb(guild.iconURL()!);
    const channel = await client.rest.channels.get(process.env.GUILDS_LOG!) as TextChannel;
    const webhooks = await channel.getWebhooks();
    let webhook = webhooks.find(w => w.name === `${client.user.username} Logger`);
    if(!webhook) webhook = await channel.createWebhook({ name: `${client.user.username} Logger` });
    webhook.execute({
      embeds: [embed],
      avatarURL: client.user.avatarURL()
    }, webhook.token!);
  }
});