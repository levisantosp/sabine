import {
    $Enums,
    type Event,
    type Guild,
    type LiveMessage,
    type Premium,
    PrismaClient,
    type TBDMatch,
    type User
} from '@generated'
import { PrismaPg } from '@prisma/adapter-pg'
import { app } from '../structures/app/App'
import type { Pack } from '../server/routes/util/vote'
import { valorant_agents } from '../config'

const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_URI })
export const prisma = new PrismaClient({ adapter })

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

type ArenaLineup = {
    player: string
    agent: {
        name: string
        role: typeof valorant_agents[number]['role']
    }
}

type ArenaMetadata = {
    map: string
    lineup: ArenaLineup[]
}

export class SabineUser implements User {
    public id: string
    public created_at: Date = new Date()
    public correct_predictions: number = 0
    public incorrect_predictions: number = 0
    public lang: $Enums.Language = 'en'
    public premium: Premium | null = null
    public active_players: string[] = []
    public reserve_players: string[] = []
    public coins: bigint = 0n
    public team_name: string | null = null
    public team_tag: string | null = null
    public arena_wins: number = 0
    public ranked_wins: number = 0
    public unranked_wins: number = 0
    public swiftplay_wins: number = 0
    public ranked_swiftplay_wins: number = 0
    public arena_defeats: number = 0
    public ranked_defeats: number = 0
    public unranked_defeats: number = 0
    public swiftplay_defeats: number = 0
    public ranked_swiftplay_defeats: number = 0
    public arena_metadata: ArenaMetadata | null = null
    public daily_time: Date | null = null
    public claim_time: Date | null = null
    public warn: boolean = false
    public pity: number = 0
    public claims: number = 0
    public fates: number = 0
    public rank_rating: number = 50
    public remind: boolean | null = null
    public remind_in: string | null = null
    public reminded: boolean = true
    public warned: boolean | null = null
    public iron_packs: number = 0
    public bronze_packs: number = 0
    public silver_packs: number = 0
    public gold_packs: number = 0
    public platinum_packs: number = 0
    public diamond_packs: number = 0
    public ascendant_packs: number = 0
    public immortal_packs: number = 0
    public radiant_packs: number = 0
    public last_vote: Date | null = null
    public vote_streak: number = 0

    public constructor(id: string) {
        this.id = id
    }

    public async save() {
        const data: Partial<User> = {}

        for(const key in this) {
            if(
                typeof this[key] === 'function' ||
                key === 'id' ||
                this[key] === null ||
                this[key] === 'premium'
            ) continue

            (data as any)[key] = this[key]
        }

        const { premium, ...cleanData } = data as any

        if(premium) {
            return await prisma.user.upsert({
                where: { id: this.id },
                update: cleanData,
                create: { id: this.id, ...cleanData }
            })
        }

        else {
            return await prisma.user.upsert({
                where: { id: this.id },
                update: cleanData,
                create: { id: this.id, ...cleanData }
            })
        }
    }

    public static async fetch(id: string) {
        const data = await prisma.user.findUnique({
            where: { id },
            include: {
                premium: true
            }
        })

        if(!data) return data

        let user = new SabineUser(data.id)

        user = Object.assign(user, data)

        return user
    }

    public async addPrediction(game: 'valorant' | 'lol', prediction: Prediction) {
        await prisma.prediction.create({
            data: {
                ...prediction,
                game,
                userId: this.id,
                teams: {
                    create: prediction.teams
                }
            }
        })

        return this
    }

    public async addCorrectPrediction(game: 'valorant' | 'lol', predictionId: string) {
        const pred = await prisma.prediction.findFirst({
            where: {
                match: predictionId,
                game,
                userId: this.id
            }
        })

        if(!pred) return this

        this.correct_predictions += 1

        await prisma.prediction.update({
            where: {
                match: predictionId,
                game,
                userId: this.id,
                id: pred.id
            },
            data: {
                status: 'correct'
            }
        })

        await this.save()

        return this
    }

    public async addIncorrectPrediction(game: 'valorant' | 'lol', predictionId: string) {
        const pred = await prisma.prediction.findFirst({
            where: {
                match: predictionId,
                game,
                userId: this.id
            }
        })

        if(!pred) return this

        await prisma.$transaction([
            prisma.prediction.update({
                where: {
                    match: predictionId,
                    game,
                    userId: this.id,
                    id: pred.id
                },
                data: {
                    status: 'wrong'
                }
            }),
            prisma.user.update({
                where: { id: this.id },
                data: {
                    incorrect_predictions: { increment: 1 }
                }
            })
        ])

        return this
    }

    public async addPlayerToRoster(player: string, method: 'CLAIM_PLAYER_BY_CLAIM_COMMAND' | 'CLAIM_PLAYER_BY_COMMAND' = 'CLAIM_PLAYER_BY_CLAIM_COMMAND', channel?: string) {
        this.reserve_players.push(player)

        if(method === 'CLAIM_PLAYER_BY_CLAIM_COMMAND') {
            if(this.premium) {
                this.claim_time = new Date(Date.now() + 5 * 60 * 1000)
            }
            else this.claim_time = new Date(Date.now() + 10 * 60 * 1000)

            this.claims += 1
            this.reminded = false
            this.pity += 1
            this.claims += 1

            if(channel) {
                this.remind_in = channel

                if(this.remind) {
                    await app.queue.add('reminder', {
                        channel: this.remind_in,
                        user: this.id
                    }, {
                        delay: this.claim_time.getTime() - Date.now(),
                        removeOnComplete: true,
                        removeOnFail: true
                    })
                }
            }

            if(app.players.get(player)!.ovr >= 85) {
                this.pity = 0
            }
        }

        await prisma.transaction.create({
            data: {
                type: method,
                player: Number(player),
                userId: this.id
            }
        })

        await this.save()

        return this
    }

    public async addPlayersToRoster(players: string[]) {
        this.reserve_players.push(...players)

        await Promise.all([
            this.save(),
            prisma.transaction.createMany({
                data: players.map(p => ({
                    type: 'CLAIM_PLAYER_BY_PACK',
                    player: Number(p),
                    userId: this.id
                }))
            })
        ])

        return this
    }

    public async sellPlayer(id: string, price: bigint, i: number) {
        this.reserve_players.splice(i, 1)
        this.coins += price

        await prisma.transaction.create({
            data: {
                type: 'SELL_PLAYER',
                player: Number(id),
                price,
                userId: this.id
            }
        })

        if(
            this.arena_metadata?.lineup
                .some(line => line.player === id)
        ) {
            const index = this.arena_metadata.lineup
                .findIndex(line => line.player === id)

            this.arena_metadata.lineup.splice(index, 1)
        }

        await this.save()

        return this
    }

    public async addPack(pack: Pack, increaseVoteStreak?: boolean) {
        switch(pack) {
            case 'IRON': {
                this.iron_packs += 1
            }
                break
            case 'BRONZE': {
                this.bronze_packs += 1
            }
                break
            case 'SILVER': {
                this.silver_packs += 1
            }
                break
            case 'GOLD': {
                this.gold_packs += 1
            }
                break
            case 'PLATINUM': {
                this.platinum_packs += 1
            }
                break
            case 'DIAMOND': {
                this.diamond_packs += 1
            }
                break
            case 'ASCENDANT': {
                this.ascendant_packs += 1
            }
                break
            case 'IMMORTAL': {
                this.immortal_packs += 1
            }
                break
            case 'RADIANT': {
                this.radiant_packs += 1
            }
        }

        if(increaseVoteStreak) {
            this.vote_streak += 1
            this.last_vote = new Date()
        }

        await prisma.transaction.create({
            data: {
                userId: this.id,
                type: 'CLAIM_PACK_BY_VOTE',
                pack
            }
        })

        await this.save()

        return this
    }
}

export class SabineGuild implements Guild {
    public id: string
    public lang: $Enums.Language = 'en'
    public tbd_matches: TBDMatch[] = []
    public guildKeyId: string | null = null
    public events: Event[] = []
    public live_messages: LiveMessage[] = []
    public valorant_resend_time: Date | null = null
    public valorant_matches: string[] = []
    public valorant_news_channel: string | null = null
    public valorant_live_feed_channel: string | null = null
    public lol_resend_time: Date | null = null
    public lol_matches: string[] = []
    public lol_news_channel: string | null = null
    public lol_live_feed_channel: string | null = null
    public tournaments_length: number = 5
    public partner: boolean | null = null
    public invite: string | null = null

    public constructor(id: string) {
        this.id = id
    }

    public async save() {
        const data: Partial<Guild> = {}

        for(const key in this) {
            if(
                typeof this[key] === 'function' ||
                key === 'id' ||
                this[key] === null
            ) continue

            if(
                ['tbd_matches', 'events', 'live_messages']
                    .includes(key)
            ) {
                (data as any)[key] = {
                    [key]: Array.isArray(this[key]) &&
                        this[key].length ?
                        {
                            create: this[key]
                        } :
                        undefined
                }
            }

            else(data as any)[key] = this[key]
        }

        return await prisma.guild.upsert({
            where: { id: this.id },
            update: data,
            create: { id: this.id, ...data }
        })
    }

    public static async fetch(id: string) {
        const data = await prisma.guild.findUnique({ where: { id } })

        if(!data) return data

        const guild = new SabineGuild(data.id)

        return Object.assign(guild, data)
    }
}