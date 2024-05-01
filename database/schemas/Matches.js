import { Schema, model } from 'mongoose'

const Matches = new Schema({
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
  }
})

export default model('matches', Matches)