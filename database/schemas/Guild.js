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
  }
})

export default model('guilds', Guild)