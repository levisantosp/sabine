import createComponentInteraction from "../structures/interactions/createComponentInteraction.ts"

export default createComponentInteraction({
  name: "pickem",
  flags: 64,
  async run({ ctx }) {
    await ctx.reply("helper.pickem.res")
  }
})