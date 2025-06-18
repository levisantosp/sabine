import createCommand from "../../structures/command/createCommand.js"

export default createCommand({
  name: "daily",
  description: "Get your daily reward",
  descriptionLocalizations: {
    "pt-BR": "Obtenha sua recompensa diária"
  },
  category: "simulator",
  async run({ ctx, client }) {
    if(ctx.db.user.daily_time > Date.now()) {
      return await ctx.reply("commands.daily.has_been_claimed", { t: `<t:${((ctx.db.user.daily_time) / 1000).toFixed(0)}:R>` })
    }
    const coins = BigInt(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000)
    ctx.db.user.coins += coins
    ctx.db.user.daily_time = new Date().setHours(24, 0, 0, 0)
    await ctx.reply("commands.daily.res", { coins: coins.toLocaleString("en-US") })
    const member = client.guilds.get("1233965003850125433")!.members.get(ctx.interaction.user.id)
    if(ctx.db.user.plan || member?.premiumSince) {
      const bonus = BigInt(2500)
      ctx.db.user.coins += bonus
      await ctx.reply("commands.daily.bonus", { bonus: bonus.toLocaleString("en-us") })
    }
    await ctx.db.user.save()
  }
})