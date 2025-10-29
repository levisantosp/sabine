import { REST, Routes, ShardingManager } from 'discord.js'
import { server } from './server/index.ts'
import Logger from './util/Logger.ts'
import EmbedBuilder from './structures/builders/EmbedBuilder.ts'

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