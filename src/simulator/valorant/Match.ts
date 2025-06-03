import { valorant_agents } from "../../config.js"

type PlayerStats = {
  KD: number
  ACS: number
  ADR: number
  FK_percent: number
  FD_percent: number
  KAST_percent: number
}

type TeamPlayer = {
  id: string
  name: string
  stats: PlayerStats
  role: "INITIATOR" | "CONTROLLER" | "DUELIST" | "SENTINEL" | "FLEX"
  agent: typeof valorant_agents[number]
}

type Team = {
  user: string
  name: string
  roster: TeamPlayer[]
  score?: number
}

type Player = {
  id: string
  name: string
  ovr: number
}
type KillEvent = {
  killer: Player
  victim: Player
  headshot: boolean
  weapon: string
}

type RoundResult = {
  bomb_planted?: boolean
  bomb_defused?: boolean
  winning_team: string
  win_type: "ELIMINATION" | "BOMB" | "DEFUSE" | "TIME"
  kills: KillEvent[]
}

type RoundPlayer = {
  KD: number
  ACS: number
  ADR: number
  FK_percent: number
  FD_percent: number
  KAST_percent: number
  life: number
  shield_type?: number // 0 = light armor; 1 = regen armor; 2 = heavy armor
  name: string
  id: string
}

type RoundTeam = {
  name: string
  roster: RoundPlayer[]
}

type CurrentRound = {
  round_number: number
  teams: RoundTeam[]
}

type MatchOptions = {
  teams: Team[]
}

export default class ValorantMatch {
  public rounds_played: RoundResult[] = []
  public current_round?: CurrentRound
  public map: string = ""
  public teams: Team[] = []
  public duels: number = 0

  public constructor(options: MatchOptions) {
    this.teams = options.teams
  }

  /**
   * calculate the player's overral
   */
  public calc_player_ovr(player: TeamPlayer) {
    const KD = (player.stats.KD / 1) * 20
    const ACS = (player.stats.ACS / 300) * 30
    const ADR = (player.stats.ADR / 200) * 20
    const FK = (player.stats.FK_percent / 20) * 10
    const FD = (player.stats.FD_percent / 20) * 5
    const KAST = (player.stats.KAST_percent / 100) * 15

    return KD + ACS + ADR + FK + FD + KAST
  }

  /**
   * determine which player will win the round
   */
  public start_player_duel() {
    const roles: TeamPlayer["role"][] = ["CONTROLLER", "SENTINEL", "INITIATOR", "DUELIST"]
    const weights = [5, 15, 30, 50]

    const pick1 = this.choose_with_weight(roles, weights)
    // ive stopped here
  }
  private choose_with_weight(array: string[], weights: number[]) {
    const total_weight = weights.reduce((acc, w) => acc + w, 0)
    const r = Math.random() * total_weight

    let n = 0
    for(let i = 0; i < array.length; i++) {
      n += weights[i]

      if(r <= n) {
        return array[i]
      }
    }

    return array.at(-1)
  }
}