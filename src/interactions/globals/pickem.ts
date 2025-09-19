import createComponentInteraction from "../../structures/interaction/createComponentInteraction.ts"

export default createComponentInteraction({
  name: "pickem",
  flags: 64,
  async run({ ctx }) {
    await ctx.reply("helper.pickem.res")
  }
})