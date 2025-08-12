import { getPlayer } from 'players'
import { SabineUser } from '../../database/index.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import createComponentInteraction from '../../structures/interactions/createComponentInteraction.ts'
import { emojis } from '../../util/emojis.ts'
import { ComponentTypes } from 'oceanic.js'
import SelectMenuBuilder from '../../structures/builders/SelectMenuBuilder.ts'

export default createComponentInteraction({
  name: 'accept',
  time: 60 * 1000,
  async run({ ctx, client, t }) {
    const user = await SabineUser.fetch(ctx.args[2])
    if(!ctx.db.user.team?.name || !ctx.db.user.team.tag) {
      return await ctx.reply('commands.duel.needed_team_name')
    }
    if(!ctx.db.user.roster || ctx.db.user.roster.active.length < 5) {
      return await  ctx.reply('commands.duel.team_not_completed_1')
    }
    if(!user || !user.roster || user.roster.active.length < 5) {
      return await ctx.reply('commands.duel.team_not_completed_2')
    }
    if(!user.team?.name || !user.team.tag) {
      return await ctx.reply('commands.duel.needed_team_name_2')
    }
    if(await client.redis.get(`match:${ctx.interaction.user.id}`)) {
      return await ctx.reply('commands.duel.already_in_match')
    }
    if(await client.redis.get(`match:${user.id}`)) {
      return await ctx.reply('commands.already_in_match_2')
    }
    const embed = new EmbedBuilder()
    .setTitle(t('commands.duel.embed.title'))
    .setDesc(t('commands.duel.embed.desc'))
    .setFields(
      {
        name: user.team.name,
        value: user.roster.active.map(id => {
          const player = getPlayer(id)!
          return `${emojis.find(e => e.name === player.role)?.emoji} ${player.name} (${player.collection})`
        }).join('\n'),
        inline: true
      },
      {
        name: ctx.db.user.team.name,
        value: ctx.db.user.roster.active.map(id => {
          const player = getPlayer(id)!
          return `${emojis.find(e => e.name === player.role)?.emoji} ${player.name} (${player.collection})`
        }).join('\n'),
        inline: true
      }
    )
    .setFooter({ text: t('commands.duel.time') })
    const menu1 = new SelectMenuBuilder()
    .setPlaceholder(user.team.name)
    .setOptions(
      ...user.roster.active.map(id => {
        const player = getPlayer(id)!
        return {
          label: `${player.name}`,
          value: player.id.toString()
        }
      })
    )
    .setCustomId(`select;${user.id}`)
    const menu2 = new SelectMenuBuilder()
    .setPlaceholder(ctx.db.user.team.name)
    .setOptions(
      ...ctx.db.user.roster.active.map(id => {
        const player = getPlayer(id)!
        return {
          label: `${player.name}`,
          value: player.id.toString()
        }
      })
    )
    .setCustomId(`select;${ctx.interaction.user.id}`)
    await ctx.edit(embed.build({
      content: `${ctx.interaction.user.mention} <@${user.id}>`,
      components: [
        {
          type: ComponentTypes.ACTION_ROW,
          components: [menu1]
        },
        {
          type: ComponentTypes.ACTION_ROW,
          components: [menu2]
        }
      ]
    }))
    // await client.redis.set(`match:${ctx.interaction.user.id}`, 'ababa')
  }
})