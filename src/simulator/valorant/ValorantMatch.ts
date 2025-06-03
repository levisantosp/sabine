import { CommandInteraction, InteractionResponse, Message, MessageInteractionResponse } from "oceanic.js"
import { valorant_agents, valorant_weapons } from "../../config.js"
import CommandContext from "../../structures/command/CommandContext.js"
import locales from "../../locales/index.js"

export type PlayerStats = {
  KD: number
  ACS: number
  ADR: number
  FK_percent: number
  FD_percent: number
  KAST_percent: number
}

export type TeamPlayer = {
  id: string
  name: string
  stats: PlayerStats
  role: "INITIATOR" | "CONTROLLER" | "DUELIST" | "SENTINEL" | "FLEX"
  agent: typeof valorant_agents[number]
  shield_type?: number
  alive: boolean
}

export type Team = {
  user: string
  name: string
  roster: TeamPlayer[]
  score?: number
  side: "DEFENSE" | "ATTACK"
}

export type Player = {
  id: string
  name: string
  ovr: number
}

type KillEvent = {
  killer: Player
  victim: Player
  weapon: typeof valorant_weapons[number]
}

type RoundResult = {
  bomb_planted?: boolean
  bomb_defused?: boolean
  winning_team: string
  win_type: "ELIMINATION" | "BOMB" | "DEFUSE" | "TIME"
  kills: KillEvent[]
}

type RoundTeam = {
  name: string
  roster: TeamPlayer[]
}

type CurrentRound = {
  round_number: number
  teams: RoundTeam[]
  duels: number
}

type MatchOptions = {
  teams: Team[]
  ctx: CommandContext
  locale: string
}

export default class ValorantMatch {
  public id: number = 0
  private rounds_played: RoundResult[] = []
  private current_round?: CurrentRound
  private map: string = ""
  private teams: Team[] = []
  public finished: boolean = false
  private ctx: CommandContext
  private started: boolean = false
  private content: string = ""
  private locale: string

  public constructor(options: MatchOptions) {
    this.teams = options.teams
    this.ctx = options.ctx
    this.locale = options.locale
  }

  /**
   * start a match
   */
  public async start_match() {
    if(this.started) {
      return await this.start_round()
    }
    else {
      const content = locales(this.locale, "partida iniciada")

      this.content += `${content}\n`
      await this.ctx.reply(this.content)
      this.started = true

      return
    }
  }

  /**
   * calculate the player's overral
   */
  private calc_player_ovr(player: TeamPlayer) {
    const KD = (player.stats.KD / 1) * 20
    const ACS = (player.stats.ACS / 300) * 30
    const ADR = (player.stats.ADR / 200) * 20
    const FK = (player.stats.FK_percent / 20) * 10
    const FD = (player.stats.FD_percent / 20) * 5
    const KAST = (player.stats.KAST_percent / 100) * 15

    return KD + ACS + ADR + FK + FD + KAST
  }

  /**
   * determine which player will win the duel
   */
  private start_player_duel() {
    const roles: TeamPlayer["role"][] = ["CONTROLLER", "SENTINEL", "INITIATOR", "DUELIST"]
    const weights = [5, 15, 30, 50]

    const pick1 = this.choose_player(roles, weights)
    const pick2 = this.choose_player(roles, weights)

    const roster1 = this.teams[0].roster
    .filter(p => p.alive)
    .filter(p => {
      const r = p.role === "FLEX" ? p.agent.role : p.role
      return r === pick1
    })
    var player1 = roster1[Math.floor(Math.random() * roster1.length)]
    
    if(!player1) {
      let roster = this.teams[0].roster.filter(p => p.alive)
      player1 = roster[Math.floor(Math.random() * roster.length)]
    }

    const roster2 = this.teams[1].roster
    .filter(p => p.alive)
    .filter(p => {
      const r = p.role === "FLEX" ? p.agent.role : p.role
      return r === pick2
    })
    var player2 = roster2[Math.floor(Math.random() * roster2.length)]

    if(!player2) {
      let roster = this.teams[1].roster.filter(p => p.alive)
      player2 = roster[Math.floor(Math.random() * roster.length)]
    }

    const x = this.calc_player_ovr(player1)
    const y = this.calc_player_ovr(player2)
    const diff = (x - y) / (x + y)
    const prob = 0.5 + (diff * 0.4)
    const randola = Math.random()

    if(randola < prob) {
      const index = this.teams[1].roster.findIndex(p => p.id === player2.id)
      this.teams[1].roster[index].alive = false

      return {
        winner: player1.id,
        loser: player2.id
      }
    }
    else {
      const index = this.teams[0].roster.findIndex(p => p.id === player1.id)
      this.teams[0].roster[index].alive = false
      
      return {
        winner: player2.id,
        loser: player1.id
      }
    }
  }

  /**
   * select a player by role
   */
  private choose_player(array: string[], weights: number[]) {
    const total_weight = weights.reduce((acc, w) => acc + w, 0)
    const r = Math.random() * total_weight

    let n = 0
    for (let i = 0;i < array.length;i++) {
      n += weights[i]

      if (r <= n) {
        return array[i]
      }
    }

    return array.at(-1)
  }

  /**
   * starts a round
   */
  public async start_round() {
    const duels = Math.floor(Math.random() * 6)
    const round_number = this.rounds_played.length + 1

    const content = locales(this.locale, `round ${round_number} iniciado`)
    
    this.content += `${content}\n`

    await this.ctx.edit(this.content)
  
    if(!duels) {

    }
    else {
        for(let i = 0; i < duels; i++) {
        const kills: KillEvent[] = []
        const { winner, loser } = this.start_player_duel()
        const players = [...this.teams[0].roster, ...this.teams[1].roster]
        const __winner = players.filter(p => p.id === winner)[0]
        const __loser = players.filter(p => p.id === loser)[0]
        
        const content = locales(this.locale, `${__winner.name} (${__winner.id}) matou ${__loser.name} (${__loser.id})`)

        this.content += `${content}\n\n`

        await this.ctx.edit(this.content)

        console.log(this.teams[0].roster.length)
      }
    }
  }
}