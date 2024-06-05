import { Schema, model } from 'mongoose'

const Matches = new Schema({
  _id: String,
  VCTMatches: {
    type: Array,
    default: []
  },
  VCBMatches: {
    type: Array,
    default: []
  },
  VCNMatches: {
    type: Array,
    default: []
  },
  tbdMatches: {
    type: Array,
    default: []
  },
  lastVCTResult: String,
  lastVCNResult: String,
  lastVCBResult: String,
  verificationTimeVCT: {
    type: Number,
    default: 0
  },
  verificationTimeVCB: {
    type: Number,
    default: 0
  },
  verificationTimeVCN: {
    type: Number,
    default: 0
  }
})

export default model('matches', Matches)