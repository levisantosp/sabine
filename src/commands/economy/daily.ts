import createCommand from "../../structures/command/createCommand.ts"

export default createCommand({
  name: "daily",
  description: "Get your daily reward",
  descriptionLocalizations: {
    "pt-BR": "Obtenha sua recompensa diária"
  },
  category: "economy",
  userInstall: true,
  async run({ ctx, client, t }) {
    if(
      ctx.db.user.daily_time &&
      ctx.db.user.daily_time.getTime() > Date.now()
    ) {
      return await ctx.reply("commands.daily.has_been_claimed", { t: `<t:${((ctx.db.user.daily_time.getTime()) / 1000).toFixed(0)}:R>` })
    }
    let coins = BigInt(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000)
    let fates = Math.floor(Math.random() * (15 - 10 + 1)) + 10
    const member = client.guilds.get("1233965003850125433")!.members.get(ctx.interaction.user.id)
    let content = t("commands.daily.res", {
      coins: coins.toLocaleString("en-US"),
      fates
    }) + "\n"
    if(ctx.db.user.plan || member?.premiumSince) {
      const bonusCoins = coins * 10n
      const bonusFates = fates + 5
      coins += bonusCoins
      fates += bonusFates
      content += t("commands.daily.bonus", {
        coins: bonusCoins.toLocaleString("en-us"),
        fates: bonusFates
      })
    }
    ctx.db.user.coins += coins
    ctx.db.user.fates += fates
    ctx.db.user.daily_time = new Date(new Date().setHours(24, 0, 0, 0))
    await ctx.db.user.save()
    await ctx.reply(content)
  }
})