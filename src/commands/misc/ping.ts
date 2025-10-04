import createCommand from '../../structures/command/createCommand.ts'

export default createCommand({
  name: 'ping',
  category: 'misc',
  description: 'Shows the bot latency',
  descriptionLocalizations: {
    'pt-BR': 'Mostra a latência do bot'
  },
  userInstall: true,
  async run({ ctx }) {
    const start = Date.now()

    if(ctx.guild) {
      return await ctx.reply(`🏓 Pong! \`${ctx.guild.shard.latency}ms\` (Shard \`${ctx.guild.shard.id}\`)`)
    }

    await (await fetch('https://discord.com/api/v10/gateway')).json()
    
    await ctx.reply(`🏓 Pong! \`${Date.now() - start}ms\``)
  }
})