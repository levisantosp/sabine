import { Document, Schema, model } from 'mongoose'

const User = new Schema({
  _id: String,
  history: {
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
type UserSchemaHistoryTeam = {
  name: string
  score: string
}
type UserSchemaHistory = {
  match: string
  teams: UserSchemaHistoryTeam[]
}
export interface UserSchemaInterface extends Document {
  _id: string
  history: UserSchemaHistory[]
  guessesRight: number
  guessesWrong: number
}
export default model('users', User)