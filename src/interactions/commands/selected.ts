import { ComponentTypes } from "oceanic.js"
import createComponentInteraction from "../../structures/interactions/createComponentInteraction.ts"
import { valorant_agents } from "../../config.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import { SabineUser } from "../../database/index.ts"
import { calcPlayerOvr, getPlayer } from "players"
import Match from "../../simulator/Match.ts"
import Logger from "../../util/Logger.ts"

export default createComponentInteraction({
  name: "selected",
  // time: 7 * 60 * 1000,
  flags: 64,
  async run({ ctx, client, t }) {
    if(ctx.interaction.data.componentType !== ComponentTypes.STRING_SELECT) return
    const agentName = ctx.interaction.data.values.getStrings()[0]
    const keys = await client.redis.keys("agent_selection*")
    const key = keys.find(key => key.includes(ctx.interaction.user.id))
    if(!key) return
    const value = await client.redis.get(key)
    if(!value) return
    let data = JSON.parse(value)
    let duplicatedAgent = false
    for(const p of data[ctx.interaction.user.id]) {
      if(!p.agent) continue
      if(p.agent.name === agentName) duplicatedAgent = true
    }
    if(duplicatedAgent) {
      return await ctx.reply("commands.duel.duplicated_agent")
    }
    const i = data[ctx.interaction.user.id].findIndex((p: any) => p.id.toString() === ctx.args[2])
    data[ctx.interaction.user.id][i] = {
      ...data[ctx.interaction.user.id][i],
      agent: {
        name: agentName,
        role: valorant_agents.find(a => a.name === agentName)!.role
      }
    }
    await client.redis.set(key, JSON.stringify(data), {
      expiration: {
        type: "EX",
        value: 600
      }
    })
    data = JSON.parse((await client.redis.get(key))!)
    const user = await SabineUser.fetch(ctx.args.at(-1)!)
    if(!user) return
    const embed = new EmbedBuilder()
    .setTitle(t("commands.duel.embed.title"))
    .setDesc(t("commands.duel.embed.desc"))
    .setImage(data.image)
    .setFields(
      {
        name: key.split(":")[1] === ctx.interaction.user.id ?
              ctx.db.user.team!.name! :
              user.team!.name!,
        value: key.split(":")[1] === ctx.interaction.user.id ?
          ctx.db.user.roster!.active.map(id => {
            const player = getPlayer(id)!
            let emoji: string | undefined = "<a:loading:809221866434199634>"
            const i = data[ctx.interaction.user.id].findIndex((p: any) => p.id.toString() === id)
            if(
              data[ctx.interaction.user.id][i].id.toString() ===
              id &&
              data[ctx.interaction.user.id][i].agent
            ) {
              emoji = valorant_agents.find(agent => agent.name === data[ctx.interaction.user.id][i].agent!.name)?.emoji
            }
            const ovr = parseInt(calcPlayerOvr(player).toString())
            return `${emoji} ${player.name} (${ovr})`
          }).join("\n") :
          user.roster!.active.map(id => {
            const player = getPlayer(id)!
            let emoji: string | undefined = "<a:loading:809221866434199634>"
            const i = data[user.id].findIndex((p: any) => p.id.toString() === id)
            if(
              data[user.id][i].id.toString() ===
              id &&
              data[user.id][i].agent
            ) {
              emoji = valorant_agents.find(agent => agent.name === data[user.id][i].agent!.name)?.emoji
            }
            const ovr = parseInt(calcPlayerOvr(player).toString())
            return `${emoji} ${player.name} (${ovr})`
          }).join("\n"),
        inline: true
      },
      {
        name: key.split(":")[1] !== ctx.interaction.user.id ?
              ctx.db.user.team!.name! :
              user.team!.name!,
        value: key.split(":")[1] !== ctx.interaction.user.id ?
          ctx.db.user.roster!.active.map(id => {
            const player = getPlayer(id)!
            let emoji: string | undefined = "<a:loading:809221866434199634>"
            const i = data[ctx.interaction.user.id].findIndex((p: any) => p.id.toString() === id)
            if(
              data[ctx.interaction.user.id][i].id.toString() ===
              id &&
              data[ctx.interaction.user.id][i].agent
            ) {
              emoji = valorant_agents.find(agent => agent.name === data[ctx.interaction.user.id][i].agent!.name)?.emoji
            }
            const ovr = parseInt(calcPlayerOvr(player).toString())
            return `${emoji} ${player.name} (${ovr})`
          }).join("\n") :
          user.roster!.active.map(id => {
            const player = getPlayer(id)!
            let emoji: string | undefined = "<a:loading:809221866434199634>"
            const i = data[user.id].findIndex((p: any) => p.id.toString() === id)
            if(
              data[user.id][i].id.toString() ===
              id &&
              data[user.id][i].agent
            ) {
              emoji = valorant_agents.find(agent => agent.name === data[user.id][i].agent!.name)?.emoji
            }
            const ovr = parseInt(calcPlayerOvr(player).toString())
            return `${emoji} ${player.name} (${ovr})`
          }).join("\n"),
        inline: true
      }
    )
    .setFooter({ text: t("commands.duel.time") })
    const message = await client.rest.channels.getMessage(data.channelId, data.messageId)
    await ctx.edit("commands.duel.agent_selected", {
      p: getPlayer(ctx.args[2])!.name,
      agent: agentName
    })
    if(
      data[ctx.interaction.user.id].filter((p: any) => p.agent).length === 5 &&
      data[user.id].filter((p: any) => p.agent).length === 5
    ) {
      const timeout = 10000
      await message.edit({
        content: message.content + "\n" + t("commands.duel.starting_in", {
          time: `<t:${((Date.now() + timeout) / 1000).toFixed(0)}:R>`
        }),
        embeds: [embed],
        components: []
      })
      setTimeout(async() => {
        const match = new Match({
          teams: [],
          ctx,
          t,
          mode: data.mode,
          map: data.map,
          content: ""
        })
        try {
          while(!match.finished) {
            await client.redis.set(`match:${ctx.db.user.id}`, 1)
            await client.redis.set(`match:${user.id}`, 1)
            await match.wait(5000)
            await match.start()
          }
        }
        catch(e) {
          await client.redis.del(`match:${ctx.db.user.id}`)
          await client.redis.del(`match:${user.id}`)
          await new Logger(client).error(e as Error)
        }
        finally {
          await client.redis.del(`match:${ctx.db.user.id}`)
          await client.redis.del(`match:${user.id}`)
        }
      }, timeout)
    }
    else {
      await message.edit({
        embeds: [embed],
        components: message.components
      })
    }
  }
})