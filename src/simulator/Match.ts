import { valorant_agents, valorant_maps, valorant_weapons } from "../config.ts"
import type { Args } from "../locales/index.ts"
import EmbedBuilder from "../structures/builders/EmbedBuilder.ts"
import ComponentInteractionContext from "../structures/interactions/ComponentInteractionContext.ts"
import type { PlayerWeapon } from "./Player.ts"

export type PlayerStats = {
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
}
export type PlayerMatchStats = {
  kills: number
  deaths: number
}
export type TeamPlayer = {
  id: string
  name: string
  stats: PlayerStats
  role: "initiator" | "controller" | "duelist" | "sentinel" | "flex"
  agent?: typeof valorant_agents[number]
  shield_type?: number
  alive: boolean
  match_stats?: PlayerMatchStats
  credits: number
  weapon?: typeof valorant_weapons[number]["name"]
}
export type TeamRoster = {
  name: string
  id: number
  role: string
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
  ovr: number
  agent: {
    name: string
    role: typeof valorant_agents[number]["role"]
  }
  credits: number
  collection: string
  team: string
  country: string
  purchaseable: boolean
  life: number
  weapon?: PlayerWeapon
  kills?: number
  deaths?: number
}
export type Team = {
  user: string
  roster: TeamRoster[]
  side?: "DEFENSE" | "ATTACK"
  name: string
  tag: string
}
export type KillEvent = {
  killer: Pick<TeamPlayer, "id" | "name">
  killerIndex: number
  victim: Pick<TeamPlayer, "id" | "name">
  victimIndex: number
  weapon: typeof valorant_weapons[number]["name"]
}
type RoundResult = {
  bomb_planted?: boolean
  bomb_defused?: boolean
  winning_team: number
  win_type: "ELIMINATION" | "BOMB" | "DEFUSE" | "TIME"
  kills: KillEvent[]
}
type MatchOptions = {
  teams: Team[]
  ctx: ComponentInteractionContext
  t: (content: string, args?: Args) => string
  mode: "unranked" | "ranked" | "swiftplay:unranked" | "swiftplay:ranked" | "tournament"
  map: string
  content: string
  overtime?: boolean
}
export default class Match {
  public rounds: RoundResult[] = []
  public teams: Team[] = []
  public finished: boolean = false
  public readonly ctx: ComponentInteractionContext
  public content: string = ""
  public t: (content: string, args?: Args) => string
  public readonly mode: "unranked" | "ranked" | "swiftplay:unranked" | "swiftplay:ranked" | "tournament"
  public maxScore: number = 0
  public switchSidesAt: number = 12
  public map: string
  public mapImage: string
  public mentions: string
  private options: MatchOptions
  public overtime?: boolean
  public constructor(options: MatchOptions) {
    this.teams = options.teams
    this.ctx = options.ctx
    this.t = options.t
    this.mode = options.mode
    this.options = options
    this.map = options.map
    this.mapImage = valorant_maps.filter(m => m.name === this.map)[0].image
    this.mentions = `<@${this.teams[0].user}> <@${this.teams[1].user}>`
    this.overtime = options.overtime
    if(this.mode === "unranked") {
      this.maxScore = 13
    }
    else if(this.mode === "swiftplay:unranked") {
      this.maxScore = 5
      this.switchSidesAt = 4
    }
    else if(this.mode === "swiftplay:ranked") {
      this.maxScore = 7
      this.switchSidesAt = 6
    }
    else if(this.mode === "tournament" && !this.overtime) {
      this.maxScore = 13
    }
    for(const p of this.teams[0].roster) {
      p.kills = 0
      p.deaths = 0
      p.weapon = {
        melee: {
          damage: {
            head: 50,
            chest: 50
          },
          rate_fire: 750
        },
        secondary: valorant_weapons.filter(w => w.name === "Classic")[0]
      }
    }
    for(const p of this.teams[1].roster) {
      p.kills = 0
      p.deaths = 0
      p.weapon = {
        melee: {
          damage: {
            head: 50,
            chest: 50
          },
          rate_fire: 750
        },
        secondary: valorant_weapons.filter(w => w.name === "Classic")[0]
      }
    }
    const sides: ("ATTACK" | "DEFENSE")[] = ["ATTACK", "DEFENSE"]
    const side = sides[Math.floor(Math.random() * sides.length)]
    this.teams[0].side = side
    this.teams[1].side = side === "ATTACK" ? "DEFENSE" : "ATTACK"
  }
  public async wait(time: number) {
    return await new Promise(r => setTimeout(r, time))
  }
  public async start() {
    const { default: Round } = await import("./Round.ts")
    return await new Round(this.options).setContent(this.content).start()
  }
  public setContent(content: string) {
    this.content = content
    return this
  }
  public async switchSides() {
    for(const t of this.teams) {
      t.side = t.side === "ATTACK" ? "DEFENSE" : "ATTACK"
      for(const p of t.roster) {
        p.credits = this.rounds.length >= 24 ? 4700 : 800
        p.weapon = {
          melee: {
            damage: {
              head: 50,
              chest: 50
            },
            rate_fire: 750
          },
          secondary: valorant_weapons.filter(w => w.name === "Classic")[0]
        }
      }
    }
    const content = this.t("simulator.switch_sides")
    this.content = content
    const embed = new EmbedBuilder()
    .setTitle(this.t(`simulator.mode.${this.mode}`))
    .setDesc(
      `### ${this.teams[0].name} ${this.rounds.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds.filter(r => r.winning_team === 1).length} ${this.teams[1].name}\n`
      +
      this.content
    )
    .setImage(this.mapImage)
    .setFields(
      {
        name: `${this.teams[0].name} (${this.t(`simulator.sides.${this.teams[0].side}`)})`,
        value: this.teams[0].roster
          .map(player => `${valorant_agents.find(a => a.name === player.agent.name)!.emoji} ${player.name} (${parseInt(player.ovr.toString())}) — \`${player.kills}/${player.deaths}\``)
          .join("\n"),
        inline: true
      },
      {
        name: `${this.teams[1].name} (${this.t(`simulator.sides.${this.teams[1].side}`)})`,
        value: this.teams[1].roster
          .map(player => `${valorant_agents.find(a => a.name === player.agent.name)!.emoji} ${player.name} (${parseInt(player.ovr.toString())}) — \`${player.kills}/${player.deaths}\``)
          .join("\n"),
        inline: true
      }
    )
    await this.ctx.edit(embed.build(this.mentions))
    await this.wait(3000)
  }
}