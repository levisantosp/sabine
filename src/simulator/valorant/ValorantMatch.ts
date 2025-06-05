import { valorant_agents, valorant_weapons } from "../../config.js"
import CommandContext from "../../structures/command/CommandContext.js"
import locales from "../../locales/index.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"

export type PlayerStats = {
  KD: number
  ACS: number
  ADR: number
  FK_percent: number
  FD_percent: number
  KAST_percent: number
}

export type PlayerMatchStats = {
  kills: number
  deaths: number
}

export type TeamPlayer = {
  id: string
  name: string
  stats: PlayerStats
  role: "INITIATOR" | "CONTROLLER" | "DUELIST" | "SENTINEL" | "FLEX"
  agent: typeof valorant_agents[number]
  shield_type?: number
  alive: boolean
  match_stats?: PlayerMatchStats
}

export type Team = {
  user: string
  name: string
  tag: string
  roster: TeamPlayer[]
  score?: number
  side: "DEFENSE" | "ATTACK"
}

type KillEvent = {
  killer: Pick<TeamPlayer, "id" | "name">
  killer_index: number
  victim: Pick<TeamPlayer, "id" | "name">
  victim_index: number
  weapon: typeof valorant_weapons[number]
}

type RoundResult = {
  bomb_planted?: boolean
  bomb_defused?: boolean
  winning_team: number
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
  public teams: Team[] = []
  public finished: boolean = false
  private ctx: CommandContext
  private started: boolean = false
  private content: string = ""
  private locale: string

  public constructor(options: MatchOptions) {
    this.teams = options.teams
    this.ctx = options.ctx
    this.locale = options.locale
    this.teams[0].score = 0
    this.teams[1].score = 1
  }

  /**
   * set match content
   */
  public set_content(content: string) {
    this.content = content
  }

  /**
   * start a match
   */
  public async start_match() {
    if(this.started) {
      return await this.start_round()
    }
    else {
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
    const roles: TeamPlayer["role"][] = Array.from(
      new Set(this.teams.flatMap(t => t.roster.filter(p => p.alive).map(p => p.role === "FLEX" ? p.agent.role : p.role)))
    )
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
      let index = this.teams[1].roster.findIndex(p => p.id === player2.id)
      this.teams[1].roster[index].alive = false

      if(this.teams[1].roster[index].match_stats) {
        this.teams[1].roster[index].match_stats = {
          deaths: !(this.teams[1].roster[index].match_stats!.deaths + 1) ? 1 : this.teams[1].roster[index].match_stats!.deaths + 1,
          kills: 0
        }
      }
      else this.teams[1].roster[index].match_stats = {
        deaths: 1,
        kills: 0
      }

      index = this.teams[0].roster.findIndex(p => p.id === player1.id)
      if(this.teams[0].roster[index].match_stats) {
        this.teams[0].roster[index].match_stats = {
          deaths: 0,
          kills: !(this.teams[0].roster[index].match_stats!.kills + 1) ? 1 : this.teams[0].roster[index].match_stats!.kills + 1
        }
      }
      else {
        this.teams[0].roster[index].match_stats = {
          kills: 1,
          deaths: 0
        }
      }

      return {
        winner: player1.id,
        loser: player2.id,
        winner_index: 0,
        loser_index: 1
      }
    }
    else {
      const index = this.teams[0].roster.findIndex(p => p.id === player1.id)
      this.teams[0].roster[index].alive = false

      return {
        winner: player2.id,
        loser: player1.id,
        winner_index: 1,
        loser_index: 0
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
    for(let i = 0;i < array.length;i++) {
      n += weights[i]

      if(r <= n) {
        return array[i]
      }
    }

    return array.at(-1)
  }

  /**
   * start the first step of the round (before plant)
   */
  private async before_plant(duels: number) {
    const kills: KillEvent[] = []

    if(!duels) {
      return this.after_plant()
    }
    else {
      for(let i = 0; i < duels; i++) {
        const {
          winner,
          loser
        } = this.start_player_duel()
        const players = [...this.teams[0].roster, ...this.teams[1].roster]

        var __winner_index = players.findIndex(p => p.id === winner) < 5 ? 0 : 1
        var __loser_index = players.findIndex(p => p.id === loser) < 5 ? 0 : 1

        const __winner = players.find(p => p.id === winner)!
        const __loser = players.find(p => p.id === loser)!

        kills.push({
          killer: __winner,
          killer_index: __winner_index,
          victim: __loser,
          victim_index: __loser_index,
          weapon: "Vandal"
        })
      }

      for(const kill of kills) {
        const content = locales(this.locale, `${this.teams[kill.killer_index].tag} ${kill.killer.name} matou ${this.teams[kill.victim_index].tag} ${kill.victim.name} com uma Vandal`)
        this.content += `- ${content}\n`

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())

        await new Promise(r => setTimeout(r, 1000))
      }

      if(!this.teams[0].roster.length || !this.teams[1].roster.length) {
        if(!this.teams[0].roster.length) {
          this.rounds_played.push({
            winning_team: 1,
            win_type: "ELIMINATION",
            kills
          })

          const content = locales(this.locale, `${this.teams[1].name} vence o round`)

          this.content += `${content}\n`

          const embed = new EmbedBuilder()
          .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
          .setDesc(this.content)

          this.content = ""

          await this.ctx.edit(embed.build())
        }
        else {
          this.rounds_played.push({
            winning_team: 0,
            win_type: "ELIMINATION",
            kills
          })

          const content = locales(this.locale, `${this.teams[0].name} vence o round`)

          this.content += `${content}\n`

          const embed = new EmbedBuilder()
          .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
          .setDesc(this.content)

          this.content = ""
          
          await this.ctx.edit(embed.build())
        }
      }
      else {
        const bomb = ["A", "B"][Math.floor(Math.random() * 2)]

        const content = locales(this.locale, `- Spike plantada no bomb site ${bomb}`)
        this.content += `${content}\n`
        
        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())

        return await this.after_plant()
      }
    }
  }

  /**
   * start the second step (after plant)
   */
  public async after_plant() {
    const kills: KillEvent[] = []

    var win_types: RoundResult["win_type"][] = ["BOMB", "DEFUSE", "TIME", "ELIMINATION"]
    var win_type = win_types[Math.floor(Math.random() * win_types.length)]

    const round: RoundResult = {
      bomb_planted: true,
      kills,
      win_type,
      winning_team: (win_type === "BOMB") || (win_type === "TIME") ? this.teams.findIndex(t => t.side === "ATTACK") : this.teams.findIndex(t => t.side === "DEFENSE")
    }

    if(
      win_type === "BOMB"
      ||
      win_type === "DEFUSE"
      ||
      win_type === "TIME"
    ) {
      var duels = Math.floor(
        Math.random()
        *
        Math.min(
          this.teams[0].roster.filter(p => p.alive).length,
          this.teams[1].roster.filter(p => p.alive).length
        )
      )

      if(
        !duels
        &&
        (
          this.teams[0].roster.filter(p => p.alive).length > 0
          &&
          this.teams[1].roster.filter(p => p.alive).length > 0
        )
      ) {
        duels = 1
      }
      for(
        let i = 0; 
        i < duels;
        i++
      ) {
        const {
          winner,
          loser
        } = this.start_player_duel()

        const allPlayers = [
          ...this.teams[0].roster,
          ...this.teams[1].roster
        ]

        const __winner_index = allPlayers.findIndex(p => p.id === winner) < 5 ? 0 : 1
        const __loser_index = allPlayers.findIndex(p => p.id === loser) < 5 ? 0 : 1

        const __winner = allPlayers.find(p => p.id === winner)!
        const __loser = allPlayers.find(p => p.id === loser)!

        kills.push({
          killer: __winner,
          killer_index: __winner_index,
          victim: __loser,
          victim_index: __loser_index,
          weapon: "Vandal"
        })

        // if(
        //   !this.teams[0].roster.filter(p => p.alive).length
        //   &&
        //   !this.teams[1].roster.filter(p => p.alive).length
        // ) return

        var team1 = this.teams[0]
        var team2 = this.teams[1]

        console.log(team1.roster.filter(p => p.alive).length, team2.roster.filter(p => p.alive).length)
      }

      if(win_type === "DEFUSE") {
        var index = this.teams.findIndex(t => t.side === "DEFENSE")
        this.teams[index].score! += 1
        this.rounds_played.push(round)

        const content = locales(this.locale, `- ${this.teams[index].name} vence o round`)

        this.content += `${content}\n`

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())
      }
      else {
        var index = this.teams.findIndex(t => t.side === "ATTACK")
        this.teams[index].score! += 1
        this.rounds_played.push(round)

        const content = locales(this.locale, `- ${this.teams[index].name} vence o round`)

        this.content += `${content}\n`

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())
      }
    }
    else {
      for(
        let i = 0;
        i < Math.min(
          this.teams[0].roster.filter(p => p.alive).length,
          this.teams[1].roster.filter(p => p.alive).length
        );
        i++
      ) {
        const {
          winner,
          loser
        } = this.start_player_duel()

        const allPlayers = [
          ...this.teams[0].roster,
          ...this.teams[1].roster
        ]

        const __winner_index = allPlayers.findIndex(p => p.id === winner) < 5 ? 0 : 1
        const __loser_index = allPlayers.findIndex(p => p.id === loser) < 5 ? 0 : 1

        const __winner = allPlayers.find(p => p.id === winner)!
        const __loser = allPlayers.find(p => p.id === loser)!

        kills.push({
          killer: __winner,
          killer_index: __winner_index,
          victim: __loser,
          victim_index: __loser_index,
          weapon: "Vandal"
        })

        // if(
        //   !this.teams[0].roster.filter(p => p.alive).length
        //   &&
        //   !this.teams[1].roster.filter(p => p.alive).length
        // ) return

        var index = this.teams.findIndex(t => t.side === "ATTACK")
        this.teams[index].score! += 1
        this.rounds_played.push(round)
        const content = locales(this.locale, `${this.teams[index].name} venceu o round`)

        this.content += `${content}\n`

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())

        var team1 = this.teams[0]
        var team2 = this.teams[1]

        console.log(team1.roster.filter(p => p.alive).length, team2.roster.filter(p => p.alive).length)
      }
    }

    for(const kill of kills) {
      const content = locales(this.locale, `${this.teams[kill.killer_index].tag} ${kill.killer.name} matou ${this.teams[kill.victim_index].tag} ${kill.victim.name} com uma Vandal`)
      this.content += `- ${content}\n`

    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
    .setDesc(this.content)
    await this.ctx.edit(embed.build())

      await new Promise(r => setTimeout(r, 1000))
    }

    for(const team of this.teams)
      for(const p of team.roster)
        p.alive = true


    this.content = ""
    await new Promise(r => setTimeout(r, 5000))
    await this.start_round()
  }

  /**
   * starts a round
   */
  public async start_round() {
    const duels = Math.floor(Math.random() * 6)
    const round_number = this.rounds_played.length + 1

    const content = locales(this.locale, `- Round ${round_number} iniciado`)

    this.content += `${content}\n`

    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.teams[0].score} <:versus:1349105624180330516> ${this.teams[1].score} ${this.teams[1].name}`)
    .setDesc(this.content)
    await this.ctx.edit(embed.build())

    return await this.before_plant(duels)
  }
}