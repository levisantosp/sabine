import ms from 'humanize-duration'
import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'
import pkg from '../../../package.json' with { type: 'json' }

export default createCommand({
  name: 'info',
  category: 'misc',
  description: 'Shows the bot info',
  descriptionLocalizations: {
    'pt-BR': 'Mostra as informações do bot'
  },
  userInstall: true,
  async run({ ctx, app, t }) {
    const creator = app.users.cache.get('441932495693414410')!

    const embed = new EmbedBuilder()
      .setAuthor({
        name: app.user!.username,
        iconURL: app.user!.displayAvatarURL({ size: 2048 })
      })
      .setThumb(creator.displayAvatarURL({ size: 2048 }))
      .setTitle(t('commands.info.embed.title'))
      .setFields(
        {
          name: 'Patch',
          value: pkg.version,
          inline: true
        },
        {
          name: t('commands.info.lib'),
          value: '[discord.js](https://discord.js.org/)',
          inline: true
        },
        {
          name: t('commands.info.creator'),
          value: creator.tag,
          inline: true
        },
        {
          name: t('commands.info.guilds'),
          value: app.guilds.cache.size.toString(),
          inline: true
        },
        {
          name: t('commands.info.users'),
          value: app.users.cache.filter(user => !user.bot).size.toString(),
          inline: true
        },
        {
          name: 'App',
          value: `Shards: \`${app.shard?.count}\`\nShard ID: \`${ctx.guild?.shard.id}\`\nShard Uptime: \`${ms(app.uptime ?? 0, { language: ctx.db.user.lang ?? ctx.db.guild!.lang, round: true })}\`\nApp Uptime: \`${ms(Date.now() - app._uptime, { language: ctx.db.user.lang ?? ctx.db.guild!.lang, round: true })}\``,
          inline: true
        }
      )

    await ctx.reply(embed.build(
      {
        components: [
          {
            type: 1,
            components: [
              new ButtonBuilder()
                .setLabel(t('commands.help.community'))
                .defineStyle('link')
                .setURL('https://discord.gg/g5nmc376yh'),
              new ButtonBuilder()
                .setLabel(t('commands.info.invite'))
                .defineStyle('link')
                .setURL('https://discord.com/oauth2/authorize?app_id=1235576817683922954&scope=bot&permissions=388096')
            ]
          }
        ]
      }
    ))
  }
})