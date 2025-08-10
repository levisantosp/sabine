import createCommand from '../../structures/command/createCommand.ts'

export default createCommand({
  name: 'coins',
  description: 'Check your coins',
  descriptionLocalizations: {
    'pt-BR': 'Veja seus coins'
  },
  category: 'simulator',
  userInstall: true,
  async run({ ctx }) {
    await ctx.reply('commands.coins.res', {
      c: ctx.db.user.coins.toLocaleString(),
      f: ctx.db.user.fates.toLocaleString()
    })
  }
})