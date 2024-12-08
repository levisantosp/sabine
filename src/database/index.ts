import mongoose from "mongoose"
import { client } from ".."
import { EmbedBuilder } from "../structures"
import { TextChannel } from "oceanic.js"
import { LiveFeed } from "../../types"

const UserSchema = mongoose.model("users", new mongoose.Schema(
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
export class User extends UserSchema {
  public async get(id: string | undefined | null) {
    return await UserSchema.findById(id) as UserSchemaInterface;
  }
  public async addPremium(premium: "PRO" | "BOOSTER" | "LITE" | "ULTIMATE", by: "ADD_PREMIUM_BY_COMMAND" | "BUY_PREMIUM") {
    const keys = await Key.find() as KeySchemaInterface[];
    let keyId: string;
    do {
      keyId = ""
      const pattern = "@@@@-####-@@##-&&&&"
      const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz"
      const digits = "0123456789"
      for(const char of pattern) {
        if(char === "@") {
          keyId += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length));
        } 
        else if(char === "#") {
          keyId += digits.charAt(Math.floor(Math.random() * digits.length));
        } 
        else if(char === "&") {
          keyId += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length));
        } 
        else {
          keyId += char;
        }
      }
    }
    while (keys.some(key => key.id === keyId));
    let expiresAt = !this.plans.at(-1) ? Date.now() + 2592000000 : Date.now() + ((this.plans.length + 1) * 2592000000);
    await new Key(
      {
        _id: keyId,
        type: premium,
        user: this.id,
        active: false,
        activeIn: [],
        expiresAt,
        canBeActivated: expiresAt - 2592000000
      }
    ).save();
    this.plans.push({
      type: premium,
      expiresAt
    });
    this.warned = false;
    await this.save();
    const channel = client.getChannel(process.env.USERS_LOG) as TextChannel;
    const user = client.users.get(this.id);
    const embed = new EmbedBuilder()
    .setTitle("New register")
    .setDesc(`User: ${user?.mention} (${this.id})`)
    .setFields(
      {
        name: by,
        value: premium
      }
    );
    const webhooks = await channel.getWebhooks();
    let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0];
    if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" });
    webhook.execute({
      avatarURL: client.user.avatarURL(),
      embeds: [embed]
    });
    return keyId;
  }
  public async removePremium(by: "REMOVE_PREMIUM_BY_AUTO" | "REMOVE_PREMIUM_BY_COMMAND") {
    let premium = this.plans[0].type;
    this.plans.shift();
    await this.save();
    const channel = client.getChannel(process.env.USERS_LOG) as TextChannel;
    const user = client.users.get(this.id);
    const embed = new EmbedBuilder()
    .setTitle("New register")
    .setDesc(`User: ${user?.mention} (${this.id})`)
    .setFields(
      {
        name: by,
        value: premium
      }
    );
    const webhooks = await channel.getWebhooks();
    let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0];
    if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" });
    webhook.execute({
      avatarURL: client.user.avatarURL(),
      embeds: [embed]
    });
    return this as UserSchemaInterface;
  }
  public async addPrediction(prediction: UserSchemaHistory) {
    this.history.push(prediction);
    await this.save();
    const channel = client.getChannel(process.env.USERS_LOG) as TextChannel;
    const user = client.users.get(this.id);
    const embed = new EmbedBuilder()
    .setTitle("New register")
    .setDesc(`User: ${user?.mention} (${this.id})`)
    .setFields(
      {
        name: "NEW_PREDICTION",
        value: `\`\`\`js\n${JSON.stringify(prediction, null, 2)}\`\`\``
      }
    );
    const webhooks = await channel.getWebhooks();
    let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0];
    if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" });
    webhook.execute({
      avatarURL: client.user.avatarURL(),
      embeds: [embed]
    });
    return this as UserSchemaInterface;
  }
  public async addCorrectPrediction(amount: number, predictionId: string) {
    this.guessesRight += 1;
    await this.save();
    const channel = client.getChannel(process.env.USERS_LOG) as TextChannel;
    const user = client.users.get(this.id);
    const embed = new EmbedBuilder()
    .setTitle("New register")
    .setDesc(`User: ${user?.mention} (${this.id})`)
    .setFields(
      {
        name: "CORRECT_PREDICTION",
        value: predictionId
      }
    );
    const webhooks = await channel.getWebhooks();
    let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0];
    if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" });
    webhook.execute({
      avatarURL: client.user.avatarURL(),
      embeds: [embed]
    });
    return this as UserSchemaInterface;
  }
  public async addWrongPrediction(amount: number, predictionId: string) {
    this.guessesWrong += 1;
    await this.save();
    const channel = client.getChannel(process.env.USERS_LOG) as TextChannel;
    const user = client.users.get(this.id);
    const embed = new EmbedBuilder()
    .setTitle("New register")
    .setDesc(`User: ${user?.mention} (${this.id})`)
    .setFields(
      {
        name: "CORRECT_PREDICTION",
        value: predictionId
      }
    );
    const webhooks = await channel.getWebhooks();
    let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0];
    if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" });
    webhook.execute({
      avatarURL: client.user.avatarURL(),
      embeds: [embed]
    });
    return this as UserSchemaInterface;
  }
}
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
    keys: Array,
    liveFeedChannel: String,
    liveMatches: {
      type: Array,
      default: []
    }
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
  expiresAt?: number;
  id: string;
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
  newsChannel?: string;
  liveFeedChannel?: string;
  liveMatches: LiveFeed[];
}
export interface UserSchemaInterface extends User {
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