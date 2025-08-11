import { client } from './structures/client/App.ts'
import { server } from './server/index.ts'
import DBL from 'top.gg'

const dbl = new DBL(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3QiOiJ0cnVlIiwiaWQiOiIxMjM1NTc2ODE3NjgzOTIyOTU0IiwiaWF0IjoiMTc1NDk0NTMxNyJ9.79XY26BJ3UCh30yHd8NG-wHeGVArS_vEbL7lG3iCdd0',
  client
)
console.log(await dbl.hasVoted('441932495693414410'))
await client.redis.connect()
const updateRanking = async() => {
  const users = await client.prisma.users.findMany()
  await client.redis.set(
    'ranking:coins',
    JSON.stringify(
      {
        updated_at: Date.now(),
        data: users.map(user => ({ id: user.id, coins: user.coins })).filter(user => user.coins > 0)
      },
      (_, value) => typeof value === 'bigint' ? value.toString() : value
    )
  )
  await client.redis.set(
    'ranking:predictions',
    JSON.stringify(
      {
        updated_at: Date.now(),
        data: users.map(user => ({ id: user.id, correct_predictions: user.correct_predictions })).filter(user => user.correct_predictions > 0)
      }
    )
  )
  await client.redis.set(
    'ranking:wins',
    JSON.stringify(
      {
        updated_at: Date.now(),
        data: users.map(user => ({ id: user.id, wins: user.wins })).filter(user => user.wins > 0)
      }
    )
  )
}
await updateRanking()
setInterval(async() => {
  await updateRanking()
}, 10 * 60 * 1000)
await client.connect()
server.listen({
  host: process.env.HOST,
  port: process.env.PORT ?? 3001
})