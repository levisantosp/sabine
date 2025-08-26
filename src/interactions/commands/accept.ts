import { calcPlayerOvr, getPlayer } from "players"
import { SabineUser } from "../../database/index.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import createComponentInteraction from "../../structures/interactions/createComponentInteraction.ts"
import { ComponentTypes } from "oceanic.js"
import SelectMenuBuilder from "../../structures/builders/SelectMenuBuilder.ts"
import { valorant_agents, valorant_maps } from "../../config.ts"

export default createComponentInteraction({
  name: "accept",
  time: 60 * 1000,
  async run({ ctx, client, t }) {
    const user = await SabineUser.fetch(ctx.args[2])
    const keys = await client.redis.keys("agent_selection*")
    if(!ctx.db.user.team?.name || !ctx.db.user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name")
    }
    if(!ctx.db.user.roster || ctx.db.user.roster.active.length < 5) {
      return await  ctx.reply("commands.duel.team_not_completed_1")
    }
    if(!user || !user.roster || user.roster.active.length < 5) {
      return await ctx.reply("commands.duel.team_not_completed_2")
    }
    if(!user.team?.name || !user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name_2")
    }
    if(await client.redis.get(`match:${ctx.interaction.user.id}`) || keys.some(key => key.includes(ctx.interaction.user.id))) {
      return await ctx.reply("commands.duel.already_in_match")
    }
    if(await client.redis.get(`match:${user.id}`) || keys.some(key => key.includes(user.id))) {
      return await ctx.reply("commands.already_in_match_2")
    }
    let maps = valorant_maps
    if(ctx.args.includes("ranked")) {
      maps = maps.filter(map => map.current_map_pool)
    }
    const map = maps[Math.floor(Math.random() * maps.length)]
    const embed = new EmbedBuilder()
    .setTitle(t("commands.duel.embed.title"))
    .setDesc(t("commands.duel.embed.desc"))
    .setFields(
      {
        name: user.team.name,
        value: user.roster.active.map(id => {
          const player = getPlayer(id)!
          const ovr = parseInt(calcPlayerOvr(player).toString())
          return `<a:loading:809221866434199634> ${player.name} (${ovr})`
        }).join("\n"),
        inline: true
      },
      {
        name: ctx.db.user.team.name,
        value: ctx.db.user.roster.active.map(id => {
          const player = getPlayer(id)!
          const ovr = parseInt(calcPlayerOvr(player).toString())
          return `<a:loading:809221866434199634> ${player.name} (${ovr})`
        }).join("\n"),
        inline: true
      }
    )
    .setImage(map.image)
    .setFooter({ text: t("commands.duel.time") })
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
    .setCustomId(`select;${user.id};${ctx.interaction.user.id}`)
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
    .setCustomId(`select;${ctx.interaction.user.id};${user.id}`)
    const msg: any = await ctx.edit(embed.build({
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
          role: typeof valorant_agents[number]["role"]
        } | null
      }[]
    } = {}
    data[ctx.db.user.id] = ctx.db.user.roster.active.map(id => {
      const p = getPlayer(id)!
      const ovr = calcPlayerOvr(p)
      return {
        ...p,
        ovr,
        agent: null
      }
    })
    data[user.id] = user.roster.active.map(id => {
      const p = getPlayer(id)!
      const ovr = calcPlayerOvr(p)
      return {
        ...p,
        ovr,
        agent: null
      }
    })
    await client.redis.set(`agent_selection:${user.id}:${ctx.interaction.user.id}`, JSON.stringify(
      {
        ...data,
        messageId: msg.resource.message.id,
        channelId: msg.resource.message.channelID,
        map: map.name,
        image: map.image,
        mode: ctx.args.slice(3).join(":")
      }
    ), {
      expiration: {
        type: "EX",
        value: 300
      }
    })
  }
})