declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string,
      MONGO_URI: string,
      PREFIX: string,
      DEVS: string[],
      ERROR_LOG: string,
      COMMAND_LOG: string,
      GUILDS_LOG: string,
      INTERVAL: number
    }
  }
}
export {}