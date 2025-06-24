import translate from "@iamtraction/google-translate"
import createCommand from "../../structures/command/createCommand.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import Logger from "../../structures/util/Logger.ts"
import { createRequire } from "module"
const require = createRequire(import.meta.url)

export default createCommand({
  name: "help",
  category: "misc",
  nameLocalizations: {
    "pt-BR": "ajuda"
  },
  description: "List of commands",
  descriptionLocalizations: {
    "pt-BR": "Lista de comandos"
  },
  options: [
    {
      type: 3,
      name: "command",
      nameLocalizations: {
        "pt-BR": "comando"
      },
      description: "Select the command",
      descriptionLocalizations: {
        "pt-BR": "Selecione o comando"
      },
      autocomplete: true
    }
  ],
  botPermissions: ["EMBED_LINKS"],
  syntax: "help <command>",
  examples: [
    "help",
    "help ping",
    "help team",
    "help player"
  ],
  userInstall: true,
  async run({ ctx, client, t }) {
    if(ctx.args[0]) {
      const cmd = client.commands.get(ctx.args[0])
      if(!cmd || cmd.onlyDev) {
        ctx.reply("commands.help.command_not_found")
        return
      }
      const { permissions } = require(`../ts/${ctx.db.guild.lang}`)
      const embed = new EmbedBuilder()
        .setTitle(ctx.args[0])
        .setDesc((await translate(cmd.description, {
          to: ctx.db.guild.lang
        })).text)
        .addField(t("commands.help.name"), `\`${cmd.name}\``)
        .setFooter({ text: t("commands.help.footer") })
        .setThumb(client.user.avatarURL())
      if(cmd.syntax) embed.addField(t("commands.help.syntax"), `\`/${cmd.syntax}\``)
      if(cmd.syntaxes) embed.addField(t("commands.help.syntax"), cmd.syntaxes.map(syntax => `\`/${syntax}\``).join("\n"))
      if(cmd.examples) embed.addField(t("commands.help.examples"), cmd.examples.map(ex => `\`/${ex}\``).join("\n"))
      if(cmd.permissions) embed.addField(t("commands.help.permissions"), cmd.permissions.map(perm => `\`${permissions[perm]}\``).join(", "), true)
      if(cmd.botPermissions) embed.addField(t("commands.help.bot_permissions"), cmd.botPermissions.map(perm => `\`${permissions[perm]}\``).join(", "), true)
      ctx.reply(embed.build())
    }
    else {
      const embed = new EmbedBuilder()
        .setThumb(client.user.avatarURL())
        .setDesc(t("commands.help.description", {
          arg: `/help [command]`,
          website: "https://sabinebot.xyz/commands"
        }))
      const button = new ButtonBuilder()
        .setLabel(t("commands.help.community"))
        .setStyle("link")
        .setURL("https://discord.gg/g5nmc376yh")
      const privacyButton = new ButtonBuilder()
        .setLabel(t("commands.help.privacy"))
        .setStyle("link")
        .setURL("https://sabinebot.xyz/privacy")
      ctx.reply(embed.build(
        {
          components: [
            {
              type: 1,
              components: [button, privacyButton]
            }
          ]
        }
      ))
    }
  },
  async createAutocompleteInteraction({ i, client }) {
    const commands = Array.from(client.commands).filter(c => {
      if(c[0].includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return c
    })
      .slice(0, 25)
    await i.result(commands.map(cmd => ({ name: cmd[0], value: cmd[0] })))
  }
})
