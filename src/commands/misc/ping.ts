import createCommand from '../../structures/command/createCommand.ts'

export default createCommand({
  name: 'ping',
  category: 'misc',
  description: 'Shows the bot latency',
  descriptionLocalizations: {
    'pt-BR': 'Mostra a latência do bot'
  },
  userInstall: true,
  async run({ ctx, app }) {

    if(ctx.guild) {
      return await ctx.reply(`🏓 Pong! \`${ctx.guild.shard.ping}ms\` (Shard \`${ctx.guild.shard.id}\`)`)
    }
    
    await ctx.reply(`🏓 Pong! \`${app.ws.ping}ms\``)
  }
})