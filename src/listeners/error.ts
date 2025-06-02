import createListener from "../structures/client/createListener.js"
import Logger from "../structures/util/Logger.js"

export default createListener({
  name: "error",
  async run(client, info, shard) {
    new Logger(client).error(info, shard)
  }
})