import { App, Listener, Logger } from '../structures'

export default class ErrorListener extends Listener {
  public constructor(client: App) {
    super({
      client,
      name: 'error'
    })
  }
  public async on(error: string | Error, shardId?: number) {
    new Logger(this.client).error(error, shardId)
  }
}