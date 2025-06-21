import * as Oceanic from "oceanic.js"
import { readdirSync } from "fs"
import mongoose from "mongoose"
import path from "path"
import { Command } from "../command/createCommand.js"
import Logger from "../util/Logger.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default class App extends Oceanic.Client {
  public commands: Map<string, Command> = new Map()
  public _uptime: number = Date.now()
  public constructor(options?: Oceanic.ClientOptions) {
    super(options)
  }
  public async start() {
    Logger.warn("Connecting to database...")
    await mongoose.connect(process.env.MONGO_URI!)
    Logger.send("Database connected!")
    for(const file of readdirSync(path.resolve(__dirname, "../../listeners"))) {
      const listener = (await import(`../../listeners/${file}`)).default
      if(listener.name === "ready") this.once("ready", () => listener.run(this).catch((e: Error) => new Logger(this).error(e)))
      else this.on(listener.name, (...args) => listener.run(this, ...args).catch((e: Error) => new Logger(this).error(e)))
    }
    for(const folder of readdirSync(path.resolve(__dirname, "../../commands"))) {
      for(const file of readdirSync(path.resolve(__dirname, `../../commands/${folder}`))) {
        const command = (await import(`../../commands/${folder}/${file}`)).default.default ?? (await import(`../../commands/${folder}/${file}`)).default
        this.commands.set(command.name, command)
      }
    }
    await this.connect()
  }
}