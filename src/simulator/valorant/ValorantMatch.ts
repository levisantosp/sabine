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
  private content: string = ""
  private locale: string

  public constructor(options: MatchOptions) {
    this.teams = options.teams
    this.ctx = options.ctx
    this.locale = options.locale
  }

  /**
   * wait before continue
   * @returns 
   */
  public async wait(t: number) {
    return await new Promise(r => setTimeout(r, t))
  }

  /**
   * set match content
   */
  public setContent(content: string) {
    this.content = content
  }

  /**
   * calculate the player's overral
   */
  private calcPlayerOvr(player: TeamPlayer) {
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
  private startPlayerDuel() {
    const roles: TeamPlayer["role"][] = Array.from(
      new Set(this.teams.flatMap(t => t.roster.filter(p => p.alive).map(p => p.role === "FLEX" ? p.agent.role : p.role)))
    )
    const weights = [5, 15, 30, 50]

    const pick1 = this.choosePlayer(roles, weights)
    const pick2 = this.choosePlayer(roles, weights)

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

    const x = this.calcPlayerOvr(player1)
    const y = this.calcPlayerOvr(player2)
    const diff = (x - y) / 100
    const prob = 1 / (1 + Math.exp(-diff * 3))
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
  private choosePlayer(array: string[], weights: number[]) {
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
  private async firstStep(duels: number) {
    const kills: KillEvent[] = []

    for(let i = 0;i < duels;i++) {
      const {
        winner,
        loser
      } = this.startPlayerDuel()
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
      const content = locales(this.locale, `${this.teams[kill.killer_index].tag} ${kill.killer.name} killed ${this.teams[kill.victim_index].tag} ${kill.victim.name} with a Vandal`)
      this.content += `- ${content}\n`

      const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
        .setDesc(this.content)
      await this.ctx.edit(embed.build())

      await this.wait(1000)
    }

    const team1_alive = this.teams[0].roster.filter(p => p.alive).length > 0
    const team2_alive = this.teams[1].roster.filter(p => p.alive).length > 0

    if(!team1_alive || !team2_alive) {
      var winning_team = team1_alive ? 0 : 1

      this.rounds_played.push({
        winning_team: winning_team,
        win_type: "ELIMINATION",
        kills
      })

      const content = locales(this.locale, `- **${this.teams[1].name} wins the round by eliminating the entire opposing team**`)

      this.content += `${content}\n`

      const embed = new EmbedBuilder()
      .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
      .setDesc(this.content)

      this.content = ""

      await this.ctx.edit(embed.build())
      await this.wait(5000)
      return
    }
    else {
      var bomb_planted = Math.random() < 0.8
      if(bomb_planted) {
        const bomb = ["A", "B"][Math.floor(Math.random() * 2)]

        const content = locales(this.locale, `- *Spike planted at bomb site ${bomb}*`)
        this.content += `${content}\n`

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())

        await this.wait(5000)
        return await this.secondStep(true)
      }
      else {
        await this.secondStep()
      }
    }
  }

  /**
   * start the second step (after plant)
   */
  public async secondStep(bomb_planted?: boolean) {
    const kills: KillEvent[] = []

    var attack_index = this.teams.findIndex(t => t.side === "ATTACK")
    var defense_index = this.teams.findIndex(t => t.side === "DEFENSE")
    var attack_ovr = this.calcTeamOvr(attack_index, true)
    var defense_ovr = this.calcTeamOvr(defense_index, true)
    var total_ovr = attack_ovr + defense_ovr
    var win_types_weights = {
      BOMB: 0.4 * attack_ovr / total_ovr,
      DEFUSE: 0.4 * defense_ovr / total_ovr,
      TIME: 0.2 * defense_ovr / total_ovr,
      ELIMINATION: 0.3 * Math.max(attack_ovr, defense_ovr) / total_ovr
    }

    var win_types: RoundResult["win_type"][] = []
    for(const [type, weight] of Object.entries(win_types_weights)) {
      if(bomb_planted && type === "TIME") continue
      if(!bomb_planted && ["BOMB", "DEFUSE"].includes(type)) continue

      for(let i = 0; i < weight * 100; i++) {
        win_types.push(type as RoundResult["win_type"])
      }
    }

    var win_type = win_types[Math.floor(Math.random() * win_types.length)]

    if(
      win_type === "BOMB"
      ||
      win_type === "DEFUSE"
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
        } = this.startPlayerDuel()

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

        var team1 = this.teams[0]
        var team2 = this.teams[1]

        // console.log(team1.roster.filter(p => p.alive).length, team2.roster.filter(p => p.alive).length)
      }

      if(win_type === "DEFUSE") {
        var winning_team = this.teams.findIndex(t => t.side === "DEFENSE")
        const round: RoundResult = {
          bomb_planted,
          kills,
          win_type,
          winning_team
        }

        var index = this.teams.findIndex(t => t.side === "DEFENSE")
        this.rounds_played.push(round)

        const content = locales(this.locale, `- *Spike defused*\n- **${this.teams[index].name}** wins the round`)

        this.content += `${content}\n`

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())

        this.content = ""

  

        await this.wait(5000)

        return
      }
      else {
        var index = this.teams.findIndex(t => t.side === "ATTACK")
        const round: RoundResult = {
          bomb_planted,
          kills,
          win_type,
          winning_team: index
        }
        this.rounds_played.push(round)

        const content = locales(this.locale, `- Spike detonated\n - **${this.teams[index].name}** wins the round`)

        this.content += `${content}\n`

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())

        this.content = ""

  

        await this.wait(5000)

        return
      }
    }
    else if(win_type === "TIME") {
      var index = this.teams.findIndex(t => t.side === "DEFENSE")
      const round: RoundResult = {
        bomb_planted,
        kills,
        win_type,
        winning_team: index
      }
      this.rounds_played.push(round)

      const content = locales(this.locale, `- Spike was not planted on time\n - **${this.teams[index].name}** wins the round`)

      this.content += `${content}\n`

      const embed = new EmbedBuilder()
      .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
      .setDesc(this.content)
      await this.ctx.edit(embed.build())

      this.content = ""

      await this.wait(5000)
      return
    }
    else {
      while(
        this.teams[0].roster.some(p => p.alive) &&
        this.teams[1].roster.some(p => p.alive)
       ) {
        const {
          winner,
          loser
        } = this.startPlayerDuel()

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

        const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
        .setDesc(this.content)
        await this.ctx.edit(embed.build())

        var team1 = this.teams[0]
        var team2 = this.teams[1]

        // console.log(team1.roster.filter(p => p.alive).length, team2.roster.filter(p => p.alive).length)
      }
    }

    for(const kill of kills) {
      const content = locales(this.locale, `${this.teams[kill.killer_index].tag} ${kill.killer.name} killed ${this.teams[kill.victim_index].tag} ${kill.victim.name} with a Vandal`)
      this.content += `- ${content}\n`

      const embed = new EmbedBuilder()
      .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
      .setDesc(this.content)
      await this.ctx.edit(embed.build())

      await this.wait(1000)
    }

    var winning_team = this.teams[0].roster.filter(p => p.alive).length ? 0 : 1
    const round: RoundResult = {
      bomb_planted,
      kills,
      win_type,
      winning_team
    }

    this.rounds_played.push(round)

    const content = locales(this.locale, `- **${this.teams[winning_team].name}** won the round by eliminating the opposing team`)

    this.content += `${content}\n`
    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
    .setDesc(this.content)
    await this.ctx.edit(embed.build())

    this.content = ""
    await this.wait(5000)
    return
  }

  /**
   * starts a round
   */
  public async startRound() {
    if(this.rounds_played.length === 12) await this.switchSides()

    const score1 = this.rounds_played.filter(r => r.winning_team === 0).length
    const score2 = this.rounds_played.filter(r => r.winning_team === 1).length

    if(score1 >= 13 || score2 >= 13) {
      await this.finish()
      return true
    }

    for(const t of this.teams)
      for(const p of t.roster)
        p.alive = true

    const duels = Math.floor(Math.random() * 6)
    const round_number = this.rounds_played.length + 1

    const content = locales(this.locale, `*Round ${round_number} started*`)

    this.content += `${content}\n`

    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
    .setDesc(this.content)
    await this.ctx.edit(embed.build())

    await this.wait(5000)
    await this.firstStep(duels)
    return false
  }

  /**
   * calculate team ovr
   */
  private calcTeamOvr(i: number, only_alive_players?: boolean) {
    if(only_alive_players) {
      const total = this.teams[i].roster.filter(p => p.alive).reduce((sum, p) => sum + this.calcPlayerOvr(p), 0)

      return total / 5
    }
    else {
      const total = this.teams[i].roster.reduce((sum, p) => sum + this.calcPlayerOvr(p), 0)

      return total / 5
    }
  }

  /**
   * switch sides
   */
  public async switchSides() {
    for(const t of this.teams)
      if(t.side === "ATTACK") t.side = "DEFENSE"
      else t.side = "ATTACK"

    const content = locales(this.locale, `*Switch sides*`)

    this.content += `${content}\n`

    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
    .setDesc(this.content)

    await this.ctx.edit(embed.build())

    this.content = ""
    await this.wait(5000)
  }

  /**
   * finish the match
   */
  private async finish() {
    this.finished = true

    const score1 = this.rounds_played.filter(r => r.winning_team === 0).length
    const score2 = this.rounds_played.filter(r => r.winning_team === 1).length

    if(score1 >= 13) {
      await this.ctx.reply(`${this.teams[0].user} won the match`)
    }
    else if(score2 >= 13) {
      await this.ctx.reply(`${this.teams[1].user} won the match`)
    }
  }
}