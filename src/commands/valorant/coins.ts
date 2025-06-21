import createCommand from "../../structures/command/createCommand.js"

export default createCommand({
  name: "coins",
  description: "Check your coins",
  descriptionLocalizations: {
    "pt-BR": "Veja seus coins"
  },
  category: "simulator",
  async run({ ctx }) {
    await ctx.reply("commands.coins.res", { c: ctx.db.user.coins.toLocaleString("en-US") })
  }
})