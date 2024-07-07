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
  }
})

export default model('guilds', Guild)