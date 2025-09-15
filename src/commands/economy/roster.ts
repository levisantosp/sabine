import {
  calcPlayerOvr,
  calcPlayerPrice,
  getPlayers,
  type Player
} from "players"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"
import { emojis } from "../../util/emojis.ts"

const players = new Map<string, Player>(
  getPlayers().map(p => [
    p.id.toString(),
    {
      ...p,
      ovr: calcPlayerOvr(p),
      price: calcPlayerPrice(p)
    }
  ])
)
export default createCommand({
  name: "roster",
  category: "economy",
  nameLocalizations: {
    "pt-BR": "elenco"
  },
  description: "Check your roster",
  descriptionLocalizations: {
    "pt-BR": "Veja seu elenco"
  },
  userInstall: true,
  messageComponentInteractionTime: 5 * 60 * 1000,
  async run({ ctx, t }) {
    const active_players = ctx.db.user.active_players
    const reserve_players = ctx.db.user.reserve_players
    let value = 0n
    let ovr = 0
    for(const p of active_players) {
      const player = players.get(p)
      if(!player || !player.ovr || !player.price) break
      ovr += player.ovr
      value += player.price
    }
    for(const p of reserve_players) {
      const player = players.get(p)
      if(!player || !player.ovr || !player.price) break
      ovr += player.ovr
      value += player.price
    }
    const embed = new EmbedBuilder()
    .setTitle(t("commands.roster.embed.title"))
    .setDesc(t(
      "commands.roster.embed.desc",
      {
        value: parseInt(value.toString()).toLocaleString(),
        ovr: Math.floor(ovr / (active_players.length + reserve_players.length)),
        name: ctx.db.user.team_name ? `${ctx.db.user.team_name} (${ctx.db.user.team_tag})` : "`undefined`"
      }
    ))
    .setThumb(ctx.interaction.user.avatarURL())
    let active_content = ""
    let reserve_content = ""
    for(const p_id of active_players) {
      const player = players.get(p_id)
      if(!player || !player.ovr) break
      active_content += `${emojis.find(e => e.name === player.role)?.emoji} ${player.name} (${Math.floor(player.ovr)}) — ${player.collection}\n`
    }
    let i = 0
    for(const p_id of reserve_players) {
      i++
      if(i >= 10) break
      const player = players.get(p_id)
      if(!player || !player.ovr) break
      reserve_content += `${emojis.find(e => e.name === player.role)?.emoji} ${player.name} (${Math.floor(player.ovr)}) — ${player.collection}\n`
    }
    if(reserve_players.length > 10) {
      reserve_content += `- +${reserve_players.length - 10}...`
    }
    embed.addField(t(
      "commands.roster.embed.field.name1",
      {
        total: active_players.length
      }
    ), active_content, true)
    embed.setFields(
      {
        name: t(
          "commands.roster.embed.field.name1",
          {
            total: active_players.length
          }
        ),
        value: active_content,
        inline: true
      },
      {
        name: t(
          "commands.roster.embed.field.name2",
          {
            total: reserve_players.length
          }
        ),
        value: reserve_content,
        inline: true
      }
    )
    const button = new ButtonBuilder()
    .setLabel(t("commands.roster.generate_file"))
    .setCustomId(`roster;${ctx.interaction.user.id};file`)
    .setStyle("blue")
    const button2 = new ButtonBuilder()
    .setLabel(t("commands.roster.change_team"))
    .setCustomId(`roster;${ctx.interaction.user.id};team`)
    .setStyle("green")
    await ctx.reply(embed.build({
      components: [
        {
          type: 1,
          components: [button, button2]
        }
      ]
    }))
  },
  async createMessageComponentInteraction({ ctx, i, t }) {
    if(ctx.args[2] === "file") {
      await ctx.interaction.defer(64)
      let playersContent = ""
      const active_players = ctx.db.user.active_players
      const reserve_players = ctx.db.user.reserve_players
      for(const p of active_players) {
        if(!active_players.length) break
        const player = players.get(p)
        if(!player || !player.ovr) continue
        playersContent += `${player.name} (${parseInt(player.ovr.toString())}) — ${player.collection}\n`
      }
      for(const p of reserve_players) {
        if(!reserve_players.length) break
        const player = players.get(p)
        if(!player || !player.ovr) continue
        playersContent += `${player.name} (${parseInt(player.ovr.toString())}) — ${player.collection}\n`
      }
      const txt = Buffer.from(playersContent, "utf-8")
      await ctx.reply("", {
        files: [
          {
            name: `roster_${ctx.interaction.user.id}.txt`,
            contents: txt
          }
        ]
      })
    }
    else {
      await i.createModal({
        customID: `roster;${i.user.id};modal`,
        title: t("commands.roster.modal.title"),
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                customID: `roster;${i.user.id};modal;response-1`,
                label: t("commands.roster.modal.team_name"),
                style: 1,
                minLength: 2,
                maxLength: 20,
                required: true
              }
            ]
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                customID: `roster;${i.user.id};modal;response-2`,
                label: t("commands.roster.modal.team_tag"),
                style: 1,
                minLength: 2,
                maxLength: 4,
                required: true
              }
            ]
          }
        ]
      })
    }
  },
  async createModalSubmitInteraction({ ctx, i }) {
    await i.defer(64)
    const responses = i.data.components.getComponents()
    ctx.db.user.team_name = responses[0].value
    ctx.db.user.team_tag = responses[1].value
    await ctx.db.user.save()
    await ctx.reply("commands.roster.team_info_changed", {
      name: responses[0].value,
      tag: responses[1].value
    })
  }
})