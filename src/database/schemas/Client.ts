import { Schema, model } from 'mongoose'

const Client = new Schema({
  _id: String,
  status: {
    type: Array,
    default: []
  }
})

export default model('client', Client)