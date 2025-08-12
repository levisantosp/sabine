import { SabineUser } from '../../database/index.ts'
import Match from '../../simulator/Match.ts'
import createComponentInteraction from '../../structures/interactions/createComponentInteraction.ts'

export default createComponentInteraction({
  name: 'duel',
  time: 5 * 60 * 1000,
  async run({ ctx, client }) {
    // const match = new Match({
    //   teams: [
    //     {
    //       roster: user.roster.active,
    //       user: {
    //         name: client.users.get(user.id)!.username,
    //         id: user.id
    //       },
    //       name: user.team.name!,
    //       tag: user.team.tag!
    //     },
    //     {
    //       roster: ctx.db.user.roster.active,
    //       user: {
    //         name: ctx.interaction.user.username,
    //         id: ctx.db.user.id
    //       },
    //       name: ctx.db.user.team.name,
    //       tag: ctx.db.user.team.tag!
    //     }
    //   ],
    //   ctx,
    //   locale: ctx.db.user.lang ?? ctx.db.guild!.lang
    // })
    // const embed = new EmbedBuilder()
    // .setTitle(`${match.__teams[0].name} 0 <:versus:1349105624180330516> 0 ${match.__teams[1].name}`)
    // .setDesc(t('commands.duel.started'))
    // match.setContent(embed.description + '\n')
    // await ctx.edit(embed.build())
    // try {
    //   while(!match.finished) {
    //     users[ctx.interaction.user.id] = true
    //     users[user.id] = true
    //     await match.wait(2000)
    //     await match.startRound()
    //   }
    // }
    // catch(e) {
    //   delete users[ctx.interaction.user.id]
    //   delete users[user.id]
    //   new Logger(client).error(e as Error)
    // }
    // finally {
    //   delete users[ctx.interaction.user.id]
    //   delete users[user.id]
    // }
  }
})