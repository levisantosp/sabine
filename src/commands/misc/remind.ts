import createCommand from '../../structures/command/createCommand'

export default createCommand({
  name: 'remind',
  nameLocalizations: {
    'pt-BR': 'lembrar'
  },
  description: 'Notify you when you can run /claim again',
  descriptionLocalizations: {
    'pt-BR': 'Notifica você quando você puder usar /claim novamente'
  },
  category: 'misc',
  async run({ ctx }) {
    if(!ctx.db.user.remind) {
      ctx.db.user.remind = true

      await ctx.db.user.save()

      return await ctx.reply('commands.remind.enabled')
    }
    
    ctx.db.user.remind = false

    await ctx.db.user.save()
    
    return await ctx.reply('commands.remind.disabled')
  }
})