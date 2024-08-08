import { Client, ClientOptions } from 'oceanic.js'
import { readdirSync } from 'fs'
import mongoose from 'mongoose'
import { Logger, Command } from '..'
import path from 'path'

export default class App extends Client {
  public commands: Map<string, Command>
  public constructor(options?: ClientOptions) {
    super(options)
    this.commands = new Map()
  }
  public async start() {
    await mongoose.connect(process.env.MONGO_URI!)
    Logger.send('Database online')
    await this.connect()
    for(const listen of readdirSync(path.join(__dirname, '../../listeners'))) {
      const Listener = await import(`../../listeners/${listen}`)
      const ListenerClass = Listener.default.default ?? Listener.default
      const listener = new ListenerClass(this)
      if(listener.name === 'ready') this.once(listener.name, (...args) => listener.on(...args).catch((e: Error) => new Logger(this).error(e)))
      else this.on(listener.name, (...args) => listener.on(...args).catch((e: Error) => new Logger(this).error(e)))
    }
    for(const cmd of readdirSync(path.join(__dirname, '../../commands'))) {
      const Command = await import(`../../commands/${cmd}`)
      const CommandClass = Command.default.default ?? Command.default
      const command = new CommandClass(this)
      this.commands.set(command.name, command)
    }
  }
}