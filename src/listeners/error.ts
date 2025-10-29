import createListener from '../structures/app/createListener.ts'
import Logger from '../util/Logger.ts'

export default createListener({
  name: 'error',
  async run(client, error) {
    new Logger(client).error(error)
  }
})