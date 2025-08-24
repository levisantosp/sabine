import * as Oceanic from "oceanic.js"
import { readdirSync } from "fs"
import path from "path"
import type { Command } from "../command/createCommand.ts"
import { fileURLToPath } from "url"
import { PrismaClient } from "@prisma/client"
import Redis from "redis"
import Logger from "../../util/Logger.ts"
import type { CreateInteractionOptions } from "../interactions/createComponentInteraction.ts"

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const redis = Redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: retries => Math.min(retries * 50, 1000)
  }
})

export default class App extends Oceanic.Client {
  public commands: Map<string, Command> = new Map()
  public _uptime: number = Date.now()
  public prisma: typeof prisma
  public redis: typeof redis
  public interactions: Map<string, CreateInteractionOptions> = new Map()
  public constructor(options?: Oceanic.ClientOptions) {
    super(options)
    this.prisma = prisma
    this.redis = redis
  }
  public override async connect() {
    const start = Date.now()
    Logger.warn("Connecting to database...")
    await prisma.$connect()
    Logger.send(`Database connected in ${((Date.now() - start) / 1000).toFixed(1)}s!`)
    for(const file of readdirSync(path.resolve(__dirname, "../../listeners"))) {
      const listener = (await import(`../../listeners/${file}`)).default
      if(listener.name === "ready") this.once("ready", () => listener.run(this).catch((e: Error) => new Logger(this).error(e)))
      else this.on(listener.name, (...args) => listener.run(this, ...args).catch((e: Error) => new Logger(this).error(e)))
    }
    for(const folder of readdirSync(path.resolve(__dirname, "../../commands"))) {
      for(const file of readdirSync(path.resolve(__dirname, `../../commands/${folder}`))) {
        const command = (await import(`../../commands/${folder}/${file}`)).default
        this.commands.set(command.name, command)
      }
    }
    for(const file of readdirSync(path.resolve(__dirname, "../../interactions/commands"))) {
      const interaction = (await import(`../../interactions/commands/${file}`)).default
      this.interactions.set(interaction.name, interaction)
    }
    await super.connect()
  }
  public async bulkEditGlobalCommands() {
    const commands: Oceanic.CreateApplicationCommandOptions[] = []
    this.commands.forEach(cmd => {
      const integrationTypes = [
        Oceanic.ApplicationIntegrationTypes.GUILD_INSTALL
      ]
      const contexts = [
        Oceanic.InteractionContextTypes.GUILD
      ]
      if(cmd.userInstall) {
        integrationTypes.push(Oceanic.ApplicationIntegrationTypes.USER_INSTALL)
        contexts.push(
          Oceanic.InteractionContextTypes.BOT_DM,
          Oceanic.InteractionContextTypes.PRIVATE_CHANNEL
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
    await this.application.bulkEditGlobalCommands(commands)
  }
}
export const client = new App({
  auth: "Bot " + process.env.BOT_TOKEN,
  gateway: {
    intents: ["ALL"],
    autoReconnect: true,
    maxShards: "auto"
  },
  allowedMentions: {
    everyone: false,
    users: true,
    repliedUser: true,
    roles: false
  },
  defaultImageFormat: "png",
  defaultImageSize: 2048
})