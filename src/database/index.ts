import * as Oceanic from 'oceanic.js'
import EmbedBuilder from '../structures/builders/EmbedBuilder.ts'
import { client } from '../structures/client/App.ts'
import { $Enums, type guilds, Prisma, PrismaClient, type users } from '@prisma/client'
import { calcPlayerOvr, getPlayer } from 'players'

const prisma = new PrismaClient()
type PredictionTeam = {
  name: string
  score: string,
  winner: boolean
}
type Prediction = {
  match: string
  teams: PredictionTeam[]
  status: 'pending' | 'correct' | 'wrong'
  bet: bigint | null
  odd: number | null
}
export class SabineUser implements users {
  public id: string
  public valorant_predictions: ({ match: string; status: $Enums.PredictionStatus; bet: bigint | null; odd: number | null; when: number; } & { teams: { name: string; score: string; winner: boolean | null; }[]; })[] = []
  public lol_predictions: ({ match: string; status: $Enums.PredictionStatus; bet: bigint | null; odd: number | null; when: number; } & { teams: { name: string; score: string; winner: boolean | null; }[]; })[] = []
  public correct_predictions: number = 0
  public wrong_predictions: number = 0
  public lang: $Enums.Language = 'en'
  public plan: { type: $Enums.PremiumType; expiresAt: number; } | null = null
  public warned: boolean | null = null
  public roster: { active: string[]; reserve: string[]; } | null = { active: [], reserve: [] }
  public coins: bigint = 0n
  public team: { name: string | null; tag: string | null; } | null = null
  public carrer: { teams: { user: string; score: number; }[]; }[] = []
  public wins: number = 0
  public defeats: number = 0
  public daily_time: number = 0
  public claim_time: number = 0
  public warn: boolean = true
  public pity: number = 0
  public claims: number = 0
  public rank_rating: number = 0
  public fates: number = 0
  public transactions: { type: $Enums.TransactionType; player: string; when: number; price: bigint | null; user: string | null; }[] = []
  public elo: $Enums.Elo = 'UNRANKED'
  public elo_rating: number = 50
  public remind: boolean = false
  public remindIn: string | null = null
  public reminded: boolean = true
  public packets: $Enums.Packet[] = []
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
    return Object.assign(user, data)
  }
  public async save() {
    const data: Partial<users> = {}
    for(const key in this) {
      if(typeof this[key] === 'function' || key === 'id') continue
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
  public async addPrediction(game: 'valorant' | 'lol', prediction: Prediction) {
    const user = await this.fetch(this.id) ?? this
    if(game === 'valorant') {
      user.valorant_predictions.push(
        {
          ...prediction,
          when: Date.now()
        }
      )
      await user.save()
      return user
    }
    if(game === 'lol') {
      this.lol_predictions.push(
        {
          ...prediction,
          when: Date.now()
        }
      )
      await this.save()
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(this.id)
      const embed = new EmbedBuilder()
        .setTitle('New register')
        .setDesc(`User: ${u?.mention} (${this.id})`)
        .setFields(
          {
            name: 'NEW_PREDICTION',
            value: `\`\`\`js\n${JSON.stringify(prediction, null, 2)}\`\`\``
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + ' Logger')[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + ' Logger' })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
      return user
    }
  }
  public async addCorrectPrediction(game: 'valorant' | 'lol', predictionId: string) {
    const user = await this.fetch(this.id) ?? this
    if(game === 'valorant') {
      const index = user.valorant_predictions.findIndex(p => p.match === predictionId)
      user.valorant_predictions[index].status = 'correct'
      user.correct_predictions += 1
      await user.save()
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(user.id)
      const embed = new EmbedBuilder()
        .setTitle('New register')
        .setDesc(`User: ${u?.mention} (${user.id})`)
        .setFields(
          {
            name: 'CORRECT_PREDICTION',
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + ' Logger')[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + ' Logger' })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    else {
      const index = user.lol_predictions.findIndex(p => p.match === predictionId)
      user.lol_predictions[index].status = 'correct'
      user.correct_predictions += 1
      await user.save()
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(user.id)
      const embed = new EmbedBuilder()
        .setTitle('New register')
        .setDesc(`User: ${u?.mention} (${user.id})`)
        .setFields(
          {
            name: 'CORRECT_PREDICTION',
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + ' Logger')[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + ' Logger' })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    return user
  }
  public async addWrongPrediction(game: 'valorant' | 'lol', predictionId: string) {
    const user = await this.fetch(this.id) ?? this
    if(game === 'valorant') {
      const index = user.valorant_predictions.findIndex(p => p.match === predictionId)
      user.valorant_predictions[index].status = 'wrong'
      user.wrong_predictions += 1
      await user.save()
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(user.id)
      const embed = new EmbedBuilder()
        .setTitle('New register')
        .setDesc(`User: ${u?.mention} (${user.id})`)
        .setFields(
          {
            name: 'WRONG_PREDICTION',
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + ' Logger')[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + ' Logger' })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    else {
      const index = user.lol_predictions.findIndex(p => p.match === predictionId)
      user.lol_predictions[index].status = 'wrong'
      user.wrong_predictions += 1
      await user.save()
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(user.id)
      const embed = new EmbedBuilder()
        .setTitle('New register')
        .setDesc(`User: ${u?.mention} (${user.id})`)
        .setFields(
          {
            name: 'WRONG_PREDICTION',
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + ' Logger')[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + ' Logger' })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    return user
  }
  public async addPlayerToRoster(player: string, method: 'CLAIM_PLAYER_BY_CLAIM_COMMAND' | 'CLAIM_PLAYER_BY_COMMAND' = 'CLAIM_PLAYER_BY_CLAIM_COMMAND', channel?: string) {
    const user = await this.fetch(this.id) ?? this
    user.roster!.reserve.push(player)
    if(method === 'CLAIM_PLAYER_BY_CLAIM_COMMAND') {
      user.claim_time = Date.now() + 600000
    }
    user.pity += 1
    user.transactions.push({
      type: method,
      player,
      when: Date.now(),
      price: null,
      user: null
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
    user.transactions.push({
      type: 'SELL_PLAYER',
      player: id,
      when: Date.now(),
      price,
      user: null
    })
    await user.save()
    return user
  }
}
export class SabineGuild implements guilds {
  public id: string
  public lang: $Enums.Language = 'en'
  public valorant_events: { name: string; channel1: string; channel2: string; }[] = []
  public valorant_resend_time: number = 0
  public valorant_matches: string[] = []
  public valorant_tbd_matches: { id: string; channel: string; }[] = []
  public valorant_news_channel: string | null = null
  public valorant_livefeed_channel: string | null = null
  public valorant_live_matches: ({ currentMap: string | null; score1: string | null; score2: string | null; id: string; url: string | null; stage: string | null; } & { teams: { name: string; score: string; }[]; tournament: { name: string; full_name: string | null; image: string | null; }; })[] = []
  public lol_events: { name: string; channel1: string; channel2: string; }[] = []
  public lol_resend_time: number = 0
  public lol_matches: string[] = []
  public lol_tbd_matches: { id: string; channel: string; }[] = []
  public lol_news_channel: string | null = null
  public lol_livefeed_channel: string | null = null
  public lol_live_matches: ({ currentMap: string | null; score1: string | null; score2: string | null; id: string; url: string | null; stage: string | null; } & { teams: { name: string; score: string; }[]; tournament: { name: string; full_name: string | null; image: string | null; }; })[] = []
  public key: { type: $Enums.KeyType; expiresAt: number | null; id: string; } | null = null
  public tournamentsLength: number = 5
  public partner: boolean | null = null
  public invite: string | null = null
  public constructor(id: string) {
    this.id = id
  }
  public async save() {
    const data: Partial<guilds> = {}
    for(const key in this) {
      if(typeof this[key] === 'function' || key === 'id') continue
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