import Service from "../api/index.ts"
import { SabineUser } from "../database/index.ts"
import createModalSubmitInteraction from "../structures/interactions/createModalSubmitInteraction.ts"

const service = new Service(process.env.AUTH)

export default createModalSubmitInteraction({
  name: "prediction",
  flags: 64,
  async run({ ctx }) {
    const user = new SabineUser(ctx.db.user.id)
    const games = {
      valorant: async() => {
        if(ctx.db.user.valorant_predictions.find(p => p.match === ctx.args[2])) {
          return await ctx.reply("helper.replied")
        }
        const res = await service.getMatches("valorant")
        const data = res.find(d => d.id === ctx.args[2])!
        const winnerScore = Math.max(
          Number(ctx.args[0]),
          Number(ctx.args[1])
        )
        await user.addPrediction("valorant", {
          match: data.id!,
          teams: [
            {
              name: data.teams[0].name,
              score: ctx.args[0],
              winner: Number(ctx.args[0]) !== winnerScore ? false : true
            },
            {
              name: data.teams[1].name,
              score: ctx.args[1],
              winner: Number(ctx.args[1]) !== winnerScore ? false : true
            }
          ],
          status: "pending",
          bet: null,
          odd: null
        })
        await ctx.reply("helper.palpitate_response", {
          t1: data.teams[0].name,
          t2: data.teams[1].name,
          s1: ctx.args[0],
          s2: ctx.args[1]
        })
      },
      lol: async() => {
        if(ctx.db.user.lol_predictions.find(p => p.match.toString() === ctx.args[2])) {
          return await ctx.reply("helper.replied")
        }
        const res = await service.getMatches("lol")
        const data = res.find(d => d.id?.toString() === ctx.args[2])!
        const winnerScore = Math.max(
          Number(ctx.args[0]),
          Number(ctx.args[1])
        )
        await user.addPrediction("lol", {
          match: data.id!,
          teams: [
            {
              name: data.teams[0].name,
              score: ctx.args[0],
              winner: Number(ctx.args[0]) !== winnerScore ? false : true
            },
            {
              name: data.teams[1].name,
              score: ctx.args[1],
              winner: Number(ctx.args[1]) !== winnerScore ? false : true
            }
          ],
          status: "pending",
          bet: null,
          odd: null
        })
        await ctx.reply("helper.palpitate_response", {
          t1: data.teams[0].name,
          t2: data.teams[1].name,
          s1: ctx.args[0],
          s2: ctx.args[1]
        })
      }
    }
    await games[ctx.args[1] as "valorant" | "lol"]()
  }
})