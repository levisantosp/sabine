import { PrismaClient } from "@prisma/client"
import createModalSubmitInteraction from "../structures/interactions/createModalSubmitInteraction.ts"
import calcOdd from "../structures/util/calcOdd.ts"
import { SabineUser } from "../database/index.ts"

const prisma = new PrismaClient()

export default createModalSubmitInteraction({
  name: "betting",
  flags: 64,
  async run({ ctx }) {
    const users = await prisma.users.findMany({
      where: {
        valorant_predictions: {
          isEmpty: false
        }
      }
    })
    const user = await new SabineUser(ctx.interaction.user.id).get()
    if(!user) return
    const games = {
      valorant: async () => {
        const value = BigInt(ctx.args[0])
        if(isNaN(Number(value))) return await ctx.reply("helper.invalid_coins")
        if(value < 500) return await ctx.reply("helper.min_value")
        if(value > ctx.db.user.coins) return await ctx.reply("helper.too_much")
        let oddA = 0
        let oddB = 0
        for (const u of users) {
          let index = u.valorant_predictions.findIndex(p => p.match === ctx.args[2])
          if(!u.valorant_predictions[index]) continue
          if(u.valorant_predictions[index].teams[0].winner && u.valorant_predictions[index].bet) {
            oddA += 1
          }
          else if(u.valorant_predictions[index].teams[1].winner && u.valorant_predictions[index].bet) {
            oddB += 1
          }
        }
        let index = ctx.db.user.valorant_predictions.findIndex(p => p.match === ctx.args[2])
        let odd: number
        if(ctx.db.user.valorant_predictions[index].teams[0].winner) {
          odd = calcOdd(oddA)
        }
        else {
          odd = calcOdd(oddB)
        }
        ctx.db.user.valorant_predictions[index].bet = value + BigInt(user.valorant_predictions[index].bet ?? 0)
        await prisma.users.update({
          where: {
            id: user.id
          },
          data: {
            valorant_predictions: user.valorant_predictions,
            coins: {
              decrement: value
            }
          }
        })
        let winnerIndex = user.valorant_predictions[index].teams.findIndex(t => t.winner)
        await ctx.reply(
          "helper.bet_res",
          {
            team: user.valorant_predictions[index].teams[winnerIndex].name,
            coins: value.toLocaleString("en-US"),
            odd
          }
        )
      },
      lol: async () => {
        const value = BigInt(ctx.args[0])
        if(isNaN(Number(value))) return await ctx.reply("helper.invalid_coins")
        if(value < 500) return await ctx.reply("helper.min_value")
        if(value > ctx.db.user.coins) return await ctx.reply("helper.too_much")
        let oddA = 0
        let oddB = 0
        for (const u of users) {
          let index = u.lol_predictions.findIndex(p => p.match === ctx.args[2])
          if(!u.lol_predictions[index]) continue
          if(u.lol_predictions[index].teams[0].winner) {
            oddA += 1
          }
          else {
            oddB += 1
          }
        }
        let index = user.lol_predictions.findIndex(p => p.match === ctx.args[2])
        let odd: number
        if(user.lol_predictions[index].teams[0].winner) {
          odd = calcOdd(oddA)
        }
        else {
          odd = calcOdd(oddB)
        }
        ctx.db.user.lol_predictions[index].bet = value + BigInt(user.lol_predictions[index].bet ?? 0)
        await prisma.users.update({
          where: {
            id: user.id
          },
          data: {
            lol_predictions: user.lol_predictions,
            coins: {
              decrement: value
            }
          }
        })
        let winnerIndex = user.lol_predictions.map(p => p.teams.findIndex(t => t.winner)).join()
        await ctx.reply(
          "helper.bet_res",
          {
            team: user.lol_predictions[index].teams[Number(winnerIndex)].name,
            coins: value.toLocaleString("en-US"),
            odd
          }
        )
      }
    }
    await games[ctx.args[1] as keyof typeof games]()
  }
})