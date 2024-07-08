import { Client, ClientOptions } from 'eris'
import { readdirSync } from 'fs'
import mongoose from 'mongoose'
import { Logger, Command, Listener } from '..'
import path from 'path'

export default class App extends Client {
  commands: Map<string, Command>
  constructor(token: string, options?: ClientOptions) {
    super(token, options)
    this.commands = new Map()
  }
  async start() {
    await mongoose.connect(process.env.MONGO_URI!)
    Logger.send('Database online')
    await this.connect()
    for(const listen of readdirSync(path.join(__dirname, '../../listeners'))) {
      const Listener = await import(`../../listeners/${listen}`)
      const ListenerClass = Listener.default.default ?? Listener.default
      const listener = new ListenerClass(this)
      this.on(listener.name, (...args) => listener.on(...args).catch((e: Error) => new Logger(this).error(e)))
    }
    for(const cmd of readdirSync(path.join(__dirname, '../../commands'))) {
      const Command = await import(`../../commands/${cmd}`)
      const CommandClass = Command.default.default ?? Command.default
      const command = new CommandClass(this)
      this.commands.set(command.name, command)
    }
  }
}