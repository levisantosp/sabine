import "dotenv/config"
import App from "./structures/client/App"
export const client = new App({
  auth: "Bot " + process.env.BOT_TOKEN,
  gateway: {
    intents: ["ALL"],
    autoReconnect: true,
  },
  allowedMentions: {
    everyone: false,
    users: true,
    repliedUser: true,
    roles: false
  },
  defaultImageFormat: "png",
  defaultImageSize: 2048
});
client.start();