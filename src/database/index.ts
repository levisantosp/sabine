import * as Oceanic from "oceanic.js"
import type { LiveFeed } from "../types.ts"
import EmbedBuilder from "../structures/builders/EmbedBuilder.ts"
import { client } from "../structures/client/App.ts"
import { PrismaClient,  } from "@prisma/client"

const prisma = new PrismaClient()
type PredictionTeam = {
  name: string
  score: string,
  winner: boolean
}
type Prediction = {
  match: string
  teams: PredictionTeam[]
  status: "pending" | "correct" | "wrong"
  bet: bigint | null
  odd: number | null
}

export class SabineUser {
  public id: string
  public constructor(id: string) {
    this.id = id
  }
  public async get() {
    return await prisma.users.findUnique({
      where: {
        id: this.id
      }
    })
  }
  public async addPrediction(game: "valorant" | "lol", prediction: Prediction) {
    const user = await this.get() ?? await prisma.users.create({
      data: {
        id: this.id
      }
    })
    if(game === "valorant") {
      user.valorant_predictions.push(prediction)
      await prisma.users.update({
        where: {
          id: this.id
        },
        data: {
          valorant_predictions: user.valorant_predictions
        }
      })
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(this.id)
      const embed = new EmbedBuilder()
        .setTitle("New register")
        .setDesc(`User: ${u?.mention} (${this.id})`)
        .setFields(
          {
            name: "NEW_PREDICTION",
            value: `\`\`\`js\n${JSON.stringify(prediction, null, 2)}\`\`\``
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
      return this
    }
    if(game === "lol") {
      user?.lol_predictions.push(prediction)
      await prisma.users.update({
        where: {
          id: this.id
        },
        data: {
          lol_predictions: user.lol_predictions
        }
      })
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(this.id)
      const embed = new EmbedBuilder()
        .setTitle("New register")
        .setDesc(`User: ${u?.mention} (${this.id})`)
        .setFields(
          {
            name: "NEW_PREDICTION",
            value: `\`\`\`js\n${JSON.stringify(prediction, null, 2)}\`\`\``
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
      return this
    }
  }
  public async addCorrectPrediction(game: "valorant" | "lol", predictionId: string) {
    const user = await this.get() ?? await prisma.users.create({
      data: {
        id: this.id
      }
    })
    if(game === "valorant") {
      let index = user.valorant_predictions.findIndex(p => p.match === predictionId)
      user.valorant_predictions[index].status = "correct"
      await prisma.users.update({
        where: {
          id: this.id
        },
        data: {
          correct_predictions: {
            increment: 1
          },
          valorant_predictions: user.valorant_predictions
        }
      })
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(this.id)
      const embed = new EmbedBuilder()
        .setTitle("New register")
        .setDesc(`User: ${u?.mention} (${this.id})`)
        .setFields(
          {
            name: "CORRECT_PREDICTION",
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    else {
      let index = user.lol_predictions.findIndex(p => p.match === predictionId)
      user.lol_predictions[index].status = "correct"
      await prisma.users.update({
        where: {
          id: this.id
        },
        data: {
          correct_predictions: {
            increment: 1
          },
          lol_predictions: user.lol_predictions
        }
      })
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(this.id)
      const embed = new EmbedBuilder()
        .setTitle("New register")
        .setDesc(`User: ${u?.mention} (${this.id})`)
        .setFields(
          {
            name: "CORRECT_PREDICTION",
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    return this
  }
  public async addWrongPrediction(game: "valorant" | "lol", predictionId: string) {
    const user = await this.get() ?? await prisma.users.create({
      data: {
        id: this.id
      }
    })
    if(game === "valorant") {
      let index = user.valorant_predictions.findIndex(p => p.match === predictionId)
      user.valorant_predictions[index].status = "wrong"
      await prisma.users.update({
        where: {
          id: this.id
        },
        data: {
          wrong_predictions: {
            increment: 1
          },
          valorant_predictions: user.valorant_predictions
        }
      })
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(this.id)
      const embed = new EmbedBuilder()
        .setTitle("New register")
        .setDesc(`User: ${u?.mention} (${this.id})`)
        .setFields(
          {
            name: "WRONG_PREDICTION",
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    else {
      let index = user.lol_predictions.findIndex(p => p.match === predictionId)
      user.lol_predictions[index].status = "wrong"
      await prisma.users.update({
        where: {
          id: this.id
        },
        data: {
          wrong_predictions: {
            increment: 1
          },
          lol_predictions: user.lol_predictions
        }
      })
      const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
      const u = client.users.get(this.id)
      const embed = new EmbedBuilder()
        .setTitle("New register")
        .setDesc(`User: ${u?.mention} (${this.id})`)
        .setFields(
          {
            name: "WRONG_PREDICTION",
            value: predictionId
          }
        )
      const webhooks = await channel.getWebhooks()
      let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
      if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
      await webhook.execute({
        avatarURL: client.user.avatarURL(),
        embeds: [embed]
      })
    }
    return this
  }
  public async addPlayerToRoster(player: string, method: "CLAIM_COMMAND" | "COMMAND" = "CLAIM_COMMAND") {
    const user = await this.get() ?? await prisma.users.create({
      data: {
        id: this.id
      }
    })
    user.roster?.reserve.push(player)
    if(method === "CLAIM_COMMAND") {
      user.claim_time = Date.now() + 600000
    }
    await prisma.users.update({
      where: {
        id: this.id
      },
      data: {
        roster: {
          reserve: user.roster?.reserve
        },
        claim_time: user.claim_time
      }
    })
    const u = client.users.get(this.id)!
    const embed = new EmbedBuilder()
    .setTitle("New register")
    .setDesc(`User: ${u.mention}`)
    .setFields(
      {
        name: `CLAIM_PLAYER_BY_${method}`,
        value: player
      }
    )
    const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
    if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
    await webhook.execute({
      avatarURL: client.user.avatarURL(),
      embeds: [embed]
    })
    return this
  }
  public async sellPlayer(id: string, price: bigint, i: number) {
    const user = await this.get() ?? await prisma.users.create({
      data: {
        id: this.id
      }
    })
    user.roster!.reserve.splice(i, 1)
    await prisma.users.update({
      where: {
        id: this.id
      },
      data: {
        roster: {
          reserve: user.roster!.reserve
        },
        coins: {
          increment: price
        }
      }
    })
    const u = client.users.get(this.id)!
    const embed = new EmbedBuilder()
    .setTitle("New register")
    .setDesc(`User: ${u.mention}`)
    .setFields(
      {
        name: `SELL_PLAYER`,
        value: id
      }
    )
    const channel = client.getChannel(process.env.USERS_LOG) as Oceanic.TextChannel
    const webhooks = await channel.getWebhooks()
    let webhook = webhooks.filter(w => w.name === client.user.username + " Logger")[0]
    if(!webhook) webhook = await channel.createWebhook({ name: client.user.username + " Logger" })
    await webhook.execute({
      avatarURL: client.user.avatarURL(),
      embeds: [embed]
    })
    return this
  }
}
export class SabineGuild {
  public id: string
  public constructor(id: string) {
    this.id = id
  }
  public async get() {
    return await prisma.guilds.findUnique({
      where: {
        id: this.id
      }
    })
  }
}