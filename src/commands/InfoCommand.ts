import { App, ButtonBuilder, Command, CommandContext, EmbedBuilder } from '../structures'
import pkg from '../../package.json'
import ms from 'enhanced-ms'

export default class InfoCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'info',
      description: 'Shows the bot info',
      descriptionLocalizations: {
        'pt-BR': 'Mostra as informações do bot'
      }
    })
  }
  public async run(ctx: CommandContext) {
    const embed = new EmbedBuilder()
    .setAuthor(this.client.user.username, this.client.user.avatarURL())
    .setTitle(this.locale('commands.info.embed.title'))
    .addField('Patch', pkg.version, true)
    .addField(this.locale('commands.info.lib'), '[oceanic.js](https://oceanic.ws/)', true)
    .addField(this.locale('commands.info.creator'), `@${this.client.users.get('441932495693414410')?.tag}`, true)
    .addField(this.locale('commands.info.guilds'), this.client.guilds.size.toString(), true)
    .addField(this.locale('commands.info.users'), this.client.users.filter(user => !user.bot).length.toString(), true)
    .setFooter(`Shard ID: ${ctx.guild.shard.id} | Uptime: ${ms(this.client.uptime, { shortFormat: true })}`)
    ctx.reply({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            new ButtonBuilder()
            .setLabel(this.locale('commands.help.community'))
            .setStyle('link')
            .setURL('https://discord.gg/g5nmc376yh'),
            new ButtonBuilder()
            .setLabel(this.locale('commands.info.invite'))
            .setStyle('link')
            .setURL('https://discord.com/oauth2/authorize?client_id=1235576817683922954&scope=bot&permissions=388096')
          ]
        }
      ]
    })
  }
}