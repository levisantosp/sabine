import { ApplicationCommandOptionTypes } from "oceanic.js"
import createCommand from "../../structures/command/createCommand.ts"
import { SabineUser } from "../../database/index.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"

export default createCommand({
  name: "trade",
  nameLocalizations: {
    "pt-BR": "negociar"
  },
  description: "Trade a player",
  descriptionLocalizations: {
    "pt-BR": "Negocie um jogador"
  },
  category: "economy",
  userInstall: true,
  options: [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: "user",
      nameLocalizations: {
        "pt-BR": "usuário"
      },
      description: "Insert a user",
      descriptionLocalizations: {
        "pt-BR": "Informe o usuário"
      },
      required: true
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: "player",
      nameLocalizations: {
        "pt-BR": "jogador"
      },
      description: "Insert the player",
      descriptionLocalizations: {
        "pt-BR": "Informe o jogador"
      },
      autocomplete: true,
      required: true
    },
    {
      type: ApplicationCommandOptionTypes.INTEGER,
      name: "price",
      nameLocalizations: {
        "pt-BR": "preço"
      },
      description: "Insert a price",
      descriptionLocalizations: {
        "pt-BR": "Informe o preço"
      },
      required: true
    }
  ],
  messageComponentInteractionTime: 5 * 60 * 1000,
  cooldown: true,
  async run({ ctx, t, client }) {
    if(
      ctx.db.user.trade_time &&
      ctx.db.user.trade_time.getTime() > Date.now()
    ) {
      return await ctx.reply("commands.trade.has_been_traded", {
        t: `<t:${(ctx.db.user.trade_time.getTime() / 1000).toFixed(0)}:R>`
      })
    }
    const user = await SabineUser.fetch(ctx.args[0].toString())
    const player = client.players.get(ctx.args[1].toString())
    if(BigInt(ctx.args[2]) < 0) {
      return await ctx.reply("commands.trade.invalid_value")
    }
    if(ctx.args[0] === ctx.interaction.user.id) {
      return await ctx.reply("commands.trade.cannot_trade")
    }
    if(!user || user.coins < BigInt(ctx.args[2])) {
      return await ctx.reply("commands.trade.missing_coins", {
        coins: (BigInt(ctx.args[2]) - (!user ? 0n : user.coins)).toLocaleString(),
        user: `<@${ctx.args[0]}>`
      })
    }
    if(!player) {
      return await ctx.reply("commands.trade.player_not_found")
    }
    await ctx.reply({
      content: t("commands.trade.request", {
        player: `${player.name} (${player.ovr})`,
        collection: player.collection,
        user: `<@${ctx.args[0]}>`,
        author: ctx.interaction.user.mention,
        coins: BigInt(ctx.args[2]).toLocaleString()
      }),
      components: [
        {
          type: 1,
          components: [
            new ButtonBuilder()
            .setStyle("green")
            .setLabel(t("commands.trade.make_purchase"))
            .setCustomId(`trade;${ctx.args[0]};buy;${ctx.interaction.user.id};${player.id};${ctx.args[2]}`),
            new ButtonBuilder()
            .setStyle("red")
            .setLabel(t("commands.trade.cancel"))
            .setCustomId(`trade;${ctx.interaction.user.id};cancel`)
          ]
        }
      ]
    })
  },
  async createAutocompleteInteraction({ i, client }) {
    const user = (await SabineUser.fetch(i.user.id)) ?? new SabineUser(i.user.id)
    const players: Array<{ name: string, ovr: number, id: string }> = []
    for(const p_id of user.reserve_players) {
      const p = client.players.get(p_id)
      if(!p) continue
      const ovr = p.ovr
      players.push({
        name: `${p.name} (${ovr})`,
        ovr,
        id: p_id
      })
    }
    await i.result(
      players.sort((a, b) => a.ovr - b.ovr)
      .filter(p => {
        if(p.name.toLowerCase().includes(i.data.options.getOptions()[1].value.toString().toLowerCase())) return p
      })
      .slice(0, 25)
      .map(p => ({ name: p.name, value: p.id }))
    )
  },
  async createMessageComponentInteraction({ ctx, client }) {
    if(
      ctx.db.user.trade_time &&
      ctx.db.user.trade_time.getTime() > Date.now()
    ) {
      ctx.setFlags(64)
      return await ctx.reply("commands.trade.has_been_traded", {
        t: `<t:${(ctx.db.user.trade_time.getTime() / 1000).toFixed(0)}:R>`
      })
    }
    if(ctx.args[2] === "buy") {
      const user = await SabineUser.fetch(ctx.args[3])
      const player = client.players.get(ctx.args[4])
      if(!user || !player) return
      const i = user.reserve_players.findIndex(p => p === ctx.args[4])
      if(i === -1 || i === undefined) return
      if(ctx.db.user.coins < BigInt(ctx.args[5])) {
        return await ctx.edit("commands.trade.missing_coins", {
          coins: (BigInt(ctx.args[5]) - ctx.db.user.coins).toLocaleString(),
          user: `<@${ctx.interaction.user.mention}>`          
        })
      }
      user.reserve_players.splice(i, 1)
      user.coins += BigInt(ctx.args[5])
      user.trade_time = new Date(Date.now() + (60 * 60 * 1000))
      ctx.db.user.reserve_players.push(ctx.args[4])
      ctx.db.user.coins -= BigInt(ctx.args[5])
      ctx.db.user.trade_time = new Date(Date.now() + (60 * 60 * 1000))
      await client.prisma.transaction.createMany({
        data: [
          {
            type: "TRADE_PLAYER",
            player: player.id,
            price: BigInt(ctx.args[5]),
            userId: ctx.db.user.id,
            to: user.id
          },
          {
            type: "TRADE_PLAYER",
            player: player.id,
            price: BigInt(ctx.args[5]),
            userId: user.id,
            to: ctx.db.user.id
          }
        ]
      })
      await user.save()
      await ctx.db.user.save()
      await ctx.edit("commands.trade.res", {
        player: `${player.name} (${player.ovr})`,
        collection: player.collection,
        user: ctx.interaction.user.mention,
        coins: BigInt(ctx.args[5]).toLocaleString()
      })
    }
    else {
      await ctx.edit("commands.trade.cancelled")
    }
  }
})