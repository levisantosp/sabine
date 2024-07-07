import { Schema, model } from 'mongoose'

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
  }
})

export default model('guilds', Guild)