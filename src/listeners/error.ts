import { createListener, Logger } from "../structures"

export default createListener({
  name: "error",
  async run(client, info, shard) {
    new Logger(client).error(info, shard);
  }
});