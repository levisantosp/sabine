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
    let coins = BigInt(Math.floor(Math.random() * (25000 - 10000 + 1)) + 10000)
    console.log(coins)
    let fates = Math.floor(Math.random() * (30 - 20 + 1)) + 20
    const member = client.guilds.get("1233965003850125433")!.members.get(ctx.interaction.user.id)
    let content = t("commands.daily.res", {
      coins: coins.toLocaleString(),
      fates
    }) + "\n"
    let bonus = ""
    if(ctx.db.user.plan) {
      coins *= 5n
      fates = Number((fates * 1.5).toFixed(0))
      bonus += t("commands.daily.bonus", {
        coins: "5x",
        fates: "1.5x"
      }) + "\n"
    }
    if(member?.premiumSince) {
      coins *= 2n
      fates = Number((fates * 1.25).toFixed(0))
      bonus += t("commands.daily.bonus2", {
        coins: "2x",
        fates: "1.25x"
      })
    }
    if(bonus.length) {
      content = t("commands.daily.res", {
        coins: coins.toLocaleString(),
        fates
      }) + "\n" + bonus
    }
    ctx.db.user.coins += coins
    ctx.db.user.fates += fates
    ctx.db.user.daily_time = new Date(new Date().setHours(24, 0, 0, 0))
    await ctx.db.user.save()
    await ctx.reply(content)
  }
})