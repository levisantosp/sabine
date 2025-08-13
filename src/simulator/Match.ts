import { valorant_agents, valorant_maps, valorant_weapons } from "../config.ts"
import type { Args } from '../locales/index.ts'
import ComponentInteractionContext from "../structures/interactions/ComponentInteractionContext.ts"
import { PlayerWeapon } from "./Player.ts"

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
}
export type Team = {
  user: string
  roster: TeamRoster[]
  side?: "DEFENSE" | "ATTACK"
  name: string
  tag: string
}
type KillEvent = {
  killer: Pick<TeamPlayer, "id" | "name">
  killer_index: number
  victim: Pick<TeamPlayer, "id" | "name">
  victim_index: number
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
}
type PrivateTeam = {
  user: string
  roster: TeamPlayer[]
  side?: "DEFENSE" | "ATTACK"
  lost_round_streak: number
  name: string
  tag: string
}
export default class Match {
  public rounds: RoundResult[] = []
  private __teams: PrivateTeam[] = []
  public teams: Team[] = []
  public finished: boolean = false
  public readonly ctx: ComponentInteractionContext
  public content: string = ""
  public t: (content: string, args?: Args) => string
  private readonly mode: "unranked" | "ranked" | "swiftplay:unranked" | "swiftplay:ranked" | "tournament"
  public maxScore?: number
  public switchSidesAt: number = 12
  public map: string
  private readonly options: MatchOptions
  public constructor(options: MatchOptions) {
    this.teams = options.teams
    this.ctx = options.ctx
    this.t = options.t
    this.mode = options!.mode
    this.options = options
    this.map = options.map
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
  }
  public async wait(time: number) {
    return await new Promise(r => setTimeout(r, time))
  }
  public async start() {
    const { default: Round } = await import("./Round.ts")
    await new Round(this.options).setContent(this.content).start()
  }
  public setContent(content: string) {
    this.content = content
    return this
  }
  public async switchSides() {
    for(const t of this.teams) {
      t.side = t.side === "ATTACK" ? "DEFENSE" : "ATTACK"
      for(let i = 0; i < t.roster.length; i++) {
        t.roster[i].credits = 800
      }
    }
    const content = this.t("simulator.switch_sides")
  }
}