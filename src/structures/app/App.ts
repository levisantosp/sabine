import * as Discord from 'discord.js'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import type { Command } from '../command/createCommand.ts'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import Redis from 'redis'
import Logger from '../../util/Logger.ts'
import type { CreateInteractionOptions } from '../interaction/createComponentInteraction.ts'
import type { CreateModalSubmitInteractionOptions } from '../interaction/createModalSubmitInteraction.ts'
import Queue from 'bull'
import {
  calcPlayerPrice,
  getPlayers,
  type Player
} from 'players'
import type { Listener } from './createListener.ts'

type Reminder = {
  user: string
  channel: string
}

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const redis: Redis.RedisClientType = Redis.createClient({
  url: process.env.REDIS_URL
})

const queue = new Queue<Reminder>('reminder', {
  redis: process.env.REDIS_URL
})

const rest = new Discord.REST().setToken(process.env.BOT_TOKEN)

export default class App extends Discord.Client {
  public commands: Map<string, Command> = new Map()
  public _uptime: number = Date.now()
  public prisma: typeof prisma
  public redis: typeof redis
  public queue: typeof queue
  public interactions: Map<string, CreateInteractionOptions & CreateModalSubmitInteractionOptions> = new Map()
  public players: Map<string, Player> = new Map()
  
  public constructor(options: Discord.ClientOptions) {
    super(options)
    this.prisma = prisma
    this.redis = redis
    this.queue = queue
  }

  public async connect() {
    const start = Date.now()
    
    Logger.warn('Connecting to database...')

    await prisma.$connect()

    Logger.send(`Database connected in ${((Date.now() - start) / 1000).toFixed(1)}s!`)

    for(const player of getPlayers()) {
      this.players.set(player.id.toString(), {
        ...player,
        price: calcPlayerPrice(player)
      })
    }

    for(const file of readdirSync(path.resolve(__dirname, '../../listeners'))) {
      const listener: Listener = (await import(`../../listeners/${file}`)).default

      if(listener.name === 'ready') this.once('ready', () => listener.run(this).catch((e: Error) => new Logger(this).error(e)))

      else this.on(listener.name, (...args) => listener.run(this, ...args).catch((e: Error) => new Logger(this).error(e)))
    }

    for(const folder of readdirSync(path.resolve(__dirname, '../../commands'))) {
      for(const file of readdirSync(path.resolve(__dirname, `../../commands/${folder}`))) {
        const command: Command = (await import(`../../commands/${folder}/${file}`)).default

        if(this.commands.get(command.name)) {
          Logger.warn(`There is already an interaction named '${command.name}'`)
        }

        this.commands.set(command.name, command)
      }
    }

    for(const folder of readdirSync(path.resolve(__dirname, '../../interactions'))) {
      for(const file of readdirSync(path.resolve(__dirname, `../../interactions/${folder}`))) {
        const interaction = (await import(`../../interactions/${folder}/${file}`)).default

        if(this.interactions.get(interaction.name)) {
          Logger.warn(`There is already an interaction named '${interaction.name}'`)
        }

        this.interactions.set(interaction.name, interaction)
      }
    }

    await super.login(process.env.BOT_TOKEN)
  }
  public async postCommands() {
    const commands: Discord.ApplicationCommandData[] = []

    this.commands.forEach(cmd => {
      const integrationTypes = [
        Discord.ApplicationIntegrationType.GuildInstall
      ]

      const contexts = [
        Discord.InteractionContextType.Guild
      ]

      if(cmd.userInstall) {
        integrationTypes.push(Discord.ApplicationIntegrationType.UserInstall)
        contexts.push(
          Discord.InteractionContextType.BotDM,
          Discord.InteractionContextType.PrivateChannel
        )
      }

      commands.push({
        name: cmd.name,
        nameLocalizations: cmd.nameLocalizations,
        description: cmd.description,
        descriptionLocalizations: cmd.descriptionLocalizations,
        options: cmd.options,
        type: 1,
        integrationTypes,
        contexts
      })
    })
    
    await rest.put(Discord.Routes.applicationCommands(this.user!.id), {
      body: commands
    })
  }
}

export const app = new App({
  intents: ['GuildMessages', 'Guilds', 'GuildMembers'],
  allowedMentions: {
    repliedUser: true,
    parse: ['users', 'roles']
  },
  shards: 'auto'
})