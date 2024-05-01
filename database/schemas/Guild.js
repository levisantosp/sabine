import { Schema, model } from 'mongoose'

const Guild = new Schema({
  _id: String,
  lang: {
    type: String,
    default: 'en'
  },
  prefix: {
    type: String,
    default: '.'
  },
  events: {
    type: Array,
    default: []
  },
  lastMatchSentTime: {
    type: Number,
    default: 0
  },
  lastResultSentId: String,
  lastVCBMatchSendTime: {
    type: Number,
    default: 0
  },
  lastVCNMatchSendTime: {
    type: Number,
    default: 0
  },
  lastVCBResultSentId: String,
  lastVCNResultSentId: String
})

export default model('guilds', Guild)