import { Client, Collection } from 'eris'
import { readdirSync } from 'fs'
import mongoose from 'mongoose'
import Logger from '../util/Logger.js'

export default class App extends Client {
  constructor(token, options) {
    super(token, options)
    this.commands = new Collection()
    this.aliases = new Collection()
  }
  async start() {
    await mongoose.connect(process.env.MONGO_URI)
    Logger.send('Database connected')
    await this.connect()

    let listeners = readdirSync('./app/listeners')
    listeners.forEach(async listen => {
      const Listener = await import(`../../listeners/${listen}`)
      const listener = new Listener.default(this)
      
      this.on(listener.name, (...args) => listener.on(...args).catch(e => new Logger(this).error(e)))
    })

    let commands = readdirSync('./app/commands')
    commands.forEach(async cmd => {
      const Command = await import(`../../commands/${cmd}`)
      const command = new Command.default(this)
      this.commands.set(command.name, command)
      if(command.aliases) command.aliases.forEach(alias => {
        this.aliases.set(alias, command.name)
      })
    })
  }
}