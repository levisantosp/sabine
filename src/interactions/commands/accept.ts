import { SabineUser } from '../../database/index.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import createComponentInteraction from '../../structures/interaction/createComponentInteraction.ts'
import { ComponentType, Message } from 'discord.js'
import SelectMenuBuilder from '../../structures/builders/SelectMenuBuilder.ts'
import { valorant_agents, valorant_maps } from '../../config.ts'

export default createComponentInteraction({
  name: 'accept',
  time: 60 * 1000,
  async run({ ctx, app, t }) {
    const user = await SabineUser.fetch(ctx.args[2])

    const keys = await app.redis.keys('agent_selection*')

    if(!ctx.db.user.team_name || !ctx.db.user.team_tag) {
      return await ctx.reply('commands.duel.needed_team_name')
    }

    if(ctx.db.user.active_players.length < 5) {
      return await ctx.reply('commands.duel.team_not_completed_1')
    }

    if(!user || user.active_players.length < 5) {
      return await ctx.reply('commands.duel.team_not_completed_2')
    }

    if(!user.team_name || !user.team_tag) {
      return await ctx.reply('commands.duel.needed_team_name_2')
    }

    if(await app.redis.get(`match:${ctx.interaction.user.id}`) || keys.some(key => key.includes(ctx.interaction.user.id))) {
      return await ctx.reply('commands.duel.already_in_match')
    }

    if(await app.redis.get(`match:${user.id}`) || keys.some(key => key.includes(user.id))) {
      return await ctx.reply('commands.duel.already_in_match_2')
    }

    let maps = valorant_maps

    if(ctx.args.includes('ranked')) {
      maps = maps.filter(map => map.current_map_pool)
    }

    let map = maps[Math.floor(Math.random() * maps.length)]

    if(ctx.args.includes('tournament')) {
      map = valorant_maps.filter(m => m.name === ctx.args[4])[0]
    }

    const embed = new EmbedBuilder()
      .setTitle(t('commands.duel.embed.title'))
      .setDesc(t('commands.duel.embed.desc'))
      .setFields(
        {
          name: user.team_name,
          value: user.active_players.map(id => {
            const player = app.players.get(id)!
            const ovr = parseInt(player.ovr.toString())
            return `<a:loading:809221866434199634> ${player.name} (${ovr})`
          }).join('\n'),
          inline: true
        },
        {
          name: ctx.db.user.team_name,
          value: ctx.db.user.active_players.map(id => {
            const player = app.players.get(id)!
            const ovr = parseInt(player.ovr.toString())
            return `<a:loading:809221866434199634> ${player.name} (${ovr})`
          }).join('\n'),
          inline: true
        }
      )
      .setImage(map.image)
      .setFooter({ text: t('commands.duel.time') })

    const menu1 = new SelectMenuBuilder()
      .setPlaceholder(user.team_name)
      .setOptions(
        ...user.active_players.map(id => {
          const player = app.players.get(id)!
          return {
            label: `${player.name}`,
            value: player.id.toString()
          }
        })
      )
      .setCustomId(`select;${user.id};${ctx.interaction.user.id}`)

    const menu2 = new SelectMenuBuilder()
      .setPlaceholder(ctx.db.user.team_name!)
      .setOptions(
        ...ctx.db.user.active_players.map(id => {
          const player = app.players.get(id)!
          return {
            label: `${player.name}`,
            value: player.id.toString()
          }
        })
      )
      .setCustomId(`select;${ctx.interaction.user.id};${user.id}`)

    const msg = await ctx.edit({
      embeds: [embed],
      content: `${ctx.interaction.user} <@${user.id}>`,
      components: [
        {
          type: ComponentType.ActionRow,
          components: [menu1]
        },
        {
          type: ComponentType.ActionRow,
          components: [menu2]
        }
      ]
    }) as Message

    const data: {
      [key: string]: {
        name: string
        id: number
        role: string
        aim: number
        HS: number
        movement: number
        aggression: number
        ACS: number
        gamesense: number
        ovr: number
        agent: {
          name: string
          role: typeof valorant_agents[number]['role']
        } | null
      }[]
    } = {}

    data[ctx.db.user.id] = ctx.db.user.active_players.map(id => {
      const p = app.players.get(id)!
      const ovr = p.ovr
      return {
        ...p,
        ovr,
        agent: null
      }
    })

    data[user.id] = user.active_players.map(id => {
      const p = app.players.get(id)!
      const ovr = p.ovr
      return {
        ...p,
        ovr,
        agent: null
      }
    })

    await app.redis.set(`agent_selection:${user.id}:${ctx.interaction.user.id}`, JSON.stringify(
      {
        ...data,
        messageId: msg.id,
        channelId: msg.channelId,
        map: map.name,
        image: map.image,
        mode: ctx.args[3] === 'tournament' ? 'tournament' : ctx.args.slice(3).join(':')
      }
    ), {
      expiration: {
        type: 'EX',
        value: 300
      }
    })
  }
})