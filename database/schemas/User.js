import { Schema, model } from 'mongoose'

const User = new Schema({
  _id: String,
  history: {
    type: Array,
    default: []
  },
  guesses: {
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
  }
})

export default model('users', User)