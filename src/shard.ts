import { REST, Routes, ShardingManager } from 'discord.js'
import Redis from 'redis'
import { server } from './server/index.ts'
import Logger from './util/Logger.ts'
import EmbedBuilder from './structures/builders/EmbedBuilder.ts'
import { prisma } from './database/prisma.ts'

const redis: Redis.RedisClientType = Redis.createClient({
  url: process.env.REDIS_URL
})

await redis.connect()

const updateRedis = async() => {
  const users = await prisma.user.findMany()
  const blacklist = await prisma.blacklist.findMany()

  await redis.set('blacklist', JSON.stringify(blacklist))

  await redis.set(
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

  await redis.set(
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

  await redis.set(
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

const patterns = ['*leaderboard:*', '*agent_selection:*', '*match:*']

const keysToDelete = new Set<string>()

for(const pattern of patterns) {
  for await (const keys of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    for(const key of keys) {
      keysToDelete.add(key)
    }
  }  
}

const keys = [...keysToDelete]

if(keys.length) {
  await redis.del(keys)
}

await updateRedis()

server.listen({
  host: process.env.HOST,
  port: process.env.PORT
})
  .then(() => console.log(`HTTP server running at ${process.env.PORT}`))

const manager = new ShardingManager('src/index.ts', {
  token: process.env.BOT_TOKEN,
  mode: 'process',
  totalShards: 'auto'
})

const rest = new REST().setToken(process.env.BOT_TOKEN)

const res = await rest.get(Routes.channelWebhooks(process.env.SHARD_LOG)) as any[]
const webhook = res.filter(w => w.token)[0]

if(!webhook) {
  Logger.warn('There is no webhook')
}

manager.on('shardCreate', shard => {
  shard.on('disconnect', async() => {
    const embed = new EmbedBuilder()
      .setTitle('Shard Disconnected')
      .setDesc(`Shard ID: \`${shard.id}\` => \`Disconnected\``)
      .setTimestamp()

    const route = Routes.webhook(webhook.id, webhook.token)

    await rest.post(route, {
      body: {
        embeds: [embed]
      }
    })
  })

  shard.on('ready', async() => {
    const embed = new EmbedBuilder()
      .setTitle('Shard Ready')
      .setDesc(`Shard ID: \`${shard.id}\` => \`Ready\``)
      .setTimestamp()

    const route = Routes.webhook(webhook.id, webhook.token)

    await rest.post(route, {
      body: {
        embeds: [embed]
      }
    })
  })

  shard.on('resume', async() => {
    const embed = new EmbedBuilder()
      .setTitle('Shard Resumed')
      .setDesc(`Shard ID: \`${shard.id}\` => \`Resumed\``)
      .setTimestamp()

    const route = Routes.webhook(webhook.id, webhook.token)

    await rest.post(route, {
      body: {
        embeds: [embed]
      }
    })
  })

  shard.on('reconnecting', async() => {
    const embed = new EmbedBuilder()
      .setTitle('Shard Reconnecting')
      .setDesc(`Shard ID: \`${shard.id}\` => \`Reconnecting\``)
      .setTimestamp()

    const route = Routes.webhook(webhook.id, webhook.token)

    await rest.post(route, {
      body: {
        embeds: [embed]
      }
    })
  })

  shard.on('death', async() => {
    const embed = new EmbedBuilder()
      .setTitle('Shard Dead')
      .setDesc(`Shard ID: \`${shard.id}\` => \`Dead\``)
      .setTimestamp()

    const route = Routes.webhook(webhook.id, webhook.token)

    await rest.post(route, {
      body: {
        embeds: [embed]
      }
    })
  })

  shard.on('spawn', async() => {
    const embed = new EmbedBuilder()
      .setTitle('Shard Spawned')
      .setDesc(`Shard ID: \`${shard.id}\` => \`Spawned\``)
      .setTimestamp()

    const route = Routes.webhook(webhook.id, webhook.token)

    await rest.post(route, {
      body: {
        embeds: [embed]
      }
    })
  })

  shard.on('error', async(error) => {
    const embed = new EmbedBuilder()
      .setTitle('Shard Error')
      .setDesc(`Shard ID: \`${shard.id}\` => \`Error\`\n\`\`\`fix\n${error.stack}\`\`\``)
      .setTimestamp()

    const route = Routes.webhook(webhook.id, webhook.token)

    await rest.post(route, {
      body: {
        embeds: [embed]
      }
    })
  })
})

manager.spawn()