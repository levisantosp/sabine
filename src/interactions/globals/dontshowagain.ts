import createComponentInteraction from "../../structures/interaction/createComponentInteraction.ts"

export default createComponentInteraction({
  name: "dontshowagain",
  flags: 64,
  async run({ ctx }) {
    ctx.db.user.warn = false
    await ctx.db.user.save()
    await ctx.reply("helper.wont_be_warned")
  }
})