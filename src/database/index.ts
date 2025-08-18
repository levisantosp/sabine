import { $Enums, type guilds, Prisma, PrismaClient, type users } from "@prisma/client"
import { calcPlayerOvr, getPlayer } from "players"

const prisma = new PrismaClient()
type PredictionTeam = {
  name: string
  score: string,
  winner: boolean
}
type Prediction = {
  match: string
  teams: PredictionTeam[]
  status: "pending" | "correct" | "wrong"
  bet: bigint | null
  odd: bigint | null
}
export class SabineUser implements users {
  public id: string
  public correct_predictions: number = 0
  public wrong_predictions: number = 0
  public lang: $Enums.Language = "en"
  public plan: { type: $Enums.PremiumType; expiresAt: number; } | null = null
  public warned: boolean | null = null
  public roster: { active: string[]; reserve: string[]; } | null = { active: [], reserve: [] }
  public coins: bigint = 0n
  public team: { name: string | null; tag: string | null; } | null = null
  public ranked_wins: number = 0
  public unranked_wins: number = 0
  public swiftplay_wins: number = 0
  public ranked_swiftplay_wins: number = 0
  public ranked_defeats: number = 0
  public unranked_defeats: number = 0
  public swiftplay_defeats: number = 0
  public ranked_swiftplay_defeats: number = 0
  public daily_time: Date | null = null
  public claim_time: Date | null = null
  public warn: boolean = true
  public pity: number = 0
  public claims: number = 0
  public rank_rating: number = 0
  public fates: number = 0
  public elo: number = 0
  public elo_rating: number = 50
  public remind: boolean = false
  public remindIn: string | null = null
  public reminded: boolean = true
  public packets: $Enums.Packet[] = []
  public trade_time: Date | null = null
  public constructor(id: string) {
    this.id = id
    if(!this.roster) {
      this.roster = { active: [], reserve: [] }
    }
  }
  private async fetch(id: string) {
    const data = await prisma.users.findUnique({ where: { id } })
    if(!data) return data
    let user = new SabineUser(data.id)
    user = Object.assign(user, data)
    if(!user.roster) {
      user.roster = {
        active: [],
        reserve: []
      }
    }
    return user
  }
  public async save() {
    const data: Partial<users> = {}
    for(const key in this) {
      if(typeof this[key] === "function" || key === "id") continue
      (data as any)[key] = this[key]
    }
    return await prisma.users.upsert({
      where: { id: this.id },
      update: data,
      create: { id: this.id, ...data } as Prisma.usersCreateInput
    })
  }
  public static async fetch(id: string) {
    const data = await prisma.users.findUnique({ where: { id } })
    if(!data) return data
    let user = new SabineUser(data.id)
    user = Object.assign(user, data)
    if(!user.roster) {
      user.roster = {
        active: [],
        reserve: []
      }
    }
    return user
  }
  public async addPrediction(game: "valorant" | "lol", prediction: Prediction) {
    const user = await this.fetch(this.id) ?? this
    await prisma.predictions.create({
      data: {
        ...prediction,
        game,
        userId: user.id
      }
    })
    return user
  }
  public async addCorrectPrediction(game: "valorant" | "lol", predictionId: string) {
    const user = await this.fetch(this.id) ?? this
    const pred = await prisma.predictions.findFirst({
      where: {
        match: predictionId,
        game,
        userId: user.id
      }
    })
    if(!pred) return user
    user.correct_predictions += 1
    await prisma.predictions.update({
      where: {
        match: predictionId,
        game,
        userId: user.id,
        id: pred.id
      },
      data: {
        status: "correct"
      }
    })
    await user.save()
    return user
  }
  public async addWrongPrediction(game: "valorant" | "lol", predictionId: string) {
    const user = await this.fetch(this.id) ?? this
    const pred = await prisma.predictions.findFirst({
      where: {
        match: predictionId,
        game,
        userId: user.id
      }
    })
    if(!pred) return user
    user.wrong_predictions += 1
    await prisma.predictions.update({
      where: {
        match: predictionId,
        game,
        userId: user.id,
        id: pred.id
      },
      data: {
        status: "wrong"
      }
    })
    await user.save()
    return user
  }
  public async addPlayerToRoster(player: string, method: "CLAIM_PLAYER_BY_CLAIM_COMMAND" | "CLAIM_PLAYER_BY_COMMAND" = "CLAIM_PLAYER_BY_CLAIM_COMMAND", channel?: string) {
    const user = await this.fetch(this.id) ?? this
    user.roster!.reserve.push(player)
    if(method === "CLAIM_PLAYER_BY_CLAIM_COMMAND") {
      user.claim_time = new Date(Date.now() + 600000)
    }
    user.pity += 1
    await prisma.transactions.create({
      data: {
        type: method,
        player,
        userId: this.id
      }
    })
    user.claims += 1
    user.reminded = false
    if(channel) {
      user.remindIn = channel
    }
    if(calcPlayerOvr(getPlayer(Number(player))!) >= 85) {
      user.pity = 0
    }
    await user.save()
    return user
  }
  public async sellPlayer(id: string, price: bigint, i: number) {
    const user = await this.fetch(this.id) ?? this
    user.roster!.reserve.splice(i, 1)
    user.coins += price
    await prisma.transactions.create({
      data: {
        type: "SELL_PLAYER",
        player: id,
        price,
        userId: this.id
      }
    })
    await user.save()
    return user
  }
}
export class SabineGuild implements guilds {
  public id: string
  public lang: $Enums.Language = "en"
  public valorant_events: { name: string; channel1: string; channel2: string; }[] = []
  public valorant_resend_time: Date | null = null
  public valorant_matches: string[] = []
  public valorant_tbd_matches: { id: string; channel: string; }[] = []
  public valorant_news_channel: string | null = null
  public valorant_livefeed_channel: string | null = null
  public valorant_live_matches: ({ currentMap: string | null; score1: string | null; score2: string | null; id: string; url: string | null; stage: string | null; } & { teams: { name: string; score: string; }[]; tournament: { name: string; full_name: string | null; image: string | null; }; })[] = []
  public lol_events: { name: string; channel1: string; channel2: string; }[] = []
  public lol_resend_time: Date | null = null
  public lol_matches: string[] = []
  public lol_tbd_matches: { id: string; channel: string; }[] = []
  public lol_news_channel: string | null = null
  public lol_livefeed_channel: string | null = null
  public lol_live_matches: ({ currentMap: string | null; score1: string | null; score2: string | null; id: string; url: string | null; stage: string | null; } & { teams: { name: string; score: string; }[]; tournament: { name: string; full_name: string | null; image: string | null; }; })[] = []
  public key: { type: $Enums.KeyType; expiresAt: Date | null; id: string; } | null = null
  public tournamentsLength: number = 5
  public partner: boolean | null = null
  public invite: string | null = null
  public constructor(id: string) {
    this.id = id
  }
  public async save() {
    const data: Partial<guilds> = {}
    for(const key in this) {
      if(typeof this[key] === "function" || key === "id") continue
      (data as any)[key] = this[key]
    }
    return await prisma.guilds.upsert({
      where: { id: this.id },
      update: data,
      create: { id: this.id, ...data } as Prisma.guildsCreateInput
    })
  }
  public static async fetch(id: string) {
    const data = await prisma.guilds.findUnique({ where: { id } })
    if(!data) return data
    const guild = new SabineGuild(data.id)
    return Object.assign(guild, data)
  }
}