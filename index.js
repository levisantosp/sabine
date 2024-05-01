import 'dotenv/config'
import App from './app/structures/client/App.js'
import { ComponentInteraction } from 'eris'
const app = new App(process.env.BOT_TOKEN, {
  intents: ['all'],
  allowedMentions: {
    everyone: false,
    repliedUser: true,
    roles: false,
    user: true
  },
  restMode: true
})
app.start()