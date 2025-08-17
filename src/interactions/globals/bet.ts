import Service from "../../api/index.ts"
import createComponentInteraction from "../../structures/interactions/createComponentInteraction.ts"

const service = new Service(process.env.AUTH)

export default createComponentInteraction({
  name: "bet",
  flags: 64,
  async run({ ctx, t }) {
    if(ctx.db.user.coins < 500) return await ctx.reply("helper.coins_needed")
    const options = {
      valorant: async() => {
        const matches = await service.getMatches("valorant")
        const data = matches.find(m => m.id === ctx.args[2])
        const index = ctx.db.user.valorant_predictions.findIndex(p => p.match === ctx.args[2])
        if(!data || data.status === "LIVE") {
          return await ctx.reply("helper.started")
        }
        if(index === -1) return await ctx.reply("helper.prediction_needed")
        let title = t(
          "helper.bet_modal.title",
          {
            teams: `${ctx.db.user.valorant_predictions[index].teams[0].name} vs ${ctx.db.user.valorant_predictions[index].teams[1].name}`
          }
        )
        if(title.length > 45) {
          title = title.slice(0, 42) + "..."
        }
        await ctx.interaction.createModal({
          customID: `betting;valorant;${ctx.args[2]}`,
          title,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  customID: "response-1",
                  label: t("helper.bet_modal.label"),
                  style: 1,
                  minLength: 3,
                  required: true,
                  placeholder: "Ex.: " + (Math.floor(Math.random() * (1000 - 500 + 1)) + 500).toString()
                }
              ]
            }
          ]
        })
      },
      lol: async() => {
        const matches = await service.getMatches("lol")
        const data = matches.find(m => m.id === ctx.args[2])
        const index = ctx.db.user.lol_predictions.findIndex(p => p.match === ctx.args[2])
        if(!data || data.status === "LIVE") {
          return await ctx.reply("helper.started")
        }
        if(index === -1) return await ctx.reply("helper.prediction_needed")
        await ctx.interaction.createModal({
          customID: `betting;valorant;${ctx.args[2]}`,
          title: t(
            "helper.bet_modal.title",
            {
              teams: `${ctx.db.user.lol_predictions[index].teams[0].name} vs ${ctx.db.user.lol_predictions[index].teams[1].name}`
            }
          ),
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  customID: "response-1",
                  label: t("helper.bet_modal.label"),
                  style: 1,
                  minLength: 3,
                  required: true,
                  placeholder: "Ex.: " + (Math.floor(Math.random() * (1000 - 500 + 1)) + 500).toString()
                }
              ]
            }
          ]
        })
      }
    }
    await options[ctx.args[1] as keyof typeof options]()
  }
})