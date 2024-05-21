import Command from '../structures/command/Command.js'
import translate from '@iamtraction/google-translate'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'
import ButtonBuilder from '../structures/components/ButtonBuilder.js'

export default class HelpCommand extends Command {
  constructor(client) {
    super({
      client,
      name: 'help',
      aliases: ['ajuda', 'socorro', 'comandos', 'commands', 'cmds'],
      description: 'List of commands',
      botPermissions: ['embedLinks']
    })
  }
  async run(ctx) {
    if (ctx.args[0]) {
      const cmd = this.client.commands.get(ctx.args[0]) ?? this.client.commands.get(this.client.aliases.get(ctx.args[0]))
      if (!cmd || cmd.onlyDev) return ctx.reply('commands.help.command_not_found')
      const { permissions } = await import(`../../locales/locales-${ctx.db.guild.lang}.js`)
      const embed = new EmbedBuilder()
      .setTitle(ctx.args[0])
      .setDescription((await translate(cmd.description, {
        to: ctx.db.guild.lang
      })).text)
      .addField(await this.locale('commands.help.name'), `\`${cmd.name}\``)
      .setFooter(await this.locale('commands.help.footer'))
      .setThumbnail(this.client.user.avatarURL)

      if(cmd.syntax) embed.addField(await this.locale('commands.help.syntax'), `\`${process.env.PREFIX}${cmd.syntax}\``)
      if(cmd.examples) embed.addField(await this.locale('commands.help.examples'), cmd.examples.map(ex => `\`${process.env.PREFIX}${ex}\``).join('\n'))
      if(cmd.aliases) embed.addField(await this.locale('commands.help.aliases'), cmd.aliases.map(alias => `\`${alias}\``).join(', '))
      if(cmd.permissions) embed.addField(await this.locale('commands.help.permissions'), cmd.permissions.map(perm => `\`${permissions[perm]}\``).join(', '), true)
      if(cmd.botPermissions) embed.addField(await this.locale('commands.help.bot_permissions'), cmd.botPermissions.map(perm => `\`${permissions[perm]}\``).join(', '), true)
      ctx.reply(embed.build())
    }
    else {
      const embed = new EmbedBuilder()
      .setTitle(await this.locale('commands.help.title'))
      .setThumbnail(this.client.user.avatarURL)
      .setDescription(await this.locale('commands.help.description', {
        arg: `${process.env.PREFIX}help [command]`
      }))
      .addField(await this.locale('commands.help.field', {
        q: this.client.commands.size
      }), this.client.commands.map(cmd => {
        if (!cmd.onlyDev) return `\`${process.env.PREFIX}${cmd.name}\``
      }).join('\n'))

      const button = new ButtonBuilder()
      .setLabel('Support Server')
      .setStyle('link')
      .setURL('https://discord.gg/g5nmc376yh')
      ctx.reply({
        embed,
        components: [
          {
            type: 1,
            components: [button]
          }
        ]
      })
    }
  }
}