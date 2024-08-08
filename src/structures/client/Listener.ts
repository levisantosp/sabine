import { ClientEvents } from 'oceanic.js'
import App from './App'

interface ListenerOptions {
  name: keyof ClientEvents
  client: App
}
export default class Listener {
  name: keyof ClientEvents
  client: App
  constructor(options: ListenerOptions) {
    this.name = options.name
    this.client = options.client
  }
}