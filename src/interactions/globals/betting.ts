import { client } from "../../structures/client/App.ts"
import createModalSubmitInteraction from "../../structures/interactions/createModalSubmitInteraction.ts"
import calcOdd from "../../util/calcOdd.ts"

export default createModalSubmitInteraction({
  name: "betting",
  flags: 64,
  async run({ ctx }) {
    const games = {
      valorant: async() => {
        const preds = await ctx.client.prisma.prediction.findMany({
          where: {
            game: "valorant",
            match: ctx.args[2]
          }
        })
        const value = BigInt(ctx.args[3])
        if(isNaN(Number(value))) return await ctx.reply("helper.invalid_coins")
        if(value < 500) return await ctx.reply("helper.min_value")
        if(value > ctx.db.user.coins) return await ctx.reply("helper.too_much")
        let oddA = 0
        let oddB = 0
        for(const pred of preds) {
          if(pred.teams[0].winner && pred.bet) {
            oddA += 1
          }
          else if(pred.teams[1].winner && pred.bet) {
            oddB += 1
          }
        }
        const index = preds.findIndex(p => p.match === ctx.args[2])
        let odd: number
        if(preds[index].teams[0].winner) {
          odd = calcOdd(oddA)
        }
        else {
          odd = calcOdd(oddB)
        }
        ctx.db.user.coins -= value
        await client.prisma.prediction.update({
          where: {
            id: preds[index].id
          },
          data: {
            bet: value + BigInt(preds[index].bet ?? 0)
          }
        })
        await ctx.db.user.save()
        const winnerIndex = preds[index].teams.findIndex(t => t.winner)
        await ctx.reply(
          "helper.bet_res",
          {
            team: preds[index].teams[winnerIndex].name,
            coins: value.toLocaleString("en-US"),
            odd
          }
        )
      },
      lol: async() => {
        const preds = await ctx.client.prisma.prediction.findMany({
          where: {
            game: "lol",
            match: ctx.args[2],
            bet: {
              not: null
            }
          }
        })
        const value = BigInt(ctx.args[3])
        if(isNaN(Number(value))) return await ctx.reply("helper.invalid_coins")
        if(value < 500) return await ctx.reply("helper.min_value")
        if(value > ctx.db.user.coins) return await ctx.reply("helper.too_much")
        let oddA = 0
        let oddB = 0
        for(const pred of preds) {
          if(pred.teams[0].winner && pred.bet) {
            oddA += 1
          }
          else if(pred.teams[1].winner && pred.bet) {
            oddB += 1
          }
        }
        const index = preds.findIndex(p => p.match === ctx.args[2])
        let odd: number
        if(preds[index].teams[0].winner) {
          odd = calcOdd(oddA)
        }
        else {
          odd = calcOdd(oddB)
        }
        ctx.db.user.coins -= value
        await client.prisma.prediction.update({
          where: {
            id: preds[index].id
          },
          data: {
            bet: value + BigInt(preds[index].bet ?? 0)
          }
        })
        await ctx.db.user.save()
        const winnerIndex = preds[index].teams.findIndex(t => t.winner)
        await ctx.reply(
          "helper.bet_res",
          {
            team: preds[index].teams[winnerIndex].name,
            coins: value.toLocaleString("en-US"),
            odd
          }
        )
      }
    }
    await games[ctx.args[1] as keyof typeof games]()
  }
})