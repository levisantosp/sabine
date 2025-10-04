import createCommand from '../../structures/command/createCommand.ts'

export default createCommand({
  name: 'claims',
  category: 'economy',
  description: 'See your claims counter',
  descriptionLocalizations: {
    'pt-BR': 'Veja o seu contador de obter'
  },
  userInstall: true,
  async run({ ctx }) {
    await ctx.reply('commands.claims.res', {
      claims: ctx.db.user.claims,
      pity: ctx.db.user.pity
    })
  }
})