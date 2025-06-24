import createListener from "../structures/client/createListener.ts"
import Logger from "../structures/util/Logger.ts"

export default createListener({
  name: "error",
  async run(client, info, shard) {
    new Logger(client).error(info, shard)
  }
})