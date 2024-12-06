import mongoose from "mongoose"

export const User = mongoose.model("users", new mongoose.Schema(
  {
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
    },
    lang: String,
    plans: {
      type: Array,
      default: []
    },
    warned: Boolean
  }
));
export const Guild = mongoose.model("guilds", new mongoose.Schema(
  {
    _id: String,
    lang: {
      type: String,
      default: "en"
    },
    events: {
      type: Array,
      default: []
    },
    tournamentsLength: {
      type: Number,
      default: 5
    },
    lastResult: String,
    matches: {
      type: Array,
      default: []
    },
    tbdMatches: {
      type: Array,
      default: []
    },
    resendTime: {
      type: Number,
      default: 0
    },
    lastNews: String,
    keys: Array
  }
));
export const Blacklist = mongoose.model("blacklist", new mongoose.Schema(
  {
    _id: String,
    users: {
      type: Array,
      default: []
    },
    guilds: {
      type: Array,
      default: []
    }
  }
));
export const Key = mongoose.model("keys", new mongoose.Schema(
  {
    _id: String,
    expiresAt: Number,
    type: String,
    user: String,
    active: Boolean,
    activeIn: Array,
    canBeActivated: Number
  }
));
type GuildSchemaEvent = {
  name: string;
  channel1: string;
  channel2: string;
}
type UserSchemaHistoryTeam = {
  name: string;
  score: string;
}
type UserSchemaHistory = {
  match: string;
  teams: UserSchemaHistoryTeam[];
}
type UserSchemaPremium = {
  type: "LITE" | "PRO" | "ULTIMATE",
  expiresAt: number
}
type TBDMatches = {
  id: string;
  channel: string;
}
type GuildSchemaKey = {
  type: "BOOSTER" | "LITE" | "PRO" | "ULTIMATE"
  expiresAt?: number
}
export interface GuildSchemaInterface extends mongoose.Document {
  _id: string;
  lang: "pt" | "en";
  events: GuildSchemaEvent[];
  tournamentsLength: number;
  lastResult?: string;
  matches: string[];
  tbdMatches: TBDMatches[];
  resendTime: number;
  lastNews?: string;
  keys?: GuildSchemaKey[];
}
export interface UserSchemaInterface extends mongoose.Document {
  _id: string;
  history: UserSchemaHistory[];
  guessesRight: number;
  guessesWrong: number;
  lang?: "pt" | "en"
  plans: UserSchemaPremium[];
  warned?: boolean;
}
type BlacklistUser = {
  id: string;
  when: number;
  reason: string;
  endsAt: number;
}
type BlacklistGuild = {
  id: string;
  name?: string;
  when: number;
  reason: string;
  endsAt: number;
}
export interface BlacklistSchemaInterface extends mongoose.Document {
  _id: string;
  users: BlacklistUser[];
  guilds: BlacklistGuild[];
}
export interface KeySchemaInterface extends mongoose.Document {
  _id: string;
  expiresAt?: number;
  type: "BOOSTER" | "LITE" | "PRO" | "ULTIMATE"
  user: string;
  active: boolean;
  activeIn: string[];
  canBeActivated?: number;
}