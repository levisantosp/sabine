import mongoose from 'mongoose'

export const User = mongoose.model('users', new mongoose.Schema(
  {
    _id: String,
    history: {
      type: Array,
      default: []
    },
    guessesWrong: {
      type: Number,
      default: 0
    },
    guessesRight: {
      type: Number,
      default: 0
    },
    lang: String
  }
))
export const Guild = mongoose.model('guilds', new mongoose.Schema(
  {
    _id: String,
    lang: {
      type: String,
      default: 'en'
    },
    events: {
      type: Array,
      default: []
    },
    tournamentsLength: {
      type: Number,
      default: 5
    },
    lastResult: String,
    matches: {
      type: Array,
      default: []
    },
    tbdMatches: {
      type: Array,
      default: []
    },
    resendTime: {
      type: Number,
      default: 0
    }
  }
))
export const Blacklist = mongoose.model('blacklist', new mongoose.Schema(
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
type GuildSchemaEvent = {
  name: string
  channel1: string
  channel2: string
}
type UserSchemaHistoryTeam = {
  name: string
  score: string
}
type UserSchemaHistory = {
  match: string
  teams: UserSchemaHistoryTeam[]
}
type TBDMatches = {
  id: string
  channel: string
}
export interface GuildSchemaInterface extends mongoose.Document {
  _id: string
  lang: 'pt' | 'en'
  events: GuildSchemaEvent[]
  tournamentsLength: number
  lastResult: string
  matches: string[]
  tbdMatches: TBDMatches[]
  resendTime: number
}
export interface UserSchemaInterface extends mongoose.Document {
  _id: string
  history: UserSchemaHistory[]
  guessesRight: number
  guessesWrong: number
  lang: 'pt' | 'en'
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