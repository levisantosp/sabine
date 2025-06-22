import getPlayers from "../../simulator/valorant/players/getPlayers.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"
import createCommand from "../../structures/command/createCommand.js"
import calcPlayerPrice from "../../structures/util/calcPlayerPrice.js"

type Player = {
  id: number
  name: string
  collection: string
  team: string
  country: string
  role: string
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
  ovr?: number
  price?: number
}
const calcPlayerOvr = (player: Player) => {
  return (player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) / 4.5
}

const players = getPlayers()

const tier = (() => {
  let tier = {
    s: [] as Player[], // ovr 95+ (0.1%)
    a: [] as Player[], // ovr 90-94 (0.9%)
    b: [] as Player[], // ovr 80-89 (4%)
    c: [] as Player[], // ovr 70-79 (25%)
    d: [] as Player[] // ovr 59-69 (70%)
  }
  for(const p of players) {
    const ovr = calcPlayerOvr(p)
    if(ovr >= 95) tier.s.push(p)
    else if(ovr >= 90) tier.a.push(p)
    else if(ovr >= 80) tier.b.push(p)
    else if(ovr >= 70) tier.c.push(p)
    else if(ovr >= 59) tier.d.push(p)
  }
  return tier
})()

const getRandomPlayerByOvr = (players: Player[]) => {
  let random = Math.random() * 100
  if(random < 0.1) {
    random = Math.floor(Math.random() * tier.s.length)
    return tier.s[random]
  }
  else if(random < 1) {
    random = Math.floor(Math.random() * tier.a.length)
    return tier.a[random]
  }
  else if(random < 5) {
    random = Math.floor(Math.random() * tier.b.length)
    return tier.b[random]
  }
  else if(random < 30) {
    random = Math.floor(Math.random() * tier.c.length)
    return tier.c[random]
  }
  else {
    random = Math.floor(Math.random() * tier.d.length)
    return tier.d[random]
  }
}

export default createCommand({
  name: "claim",
  category: "simulator",
  nameLocalizations: {
    "pt-BR": "obter"
  },
  description: "Claim a random player",
  descriptionLocalizations: {
    "pt-BR": "Obtenha um jogador aleatório"
  },
  async run({ ctx, locale }) {
    if(ctx.db.user.claim_time > Date.now()) {
      return await ctx.reply("commands.claim.has_been_claimed", { t: `<t:${((ctx.db.user.claim_time) / 1000).toFixed(0)}:R>` })
    }
    let player = getRandomPlayerByOvr(players)
    let ovr = calcPlayerOvr(player)
    let price = calcPlayerPrice(player)
    player = {
      ...player,
      ovr: parseInt(ovr.toString()),
      price
    }
    await ctx.db.user.addPlayerToRoster(player.id.toString())
    const embed = new EmbedBuilder()
    .setTitle(player.name)
    .setDesc(
      locale(
        "commands.claim.claimed",
        {
          player: player.name,
          price: price.toLocaleString("en-US")
        }
      )
    )
    .setImage(`${process.env.CDN_URL}/cards/${player.id}.png`)
    await ctx.reply(embed.build())
  }
})