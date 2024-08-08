import { Document, Schema, model } from 'mongoose'

const Guild = new Schema({
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
  verificationTime: {
    type: Number,
    default: 0
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
})
type GuildSchemaEvent = {
  name: string
  channel1: string
  channel2: string
}
export interface GuildSchemaInterface extends Document {
  _id: string
  lang: 'pt' | 'en'
  events: GuildSchemaEvent[]
  tournamentsLength: number
  verificationTime: number
  lastResult: string
  matches: string[]
  tbdMatches: string[]
  resendTime: number
}
export default model('guilds', Guild)