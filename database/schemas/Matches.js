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
  lastVCBResult: String
})

export default model('matches', Matches)