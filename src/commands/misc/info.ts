import ms from "humanize-duration"
import createCommand from "../../structures/command/createCommand.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import { fileURLToPath } from "url"
import path from "path"
import { readFileSync } from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pkgFile = path.resolve(__dirname, "../../../package.json")
const pkg = JSON.parse(readFileSync(pkgFile, "utf-8"))

export default createCommand({
  name: "info",
  category: "misc",
  description: "Shows the bot info",
  descriptionLocalizations: {
    "pt-BR": "Mostra as informações do bot"
  },
  userInstall: true,
  async run({ ctx, client, t }) {
    const creator = client.users.get("441932495693414410")!
    const embed = new EmbedBuilder()
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.avatarURL()
      })
      .setThumb(creator.avatarURL())
      .setTitle(t("commands.info.embed.title"))
      .setFields(
        {
          name: "Patch",
          value: pkg.version,
          inline: true
        },
        {
          name: t("commands.info.lib"),
          value: "[oceanic.js](https://oceanic.ws/)",
          inline: true
        },
        {
          name: t("commands.info.creator"),
          value: creator.tag,
          inline: true
        },
        {
          name: t("commands.info.guilds"),
          value: client.guilds.size.toString(),
          inline: true
        },
        {
          name: t("commands.info.users"),
          value: client.users.filter(user => !user.bot).length.toString(),
          inline: true
        },
        {
          name: "Client",
          value: `Shards: \`${client.shards.size}\`\nShard Uptime: \`${ms(client.uptime, { language: ctx.db.user.lang ?? ctx.db.guild.lang, round: true })}\`\nClient Uptime: \`${ms(Date.now() - client._uptime, { language: ctx.db.user.lang ?? ctx.db.guild.lang, round: true })}\``,
          inline: true
        }
      )
    ctx.reply(embed.build(
      {
        components: [
          {
            type: 1,
            components: [
              new ButtonBuilder()
                .setLabel(t("commands.help.community"))
                .setStyle("link")
                .setURL("https://discord.gg/g5nmc376yh"),
              new ButtonBuilder()
                .setLabel(t("commands.info.invite"))
                .setStyle("link")
                .setURL("https://discord.com/oauth2/authorize?client_id=1235576817683922954&scope=bot&permissions=388096")
            ]
          }
        ]
      }
    ))
  }
})