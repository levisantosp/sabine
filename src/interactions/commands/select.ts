import { ComponentTypes } from "oceanic.js"
import { valorant_agents } from "../../config.ts"
import createComponentInteraction from "../../structures/interactions/createComponentInteraction.ts"
import SelectMenuBuilder from "../../structures/builders/SelectMenuBuilder.ts"

export default createComponentInteraction({
  name: "select",
  time: 6 * 60 * 1000,
  flags: 64,
  async run({ ctx, t, client }) {
    if(ctx.interaction.data.componentType !== ComponentTypes.STRING_SELECT) return
    const player = client.players.get(ctx.interaction.data.values.getStrings()[0])
    if(!player) return
    const controllers = new SelectMenuBuilder()
    .setCustomId(`selected;${ctx.interaction.user.id};${player.id};controller;${ctx.args[2]}`)
    .setPlaceholder(t("helper.controllers"))
    .setOptions(
      ...valorant_agents
      .filter(a => a.role === "controller")
      .map(agent => {
        return {
          label: agent.name,
          value: agent.name
        }
      })
    )
    const duelists = new SelectMenuBuilder()
    .setCustomId(`selected;${ctx.interaction.user.id};${player.id};duelist;${ctx.args[2]}`)
    .setPlaceholder(t("helper.duelists"))
    .setOptions(
      ...valorant_agents
      .filter(a => a.role === "duelist")
      .map(agent => {
        return {
          label: agent.name,
          value: agent.name
        }
      })
    )
    const initiators = new SelectMenuBuilder()
    .setCustomId(`selected;${ctx.interaction.user.id};${player.id};initiator;${ctx.args[2]}`)
    .setPlaceholder(t("helper.initiators"))
    .setOptions(
      ...valorant_agents
      .filter(a => a.role === "initiator")
      .map(agent => {
        return {
          label: agent.name,
          value: agent.name
        }
      })
    )
    const sentinels = new SelectMenuBuilder()
    .setCustomId(`selected;${ctx.interaction.user.id};${player.id};sentinel;${ctx.args[2]}`)
    .setPlaceholder(t("helper.sentinels"))
    .setOptions(
      ...valorant_agents
      .filter(a => a.role === "sentinel")
      .map(agent => {
        return {
          label: agent.name,
          value: agent.name
        }
      })
    )
    return await ctx.reply({
      components: [
        {
          type: ComponentTypes.ACTION_ROW,
          components: [controllers]
        },
        {
          type: ComponentTypes.ACTION_ROW,
          components: [duelists]
        },
        {
          type: ComponentTypes.ACTION_ROW,
          components: [initiators]
        },
        {
          type: ComponentTypes.ACTION_ROW,
          components: [sentinels]
        }
      ]
    })
  }
})