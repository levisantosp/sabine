import getPlayers from "../../simulator/valorant/players/getPlayers.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"
import createCommand from "../../structures/command/createCommand.js"

type Player = {
  id: number
  name: string
  collection: string
  team: string
  country: string
  role: string
  KD: number
  ACS: number
  ADR: number
  FK: number
  FD: number
  KAST: number
  ovr?: number
  price?: number
}
const calcPlayerOvr = (player: Player) => {
  const KD = (player.KD / 1) * 20
  const ACS = (player.ACS / 300) * 30
  const ADR = (player.ADR / 200) * 20
  const FK = (player.FK / 20) * 10
  const FD = (player.FD / 20) * 5
  const KAST = (player.KAST / 100) * 15
  return KD + ACS + ADR + FK + FD + KAST
}
const getRandomPlayerByOvr = (players: Player[]) => {
  let tier = {
    s: [] as Player[], // ovr 95-100 (0.1%)
    a: [] as Player[], // ovr 90-94 (0.9%)
    b: [] as Player[], // ovr 80-89 (4%)
    c: [] as Player[], // ovr 70-79 (25%)
    d: [] as Player[] // ovr 60-69 (70%)
  }
  for(const p of players) {
    const ovr = calcPlayerOvr(p)
    if(ovr >= 95) tier.s.push(p)
    else if(ovr >= 90) tier.a.push(p)
    else if(ovr >= 80) tier.b.push(p)
    else if(ovr >= 70) tier.c.push(p)
    else if(ovr >= 60) tier.d.push(p)
  }
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
  category: "valorant",
  nameLocalizations: {
    "pt-BR": "obter"
  },
  description: "Claim a random player",
  descriptionLocalizations: {
    "pt-BR": "Obtenha um jogador aleatório"
  },
  async run({ ctx, locale }) {
    const players = getPlayers() as Player[]
    let player = getRandomPlayerByOvr(players)
    let ovr = calcPlayerOvr(player)
    let price = parseInt((ovr * 1500).toString())
    player = {
      ...player,
      ovr: parseInt(ovr.toString()),
      price
    }
    const embed = new EmbedBuilder()
    .setDesc(
      locale(
        "commands.claim.claimed",
        {
          player: player.name,
          price: price.toLocaleString("en-US")
        }
      )
    )
    ctx.reply(embed.build())
  }
})