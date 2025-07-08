import createModalSubmitInteraction from '../structures/interactions/createModalSubmitInteraction.ts'
import calcOdd from '../structures/util/calcOdd.ts'

export default createModalSubmitInteraction({
  name: 'betting',
  flags: 64,
  async run({ ctx }) {
    const users = await ctx.client.prisma.users.findMany({
      where: {
        valorant_predictions: {
          isEmpty: false
        }
      }
    })
    const games = {
      valorant: async() => {
        const value = BigInt(ctx.args[3])
        if(isNaN(Number(value))) return await ctx.reply('helper.invalid_coins')
        if(value < 500) return await ctx.reply('helper.min_value')
        if(value > ctx.db.user.coins) return await ctx.reply('helper.too_much')
        let oddA = 0
        let oddB = 0
        for(const u of users) {
          const index = u.valorant_predictions.findIndex(p => p.match === ctx.args[2])
          if(!u.valorant_predictions[index]) continue
          if(u.valorant_predictions[index].teams[0].winner && u.valorant_predictions[index].bet) {
            oddA += 1
          }
          else if(u.valorant_predictions[index].teams[1].winner && u.valorant_predictions[index].bet) {
            oddB += 1
          }
        }
        const index = ctx.db.user.valorant_predictions.findIndex(p => p.match === ctx.args[2])
        let odd: number
        if(ctx.db.user.valorant_predictions[index].teams[0].winner) {
          odd = calcOdd(oddA)
        }
        else {
          odd = calcOdd(oddB)
        }
        ctx.db.user.valorant_predictions[index].bet = value + BigInt(ctx.db.user.valorant_predictions[index].bet ?? 0)
        ctx.db.user.coins -= value
        await ctx.db.user.save()
        const winnerIndex = ctx.db.user.valorant_predictions[index].teams.findIndex(t => t.winner)
        await ctx.reply(
          'helper.bet_res',
          {
            team: ctx.db.user.valorant_predictions[index].teams[winnerIndex].name,
            coins: value.toLocaleString('en-US'),
            odd
          }
        )
      },
      lol: async() => {
        const value = BigInt(ctx.args[0])
        if(isNaN(Number(value))) return await ctx.reply('helper.invalid_coins')
        if(value < 500) return await ctx.reply('helper.min_value')
        if(value > ctx.db.user.coins) return await ctx.reply('helper.too_much')
        let oddA = 0
        let oddB = 0
        for(const u of users) {
          const index = u.lol_predictions.findIndex(p => p.match === ctx.args[2])
          if(!u.lol_predictions[index]) continue
          if(u.lol_predictions[index].teams[0].winner) {
            oddA += 1
          }
          else {
            oddB += 1
          }
        }
        const index = ctx.db.user.lol_predictions.findIndex(p => p.match === ctx.args[2])
        let odd: number
        if(ctx.db.user.lol_predictions[index].teams[0].winner) {
          odd = calcOdd(oddA)
        }
        else {
          odd = calcOdd(oddB)
        }
        ctx.db.user.lol_predictions[index].bet = value + BigInt(ctx.db.user.lol_predictions[index].bet ?? 0)
        ctx.db.user.coins -= value
        await ctx.db.user.save()
        const winnerIndex = ctx.db.user.lol_predictions.map(p => p.teams.findIndex(t => t.winner)).join()
        await ctx.reply(
          'helper.bet_res',
          {
            team: ctx.db.user.lol_predictions[index].teams[Number(winnerIndex)].name,
            coins: value.toLocaleString('en-US'),
            odd
          }
        )
      }
    }
    await games[ctx.args[1] as keyof typeof games]()
  }
})