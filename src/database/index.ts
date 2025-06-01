import mongoose from "mongoose"
import { TextChannel } from "oceanic.js"
import { LiveFeed } from "../../types/index.js"
import { client } from "../index.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"

const UserSchema = mongoose.model("users", new mongoose.Schema(
        {
                _id: String,
                valorant_predictions: {
                        type: Array,
                        default: []
                },
                lol_predictions: {
                        type: Array,
                        default: []
                },
                wrong_predictions: {
                        type: Number,
                        default: 0
                },
                correct_predictions: {
                        type: Number,
                        default: 0
                },
                lang: String,
                plans: {
                        type: Array,
                        default: []
                },
                warned: Boolean,
                plan: Object
        }
))
export class User extends UserSchema {
        public async get(id: string | undefined | null) {
                return await UserSchema.findById(id) as UserSchemaInterface
        }
        public async addPremium(by: "ADD_PREMIUM_BY_COMMAND" | "BUY_PREMIUM") {
                const keys = await Key.find() as KeySchemaInterface[]
                let keyId: string
                do {
                        keyId = ""
                        const pattern = "@@@@-####-@@##-&&&&"
                        const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                        const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz"
                        const digits = "0123456789"
                        for(const char of pattern) {
                                if(char === "@") {
                                        keyId += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length))
                                }
                                else if(char === "#") {
                                        keyId += digits.charAt(Math.floor(Math.random() * digits.length))
                                }
                                else if(char === "&") {
                                        keyId += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length))
                                }
                                else {
                                        keyId += char
                                }
                        }
                }
                while (keys.some(key => key.id === keyId))
                let expiresAt = !this.plans.at(-1) ? Date.now() + 2592000000 : Date.now() + ((this.plans.length + 1) * 2592000000)
                await new Key(
                        {
                                _id: keyId,
                                type: "PREMIUM",
                                user: this.id,
                                active: false,
                                activeIn: [],
                                expiresAt,
                                canBeActivated: expiresAt - 2592000000
                        }
                ).save()
                this.plans.push({
                        type: "PREMIUM",
                        expiresAt
                })
                this.warned = false
                await this.save()
                const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                const user = client.users.get(this.id)
                const embed = new EmbedBuilder()
                        .setTitle("New register")
                        .setDesc(`User: ${user?.mention} (${this.id})`)
                        .setFields(
                                {
                                        name: by,
                                        value: "PREMIUM"
                                }
                        )
                const webhooks = await channel.getWebhooks()
                let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                webhook.execute({
                        avatarURL: client.user.avatarURL(),
                        embeds: [embed]
                })
                return keyId
        }
        public async removePremium(by: "REMOVE_PREMIUM_BY_AUTO" | "REMOVE_PREMIUM_BY_COMMAND") {
                this.plans.shift()
                await this.save()
                const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                const user = client.users.get(this.id)
                const embed = new EmbedBuilder()
                        .setTitle("New register")
                        .setDesc(`User: ${user?.mention} (${this.id})`)
                        .setFields(
                                {
                                        name: by,
                                        value: "PREMIUM"
                                }
                        )
                const webhooks = await channel.getWebhooks()
                let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                webhook.execute({
                        avatarURL: client.user.avatarURL(),
                        embeds: [embed]
                })
                return this as UserSchemaInterface
        }
        public async add_prediction(game: "valorant" | "lol", prediction: UserSchemaPrediction) {
                if(game === "valorant") {
                        this.valorant_predictions.push(prediction)
                        await this.save()
                        const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                        const user = client.users.get(this.id)
                        const embed = new EmbedBuilder()
                                .setTitle("New register")
                                .setDesc(`User: ${user?.mention} (${this.id})`)
                                .setFields(
                                        {
                                                name: "NEW_PREDICTION",
                                                value: `\`\`\`js\n${JSON.stringify(prediction, null, 2)}\`\`\``
                                        }
                                )
                        const webhooks = await channel.getWebhooks()
                        let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                        if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                        webhook.execute({
                                avatarURL: client.user.avatarURL(),
                                embeds: [embed]
                        })
                        return this as UserSchemaInterface
                }
                if(game === "lol") {
                        this.lol_predictions.push(prediction)
                        await this.save()
                        const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                        const user = client.users.get(this.id)
                        const embed = new EmbedBuilder()
                                .setTitle("New register")
                                .setDesc(`User: ${user?.mention} (${this.id})`)
                                .setFields(
                                        {
                                                name: "NEW_PREDICTION",
                                                value: `\`\`\`js\n${JSON.stringify(prediction, null, 2)}\`\`\``
                                        }
                                )
                        const webhooks = await channel.getWebhooks()
                        let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                        if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                        webhook.execute({
                                avatarURL: client.user.avatarURL(),
                                embeds: [embed]
                        })
                        return this as UserSchemaInterface
                }
        }
        public async add_correct_prediction(game: "valorant" | "lol", predictionId: string) {
                if(game === "valorant") {
                        let index = this.valorant_predictions.findIndex(p => p.match === predictionId)
                        this.valorant_predictions[index].status = "correct"
                        await this.updateOne({
                                $inc: { correct_predictions: 1 },
                                $set: { valorant_predictions: this.valorant_predictions }
                        })
                        const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                        const user = client.users.get(this.id)
                        const embed = new EmbedBuilder()
                                .setTitle("New register")
                                .setDesc(`User: ${user?.mention} (${this.id})`)
                                .setFields(
                                        {
                                                name: "CORRECT_PREDICTION",
                                                value: predictionId
                                        }
                                )
                        const webhooks = await channel.getWebhooks()
                        let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                        if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                        webhook.execute({
                                avatarURL: client.user.avatarURL(),
                                embeds: [embed]
                        })
                }
                else {
                        let index = this.lol_predictions.findIndex(p => p.match === predictionId)
                        this.lol_predictions[index].status = "correct"
                        await this.updateOne({
                                $inc: { correct_predictions: 1 },
                                $set: { lol_predictions: this.lol_predictions }
                        })
                        const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                        const user = client.users.get(this.id)
                        const embed = new EmbedBuilder()
                                .setTitle("New register")
                                .setDesc(`User: ${user?.mention} (${this.id})`)
                                .setFields(
                                        {
                                                name: "CORRECT_PREDICTION",
                                                value: predictionId
                                        }
                                )
                        const webhooks = await channel.getWebhooks()
                        let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                        if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                        webhook.execute({
                                avatarURL: client.user.avatarURL(),
                                embeds: [embed]
                        })
                }
                return this as UserSchemaInterface
        }
        public async add_wrong_prediction(game: "valorant" | "lol", predictionId: string) {
                if(game === "valorant") {
                        let index = this.valorant_predictions.findIndex(p => p.match === predictionId)
                        this.valorant_predictions[index].status = "wrong"
                        await this.updateOne({
                                $inc: { wrong_predictions: 1 },
                                $set: { valorant_predictions: this.valorant_predictions }
                        })
                        const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                        const user = client.users.get(this.id)
                        const embed = new EmbedBuilder()
                                .setTitle("New register")
                                .setDesc(`User: ${user?.mention} (${this.id})`)
                                .setFields(
                                        {
                                                name: "WRONG_PREDICTION",
                                                value: predictionId
                                        }
                                )
                        const webhooks = await channel.getWebhooks()
                        let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                        if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                        webhook.execute({
                                avatarURL: client.user.avatarURL(),
                                embeds: [embed]
                        })
                }
                else {
                        let index = this.lol_predictions.findIndex(p => p.match === predictionId)
                        this.lol_predictions[index].status = "wrong"
                        await this.updateOne({
                                $inc: { wrong_predictions: 1 },
                                $set: { lol_predictions: this.lol_predictions }
                        })
                        const channel = client.getChannel(process.env.USERS_LOG) as TextChannel
                        const user = client.users.get(this.id)
                        const embed = new EmbedBuilder()
                                .setTitle("New register")
                                .setDesc(`User: ${user?.mention} (${this.id})`)
                                .setFields(
                                        {
                                                name: "WRONG_PREDICTION",
                                                value: predictionId
                                        }
                                )
                        const webhooks = await channel.getWebhooks()
                        let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
                        if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
                        webhook.execute({
                                avatarURL: client.user.avatarURL(),
                                embeds: [embed]
                        })
                }
                return this as UserSchemaInterface
        }
}
export const Guild = mongoose.model("guilds", new mongoose.Schema(
        {
                _id: String,
                lang: {
                        type: String,
                        default: "en"
                },
                valorant_events: {
                        type: Array,
                        default: []
                },
                tournamentsLength: {
                        type: Number,
                        default: 5
                },
                lastResult: String,
                valorant_matches: {
                        type: Array,
                        default: []
                },
                valorant_tbd_matches: {
                        type: Array,
                        default: []
                },
                valorant_resend_time: {
                        type: Number,
                        default: 0
                },
                key: Object,
                valorant_news_channel: String,
                valorant_livefeed_channel: String,
                valorant_live_matches: {
                        type: Array,
                        default: []
                },
                lol_events: {
                        type: Array,
                        default: []
                },
                lol_last_result: String,
                lol_matches: {
                        type: Array,
                        default: []
                },
                lol_tbd_matches: {
                        type: Array,
                        default: []
                },
                lol_last_news: String,
                lol_news_channel: String,
                lol_livefeed_channel: String,
                lol_live_matches: {
                        type: Array,
                        default: []
                },
                lol_resend_time: {
                        type: Number,
                        default: 0
                },
                partner: Boolean,
                invite: String
        }
))
export const Blacklist = mongoose.model("blacklist", new mongoose.Schema(
        {
                _id: String,
                users: {
                        type: Array,
                        default: []
                },
                guilds: {
                        type: Array,
                        default: []
                }
        }
))
export const Key = mongoose.model("keys", new mongoose.Schema(
        {
                _id: String,
                expiresAt: Number,
                type: String,
                user: String,
                active: Boolean,
                activeIn: Array,
                canBeActivated: Number
        }
))
type GuildSchemaEvent = {
        name: string
        channel1: string
        channel2: string
}
type UserSchemaPredictionTeam = {
        name: string
        score: string
}
type UserSchemaPrediction = {
        match: string | number
        teams: UserSchemaPredictionTeam[]
        status?: "pending" | "correct" | "wrong"
}
type UserSchemaPremium = {
        type: "PREMIUM",
        expiresAt: number
}
type TBDMatch = {
        id: string
        channel: string
}
type GuildSchemaKey = {
        type: "BOOSTER" | "PREMIUM"
        expiresAt?: number
        id: string
}
export interface GuildSchemaInterface extends mongoose.Document {
        _id: string
        lang: "pt" | "en"
        valorant_events: GuildSchemaEvent[]
        tournamentsLength: number
        valorant_resend_time: number
        valorant_last_news?: string
        key?: GuildSchemaKey
        valorant_last_result?: string
        valorant_matches: string[]
        valorant_tbd_matches: TBDMatch[]
        valorant_news_channel?: string
        valorant_livefeed_channel?: string
        valorant_live_matches: LiveFeed[]
        lol_events: GuildSchemaEvent[]
        lol_last_result: string
        lol_matches: string[]
        lol_tbd_matches: TBDMatch[]
        lol_last_news?: string
        lol_news_channel?: string
        lol_livefeed_channel?: string
        lol_live_matches: LiveFeed[]
        lol_resend_time: number
        partner?: boolean
        invite?: string
}
export interface UserSchemaInterface extends User {
        _id: string
        valorant_predictions: UserSchemaPrediction[]
        lol_predictions: UserSchemaPrediction[]
        correct_predictions: number
        wrong_predictions: number
        lang?: "pt" | "en"
        plans: UserSchemaPremium[]
        warned?: boolean
        plan?: UserSchemaPremium
}
type BlacklistUser = {
        id: string
        when: number
        reason: string
        endsAt: number
}
type BlacklistGuild = {
        id: string
        name?: string
        when: number
        reason: string
        endsAt: number
}
export interface BlacklistSchemaInterface extends mongoose.Document {
        _id: string
        users: BlacklistUser[]
        guilds: BlacklistGuild[]
}
export interface KeySchemaInterface extends mongoose.Document {
        _id: string
        expiresAt?: number
        type: "BOOSTER" | "PREMIUM"
        user: string
        active: boolean
        activeIn: string[]
        canBeActivated?: number
}