import { createCommand } from "../structures"

export default createCommand({
  name: "ping",
  description: "Shows the bot latency",
  descriptionLocalizations: {
    "pt-BR": "Mostra a latência do bot"
  },
  async run({ ctx }) {
    ctx.reply(`🏓 Pong! \`${ctx.guild.shard.latency}ms\``);
  }
});