import colors from "colors"
import moment from "moment"
import { TextChannel } from "oceanic.js"
import App from "../structures/client/App.ts"
import EmbedBuilder from "../structures/builders/EmbedBuilder.ts"

export default class Logger {
  private client: App
  public constructor(client: App) {
    this.client = client
  }
  public static send(message: string) {
    return console.log(colors.green(`[${moment(Date.now()).format("hh:mm:ss")}] ${message}`))
  }
  public static warn(message: string) {
    return console.log(colors.yellow(`[${moment(Date.now()).format("hh:mm:ss")}] ${message}`))
  }
  public async error(error: Error | string, shardId?: number) {
    const ignoredErrors = [
      "Missing Permissions",
      "AbortError: This operation was aborted"
    ]
    if(ignoredErrors.some(e => error.toString().includes(e))) return
    if(typeof error === "string") {
      const embed = new EmbedBuilder()
        .setTitle("An error has occurred")
        .setDesc(`Shard ID: \`${shardId}\`\n\`\`\`js\n${error}\`\`\``)
      const channel = await this.client.rest.channels.get(process.env.ERROR_LOG) as TextChannel
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === `${this.client.user.username} Logger`)[0]
      if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
      webhook.execute({
        embeds: [embed],
        avatarURL: this.client.user.avatarURL()
      }, webhook.token!)
      return console.log(colors.red(`[${moment(Date.now()).format("hh:mm:ss")}] ${error}`))
    }
    else {
      const embed = new EmbedBuilder()
        .setTitle("An error has occurred")
        .setDesc(`Shard ID: \`${shardId}\`\n\`\`\`js\n${error.stack}\`\`\``)
      const channel = await this.client.rest.channels.get(process.env.ERROR_LOG) as TextChannel
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === `${this.client.user.username} Logger`)[0]
      if(!webhook) webhook = await channel.createWebhook({ name: `${this.client.user.username} Logger` })
      webhook.execute({
        embeds: [embed],
        avatarURL: this.client.user.avatarURL()
      }, webhook.token!)
      return console.log(colors.red(`[${moment(Date.now()).format("hh:mm:ss")}] ${error.stack ?? error}`))
    }
  }
}
