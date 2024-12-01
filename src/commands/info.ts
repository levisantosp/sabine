import { ButtonBuilder, createCommand, EmbedBuilder } from "../structures"
import pkg from "../../package.json"
import ms from "humanize-duration"

export default createCommand({
  name: "info",
  description: "Shows the bot info",
  descriptionLocalizations: {
    "pt-BR": "Mostra as informações do bot"
  },
  async run({ ctx, client, locale }) {
    const creator = client.users.get("441932495693414410")!;
    const embed = new EmbedBuilder()
    .setAuthor({
      name: client.user.username,
      iconURL: client.user.avatarURL()
    })
    .setThumb(creator.avatarURL())
    .setTitle(locale("commands.info.embed.title"))
    .setFields(
      [
        {
          name: "Patch",
          value: pkg.version,
          inline: true
        },
        {
          name: locale("commands.info.lib"),
          value: "[oceanic.js](https://oceanic.ws/)",
          inline: true
        },
        {
          name: locale("commands.info.creator"),
          value: creator.tag,
          inline: true
        },
        {
          name: locale("commands.info.guilds"),
          value: client.guilds.size.toString(),
          inline: true
        },
        {
          name: locale("commands.info.users"),
          value: client.users.filter(user => !user.bot).length.toString(),
          inline: true
        },
        {
          name: "Client",
          value: `Shard ID: \`${ctx.guild.shard.id}\`\nShard Uptime: \`${ms(client.uptime, { language: ctx.db.user.lang ?? ctx.db.guild.lang, round: true })}\`\nClient Uptime: \`${ms(Date.now() - client._uptime, { language: ctx.db.user.lang ?? ctx.db.guild.lang, round: true })}\``,
          inline: true
        }
      ]
    );
    ctx.reply(embed.build(
      {
        components: [
          {
            type: 1,
            components: [
              new ButtonBuilder()
              .setLabel(locale("commands.help.community"))
              .setStyle("link")
              .setURL("https://discord.gg/g5nmc376yh"),
              new ButtonBuilder()
              .setLabel(locale("commands.info.invite"))
              .setStyle("link")
              .setURL("https://discord.com/oauth2/authorize?client_id=1235576817683922954&scope=bot&permissions=388096")
            ]
          }
        ]
      }
    ))
  }
});