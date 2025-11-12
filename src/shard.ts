import { REST, Routes, ShardingManager } from 'discord.js'
import Redis from 'redis'
import { server } from './server/index.ts'
import Logger from './util/Logger.ts'
import EmbedBuilder from './structures/builders/EmbedBuilder.ts'
import { prisma } from './database/prisma.ts'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Bull from 'bull'
import type { ArenaQueue } from './listeners/clientReady.ts'
import { valorant_maps } from './config.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProd = process.env.NODE_ENV === 'production'

const file = path.join(__dirname, isProd ? 'index.js' : 'index.ts')

const redis: Redis.RedisClientType = Redis.createClient({
  url: process.env.REDIS_URL
})

await redis.connect()

const currentMap = await redis.get('arena:map')
const mapIndex = valorant_maps.findIndex(m => m.name === currentMap)
const maps = valorant_maps.filter(m => m.current_map_pool).map(m => m.name)

if(mapIndex >= 0) {
  maps.splice(mapIndex, 1)
}

const map = maps[Math.floor(Math.random() * maps.length)]

if(!currentMap) await redis.set('arena:map', map)

const arenaMatchQueue = new Bull<ArenaQueue>('arena', { redis: process.env.REDIS_URL })
const changeMapQueue = new Bull('arena:map', { redis: process.env.REDIS_URL })

changeMapQueue.process('arena:map', async() => {
  const currentMap = await redis.get('arena:map')
  const mapIndex = valorant_maps.findIndex(m => m.name === currentMap)
  const maps = valorant_maps.filter(m => m.current_map_pool).map(m => m.name)

  if(mapIndex >= 0) {
    maps.splice(mapIndex, 1)
  }

  const map = maps[Math.floor(Math.random() * maps.length)]

  await redis.set('arena:map', map)
})

const processArenaQueue = async() => {
  try {
    const queueLength = await redis.lLen('arena:queue')

    if(queueLength < 2) return

    const payload1 = await redis.rPop('arena:queue')
    const payload2 = await redis.rPop('arena:queue')

    if(!payload1 || !payload2) {
      if(payload1) await redis.lPush('arena:queue', payload1)

      return
    }

    const parsedData1 = JSON.parse(payload1)
    const parsedData2 = JSON.parse(payload2)

    const p1InQueue = await redis.get(`arena:in_queue:${parsedData1.userId}`)
    const p2InQueue = await redis.get(`arena:in_queue:${parsedData2.userId}`)

    if(!p1InQueue) {
      if(p2InQueue) {
        await redis.lPush('arena:queue', payload2)
      }

      return await redis.del(`arena:in_queue:${parsedData1.userId}`)
    }

    if(!p2InQueue) {
      if(p1InQueue) {
        await redis.lPush('arena:queue', payload1)
      }

      return await redis.del(`arena:in_queue:${parsedData2.userId}`)
    }

    await redis.del([
      `arena:in_queue:${parsedData1.userId}`,
      `arena:in_queue:${parsedData2.userId}`
    ])

    await arenaMatchQueue.add('arena', { parsedData1, parsedData2 })

    if(queueLength - 2 >= 2) {
      await processArenaQueue()
    }
  }
  catch (e) {
    Logger.error(e as Error)
  }
}

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

const manager = new ShardingManager(file, {
  token: process.env.BOT_TOKEN,
  mode: 'process',
  totalShards: 2
})

const rest = new REST().setToken(process.env.BOT_TOKEN)

const res = await rest.get(Routes.channelWebhooks(process.env.SHARD_LOG)) as any[]
const webhook = res.filter(w => w.token)[0]

if(!webhook) {
  Logger.warn('There is no webhook')
}

manager.on('shardCreate', async shard => {
  if(shard.id === 0) {
    setInterval(processArenaQueue, 5000)

    const oldJobs = await changeMapQueue.getRepeatableJobs()

    for(const job of oldJobs) {
      if(job.id === 'change:map') {
        await changeMapQueue.removeRepeatableByKey(job.key)
      }
    }

    await changeMapQueue.add('arena:map', {}, {
      jobId: 'change:map',
      repeat: {
        cron: '0 0 * * 0' // midnight every sunday
      },
      removeOnComplete: true,
      removeOnFail: true
    })
  }

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