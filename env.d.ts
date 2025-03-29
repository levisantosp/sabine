declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      MONGO_URI: string;
      PREFIX: string;
      ERROR_LOG: string;
      COMMAND_LOG: string;
      GUILDS_LOG: string;
      SHARD_LOG: string;
      INTERVAL: number;
      USERS_LOG: string;
      AUTH: string;
      API_URL: string;
      PORT: number;
    }
  }
}
export {}