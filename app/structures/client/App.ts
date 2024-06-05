import { Client, ClientOptions } from 'eris'
import { readdirSync } from 'fs'
import mongoose from 'mongoose'
import { Logger, Command } from '..'

export default class App extends Client {
  commands: Map<string, Command>
  vanilla: Map<string, Command>
  aliases: Map<string, string>
  constructor(token: string, options?: ClientOptions) {
    super(token, options)
    this.commands = new Map()
    this.vanilla = new Map()
    this.aliases = new Map()
  }
  async start() {
    await mongoose.connect(process.env.MONGO_URI!)
    Logger.send('Database online')
    await this.connect()

    for(const listen of readdirSync('./app/listeners')) {
      const Listener = await import(`../../listeners/${listen}`)
      const listener = new Listener.default(this)
      this.on(listener.name, (...args) => listener.on(...args).catch((e: Error) => new Logger(this).error(e)))
    }
    for(const cmd of readdirSync('./app/commands/vanilla')) {
      const Command = await import(`../../commands/vanilla/${cmd}`)
      const command = new Command.default(this)
      this.vanilla.set(command.name, command)
      if(command.aliases) {
        command.aliases.forEach((alias: string) => this.aliases.set(alias, command.name))
      }
    }
  }
}