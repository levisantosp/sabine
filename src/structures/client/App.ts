import { Client, ClientOptions } from "oceanic.js"
import { readdirSync } from "fs"
import mongoose from "mongoose"
import { Logger, Command } from ".."
import path from "path"
import "dotenv/config"

export default class App extends Client {
  public commands: Map<string, Command> = new Map();
  public _uptime: number = Date.now();
  public constructor(options?: ClientOptions) {
    super(options);
  }
  public async loadCommands() {
    for(const file of readdirSync(path.join(__dirname, "../../commands"))) {
      const command = (await import(`../../commands/${file}`)).default.default ?? (await import(`../../commands/${file}`)).default;
      this.commands.set(command.name, command);
    }
    return this.commands;
  }
  public async start() {
    Logger.warn("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI!);
    Logger.send("Database connected!");
    await this.connect();
    for(const file of readdirSync(path.join(__dirname, "../../listeners"))) {
      const listener = (await import(`../../listeners/${file}`)).default.default ?? (await import(`../../listeners/${file}`)).default;
      if(listener.name === "ready") this.once("ready", () => listener.run(this).catch((e: Error) => new Logger(this).error(e)));
      else this.on(listener.name, (...args) => listener.run(this, ...args).catch((e: Error) => new Logger(this).error(e)));
    }
    for(const file of readdirSync(path.join(__dirname, "../../commands"))) {
      const command = (await import(`../../commands/${file}`)).default.default ?? (await import(`../../commands/${file}`)).default;
      this.commands.set(command.name, command);
    }
  }
}
export const client = new App({
  auth: "Bot " + process.env.BOT_TOKEN,
  gateway: {
    intents: ["ALL"],
    autoReconnect: true,
    maxShards: "auto"
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