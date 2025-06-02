import translate from "@iamtraction/google-translate"
import createCommand from "../structures/command/createCommand.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"
import Logger from "../structures/util/Logger.js"
import { createRequire } from "module"
const require = createRequire(import.meta.url)

export default createCommand({
  name: "help",
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
  async run({ ctx, client, locale }) {
    if(ctx.args[0]) {
      const cmd = client.commands.get(ctx.args[0])
      if(!cmd || cmd.onlyDev) {
        ctx.reply("commands.help.command_not_found")
        return
      }
      const { permissions } = require(`../locales/${ctx.db.guild.lang}`)
      const embed = new EmbedBuilder()
        .setTitle(ctx.args[0])
        .setDesc((await translate(cmd.description, {
          to: ctx.db.guild.lang
        })).text)
        .addField(locale("commands.help.name"), `\`${cmd.name}\``)
        .setFooter({ text: locale("commands.help.footer") })
        .setThumb(client.user.avatarURL())
      if(cmd.syntax) embed.addField(locale("commands.help.syntax"), `\`/${cmd.syntax}\``)
      if(cmd.syntaxes) embed.addField(locale("commands.help.syntax"), cmd.syntaxes.map(syntax => `\`/${syntax}\``).join("\n"))
      if(cmd.examples) embed.addField(locale("commands.help.examples"), cmd.examples.map(ex => `\`/${ex}\``).join("\n"))
      if(cmd.permissions) embed.addField(locale("commands.help.permissions"), cmd.permissions.map(perm => `\`${permissions[perm]}\``).join(", "), true)
      if(cmd.botPermissions) embed.addField(locale("commands.help.bot_permissions"), cmd.botPermissions.map(perm => `\`${permissions[perm]}\``).join(", "), true)
      ctx.reply(embed.build())
    }
    else {
      const commands = Array.from(client.commands).map(cmd => {
        if(!cmd[1].onlyDev) {
          if(cmd[1].options) {
            let options = cmd[1].options.map(op => {
              if(op.type === 1) return `\`/${cmd[0]} ${op.name}\``
              else if(op.type === 2) return op.options?.map(op2 => `\`/${cmd[0]} ${op.name} ${op2.name}\``).join("\n")
              else return `\`/${cmd[0]}\``
            })
            return options.join("\n")
          }
          else return `\`/${cmd[0]}\``
        }
      })
      const embed = new EmbedBuilder()
        .setTitle(locale("commands.help.title"))
        .setThumb(client.user.avatarURL())
        .setDesc(locale("commands.help.description", {
          arg: `/help [command]`
        }))
        .setField(locale("commands.help.field", {
          q: commands.length + commands.reduce((count, str) => {
            return count + (str?.match(/\n/g) ?? []).length
          }, 0)
        }), commands.join("\n"))
      const button = new ButtonBuilder()
        .setLabel(locale("commands.help.community"))
        .setStyle("link")
        .setURL("https://discord.gg/g5nmc376yh")
      const privacyButton = new ButtonBuilder()
        .setLabel(locale("commands.help.privacy"))
        .setStyle("link")
        .setURL("https://levispires.github.io/sabine-terms/")
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
    i.result(commands.map(cmd => ({ name: cmd[0], value: cmd[0] })))
      .catch((e) => new Logger(this.client!).error(e))
  }
})
