import { calcPlayerPrice, type Player } from "players"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"
import { client } from "../../structures/client/App.ts"

const tier = (() => {
  const tier: {[key: string]: Player[]} = {
    s: [] as Player[], // ovr 85+ (0.1%)
    a: [] as Player[], // ovr 80-84 (0.9%)
    b: [] as Player[], // ovr 70-79 (14%)
    c: [] as Player[] // ovr 69- (85%)
  }

  for(const p of client.players.values()) {
    if(!p.ovr) continue
    if(p.ovr >= 85) tier.s.push(p)
    else if(p.ovr >= 80) tier.a.push(p)
    else if(p.ovr >= 70) tier.b.push(p)
    else tier.c.push(p)
  }

  return tier
})()

const getRandomPlayer = () => {
  const random = Math.random() * 100

  const pool =
    random < 0.1 ? tier.s :
      random < 1 ? tier.a :
        random < 15 ? tier.b :
          tier.c

  return pool[Math.floor(Math.random() * pool.length)]
}
const getRandomPlayerByTier = (t: string) => {
  return tier[t][Math.floor(Math.random() * tier[t].length)]
}

const date = Date.now()

export default createCommand({
  name: "claim",
  category: "economy",
  nameLocalizations: {
    "pt-BR": "obter"
  },
  description: "Claim a random player",
  descriptionLocalizations: {
    "pt-BR": "Obtenha um jogador aleatório"
  },
  userInstall: true,
  isThinking: true,
  messageComponentInteractionTime: 60 * 1000,
  cooldown: true,
  async run({ ctx, t }) {
    if(
      ctx.db.user.claim_time &&
      ctx.db.user.claim_time > new Date()
    ) {
      return await ctx.reply("commands.claim.has_been_claimed", { t: `<t:${((ctx.db.user.claim_time.getTime()) / 1000).toFixed(0)}:R>` })
    }

    if(ctx.db.user.fates <= 0) {
      return await ctx.reply("commands.claim.no_fates")
    }

    let player: Player

    if(ctx.db.user.pity >= 49) {
      player = getRandomPlayerByTier("s")
    }

    else player = getRandomPlayer()

    let channel: string | undefined = undefined

    if(ctx.interaction.channel && ctx.db.user.remind) {
      channel = ctx.interaction.channel?.id
    }

    await ctx.db.user.addPlayerToRoster(player.id.toString(), "CLAIM_PLAYER_BY_CLAIM_COMMAND", channel)
    
    const embed = new EmbedBuilder()
    .setTitle(player.name)
    .setDesc(
      t(
        "commands.claim.claimed",
        {
          player: player.name,
          price: calcPlayerPrice(player)
        }
      )
    )
    .setImage(`${process.env.CDN_URL}/cards/${player.id}.png?ts=${date}`)

    await ctx.reply(embed.build({
      components: [
        {
          type: 1,
          components: [
            new ButtonBuilder()
            .setStyle("green")
            .setLabel(t("commands.claim.promote"))
            .setCustomId(`claim;${ctx.interaction.user.id};promote;${player.id}`),
            new ButtonBuilder()
            .setStyle("red")
            .setLabel(t("commands.claim.sell"))
            .setCustomId(`claim;${ctx.interaction.user.id};sell;${player.id}`)
          ]
        }
      ]
    }))
  },
  async createMessageComponentInteraction({ ctx }) {
    ctx.setFlags(64)

    if(!ctx.db.user.reserve_players.includes(ctx.args[3])) {
      return await ctx.reply("commands.sell.player_not_found")
    }

    const i = ctx.db.user.reserve_players.findIndex(p => p === ctx.args[3])

    if(ctx.args[2] === "promote") {
      if(ctx.db.user.active_players.length >= 5 ) {
        ctx.db.user.reserve_players.push(ctx.db.user.active_players.at(-1)!)
        ctx.db.user.active_players.splice(-1, 1)
      }

      ctx.db.user.active_players.push(ctx.args[3])
      ctx.db.user.reserve_players.splice(i, 1)

      await ctx.db.user.save()

      await ctx.reply("commands.promote.player_promoted", { p: client.players.get(ctx.args[3])?.name })
    }
    else if(ctx.args[2] === "sell") {
      const player = client.players.get(ctx.args[3])

      if(!player) {
        return await ctx.reply("commands.sell.player_not_found")
      }

      await ctx.db.user.sellPlayer(player.id.toString(), BigInt(calcPlayerPrice(player)), i)

      await ctx.reply("commands.sell.sold", { p: player.name, price: player.price.toLocaleString() })
    }
  }
})