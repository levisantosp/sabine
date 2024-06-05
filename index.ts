import 'dotenv/config'
import App from './app/structures/client/App.js'
new App(process.env.BOT_TOKEN!, {
  intents: ['all'],
  allowedMentions: {
    everyone: false,
    repliedUser: true,
    roles: false,
    users: true
  },
  restMode: true,
  defaultImageSize: 2048,
  defaultImageFormat: 'png'
}).start()