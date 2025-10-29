import { app } from './structures/app/App.ts'

await app.redis.connect()

const updateRedis = async() => {
  const users = await app.prisma.user.findMany()
  const blacklist = await app.prisma.blacklist.findMany()

  await app.redis.set('blacklist', JSON.stringify(blacklist))

  await app.redis.set(
    'leaderboard:coins',
    JSON.stringify(
      {
        updated_at: Date.now(),
        data: users.map(user => ({
          id: user.id,
          coins: user.coins
        }))
          .filter(user => user.coins > 0)
      },
      (_, value) => typeof value === 'bigint' ? value.toString() : value
    )
  )

  await app.redis.set(
    'leaderboard:predictions',
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

  await app.redis.set(
    'leaderboard:rating',
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

  setTimeout(updateRedis, 10 * 60 * 1000)
}

const keys = await app.redis.keys('*leaderboard:*')

if(keys.length) {
  await app.redis.del(keys)
}

await updateRedis()

await app.connect()