import ValorantMatch from "../../simulator/valorant/ValorantMatch.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"
import createCommand from "../../structures/command/createCommand.js"

const users: {[key: string]: boolean} = {}

export default createCommand({
  name: "match",
  category: "simulator",
  description: "test cmd",
  async run({ ctx, client, locale }) {
    const match = new ValorantMatch({
      __teams: [
        {
          roster: ctx.db.user.roster.active,
          user: {
            name: client.users.get(ctx.db.user.id)!.username,
            id: ctx.db.user.id
          }
        },
        {
          roster: [
            "31",
            "32",
            "33",
            "34",
            "35"
          ],
          user: {
            name: "IA",
            id: "934070086766051379"
          }
        }
      ],
      ctx,
      locale: ctx.db.user.lang ?? ctx.db.guild.lang
    })
    const embed = new EmbedBuilder()
    .setTitle(`${ctx.interaction.user.username} 0 <:versus:1349105624180330516> 0 IA`)
    .setDesc(locale("commands.match.started"))
    match.setContent(embed.description + "\n")
    ctx.reply(embed.build())
    while(!match.finished) {
      await match.wait(1000)
      await match.startRound()
    }
  }
})