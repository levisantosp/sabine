import translate from '@iamtraction/google-translate'
import { App, ButtonBuilder, Command, CommandContext, EmbedBuilder, Logger } from '../structures'
import { AutocompleteInteraction } from 'oceanic.js'

type AutocompleteOptions = {
  value: string
  type: number
  name: string
}
export default class HelpCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'help',
      nameLocalizations: {
        'pt-BR': 'ajuda'
      },
      description: 'List of commands',
      descriptionLocalizations: {
        'pt-BR': 'Lista de comandos'
      },
      options: [
        {
          type: 3,
          name: 'command',
          nameLocalizations: {
            'pt-BR': 'comando'
          },
          description: 'Insert the name of a command',
          descriptionLocalizations: {
            'pt-BR': 'Insira o nome de um comando'
          },
          autocomplete: true
        }
      ],
      botPermissions: ['EMBED_LINKS'],
      syntax: 'help <command>',
      examples: [
        'help',
        'help ping',
        'help team',
        'help player'
      ]
    })
  }
  async run(ctx: CommandContext) {
    if(ctx.args[0]) {
      const cmd = this.client.commands.get(ctx.args[0])
      if (!cmd || cmd.onlyDev) return ctx.reply('commands.help.command_not_found')
      const { permissions } = await import(`../locales/${ctx.db.guild.lang}.js`)
      const embed = new EmbedBuilder()
      .setTitle(ctx.args[0])
      .setDescription((await translate(cmd.description!, {
        to: ctx.db.guild.lang
      })).text)
      .addField(this.locale('commands.help.name'), `\`${cmd.name}\``)
      .setFooter(this.locale('commands.help.footer'))
      .setThumbnail(this.client.user.avatarURL())

      if(cmd.syntax) embed.addField(this.locale('commands.help.syntax'), `\`/${cmd.syntax}\``)
      if(cmd.syntaxes) embed.addField(this.locale('commands.help.syntax'), cmd.syntaxes.map(syntax => `\`/${syntax}\``).join('\n'))
      if(cmd.examples) embed.addField(this.locale('commands.help.examples'), cmd.examples.map(ex => `\`/${ex}\``).join('\n'))
      if(cmd.permissions) embed.addField(this.locale('commands.help.permissions'), cmd.permissions.map(perm => `\`${permissions[perm]}\``).join(', '), true)
      if(cmd.botPermissions) embed.addField(this.locale('commands.help.bot_permissions'), cmd.botPermissions.map(perm => `\`${permissions[perm]}\``).join(', '), true)
      ctx.reply(embed.build())
    }
    else {
      const embed = new EmbedBuilder()
      .setTitle(this.locale('commands.help.title'))
      .setThumbnail(this.client.user.avatarURL())
      .setDescription(this.locale('commands.help.description', {
        arg: `/help [command]`
      }))
      .addField(this.locale('commands.help.field', {
        q: this.client.commands.size
      }), Array.from(this.client.commands).map((cmd: any) => {
        if(!cmd.onlyDev) return `\`/${cmd[0]}\``
      }).join('\n'))

      const button = new ButtonBuilder()
      .setLabel(this.locale('commands.help.community'))
      .setStyle('link')
      .setURL('https://discord.gg/g5nmc376yh')
      ctx.reply({
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [
              button,
              new ButtonBuilder()
              .setLabel(this.locale('commands.help.privacy'))
              .setStyle('link')
              .setURL('https://levispires.github.io/sabine-terms/')
            ]
          }
        ]
      })
    }
  }
  async execAutocomplete(i: AutocompleteInteraction) {
    const commands = Array.from(this.client.commands).filter(c => {
      if(c[0].includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return c
    })
    .slice(0, 25)
    i.result(commands.map(cmd => ({ name: cmd[0], value: cmd[0] })))
    .catch((e) => new Logger(this.client).error(e))
  }
}