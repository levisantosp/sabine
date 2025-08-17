import { client } from "./structures/client/App.ts"
import { server } from "./server/index.ts"

await client.redis.connect()
const updateRanking = async() => {
  const users = await client.prisma.users.findMany()
  await client.redis.set(
    "ranking:coins",
    JSON.stringify(
      {
        updated_at: Date.now(),
        data: users.map(user => ({
          id: user.id,
          coins: user.coins
        }))
        .filter(user => user.coins > 0)
      },
      (_, value) => typeof value === "bigint" ? value.toString() : value
    )
  )
  await client.redis.set(
    "ranking:predictions",
    JSON.stringify(
      {
        updated_at: Date.now(),
        data: users.map(user => ({
          id: user.id,
          correct_predictions: user.correct_predictions
        }))
        .filter(user => user.correct_predictions > 0)
      }
    )
  )
  await client.redis.set(
    "ranking:rating",
    JSON.stringify(
      {
        updated_at: Date.now(),
        data: users.map(user => ({
          id: user.id,
          elo: user.elo,
          rank_rating: user.rank_rating
        }))
      }
    )
  )
  setTimeout(updateRanking, 10 * 60 * 1000)
}
await client.redis.flushDb()
await updateRanking()
await client.connect()
server.listen({
  host: process.env.HOST,
  port: process.env.PORT ?? 3001
})