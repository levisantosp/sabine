import { valorant_agents, valorant_weapons } from "../../config.js"
import CommandContext from "../../structures/command/CommandContext.js"
import locales from "../../locales/index.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"
import getPlayer from "./players/getPlayer.js"
import { User } from "../../database/index.js"

const calcPlayerOvr = (player: TeamPlayer) => {
  return (player.stats.aim + player.stats.HS + player.stats.movement + player.stats.aggression + player.stats.ACS + player.stats.gamesense) / 4.5
}
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
export type Team = {
  user: TeamUser
  roster: string[]
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
  __teams: Team[]
  ctx: CommandContext
  locale: string
}
type TeamUser = {
  name: string
  id: string
}
type PrivateTeam = {
  user: TeamUser
  roster: TeamPlayer[]
  side?: "DEFENSE" | "ATTACK"
  lost_round_streak: number
  name: string
  tag: string
}

export default class ValorantMatch {
  public id: number = 0
  private rounds_played: RoundResult[] = []
  public __teams: Team[] = []
  private teams: PrivateTeam[] = []
  public finished: boolean = false
  private ctx: CommandContext
  private content: string = ""
  private locale: string
  public constructor(options: MatchOptions) {
    this.__teams = options.__teams
    this.ctx = options.ctx
    this.locale = options.locale
  }
  private setTeams() {
    const sides: Array<"ATTACK" | "DEFENSE"> = ["ATTACK", "DEFENSE"]
    let side = sides[Math.floor(Math.random() * sides.length)]
    let i = 0
    for(const t of this.__teams) {
      let roster: TeamPlayer[] = []
      for(const p of t.roster) {
        const player = getPlayer(Number(p))!
        roster.push({
          id: player.id.toString(),
          alive: true,
          name: player.name,
          role: player.role as TeamPlayer["role"],
          stats: {
            aim: player.aim,
            HS: player.HS,
            movement: player.movement,
            aggression: player.aggression,
            ACS: player.ACS,
            gamesense: player.gamesense
          },
          credits: 800
        })
      }
      if(i === 0) {
        if(side === "ATTACK") side = "DEFENSE"
        else side = "ATTACK"
      }
      this.teams.push({
        user: t.user,
        side,
        roster,
        lost_round_streak: 0,
        name: t.name,
        tag: t.tag
      })
      roster = []
    }
  }
  public async wait(t: number) {
    return await new Promise(r => setTimeout(r, t))
  }
  public setContent(content: string) {
    this.content = content
  }
  private startPlayerDuel() {
    const roles: TeamPlayer["role"][] = ["controller", "duelist", "flex", "initiator", "sentinel"]
    const weights = [5, 15, 30, 50, 10]
    const pick1 = this.choosePlayer(roles, weights)
    const pick2 = this.choosePlayer(roles, weights)
    let player1 = this.teams[0].roster.filter(p => p.alive && p.role === pick1)[0]
    if(!player1) {
      let roster = this.teams[0].roster.filter(p => p.alive)
      player1 = roster[Math.floor(Math.random() * roster.length)]
    }
    let player2 = this.teams[1].roster.filter(p => p.alive && p.role === pick2)[0]
    if(!player2) {
      let roster = this.teams[1].roster.filter(p => p.alive)
      player2 = roster[Math.floor(Math.random() * roster.length)]
    }
    const prob = this.calcDuelProb(player1, player2)
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
  private choosePlayer(array: string[], weights: number[]) {
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
  private async firstStep(duels: number) {
    const kills: KillEvent[] = []
    for(let i = 0; i < duels; i++) {
      const {
        winner,
        loser,
        winner_index,
        loser_index
      } = this.startPlayerDuel()
      const players = [...this.teams[0].roster, ...this.teams[1].roster]
      const __winner = players.find(p => p.id === winner)!
      const __loser = players.find(p => p.id === loser)!
      kills.push({
        killer: __winner,
        killer_index: winner_index,
        victim: __loser,
        victim_index: loser_index,
        weapon: __winner.weapon!
      })
    }
    for(const kill of kills) {
      const content = locales(
        this.locale, "simulator.kill",
        {
          t1: this.teams[kill.killer_index].tag,
          p1: kill.killer.name,
          t2: this.teams[kill.victim_index].tag,
          p2: kill.victim.name,
          w: kill.weapon
        }
      )
      this.content += `- ${content}\n`
      const embed = new EmbedBuilder()
        .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
        .setDesc(this.content)
        .setField(
          locales(this.locale, "simulator.sides.name"),
          locales(this.locale, "simulator.sides.value", {
            attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
            defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
          })
        )
      await this.ctx.edit(embed.build())
      await this.wait(1000)
    }
    const team1_alive = this.teams[0].roster.filter(p => p.alive).length > 0
    const team2_alive = this.teams[1].roster.filter(p => p.alive).length > 0
    if(!team1_alive || !team2_alive) {
      let winning_team = team1_alive ? 0 : 1
      this.rounds_played.push({
        winning_team: winning_team,
        win_type: "ELIMINATION",
        kills
      })
      const content = locales(
        this.locale, "simulator.won_by_elimination",
        {
          t: this.teams[winning_team].name
        }
      )
      this.content += `${content}\n`
      const embed = new EmbedBuilder()
      .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
      .setDesc(this.content)
      .setField(
        locales(this.locale, "simulator.sides.name"),
        locales(this.locale, "simulator.sides.value", {
          attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
          defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
        })
      )
      this.content = ""
      await this.ctx.edit(embed.build())
      await this.wait(2000)
      return
    }
    else {
      let bomb_planted = Math.random() < 0.8
      if(bomb_planted) {
        const bomb = ["A", "B"][Math.floor(Math.random() * 2)]
        const content = locales(
          this.locale,
          "simulator.spike_planted",
          {
            bomb
          }
        )
        this.content += `${content}\n`
        const embed = new EmbedBuilder()
          .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
          .setDesc(this.content)
          .setField(
            locales(this.locale, "simulator.sides.name"),
            locales(this.locale, "simulator.sides.value", {
              attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
              defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
            })
          )
        await this.ctx.edit(embed.build())
        await this.wait(2000)
        return await this.secondStep(true)
      }
      else {
        await this.secondStep()
      }
    }
  }
  public async secondStep(bomb_planted?: boolean) {
    const kills: KillEvent[] = []
    let attack_index = this.teams.findIndex(t => t.side === "ATTACK")
    let defense_index = this.teams.findIndex(t => t.side === "DEFENSE")
    let attack_ovr = this.calcTeamOvr(attack_index, true)
    let defense_ovr = this.calcTeamOvr(defense_index, true)
    let total_ovr = attack_ovr + defense_ovr
    let win_types_weights = {
      BOMB: 0.4 * attack_ovr / total_ovr,
      DEFUSE: 0.4 * defense_ovr / total_ovr,
      TIME: 0.2 * defense_ovr / total_ovr,
      ELIMINATION: 0.3 * Math.max(attack_ovr, defense_ovr) / total_ovr
    }
    let win_types: RoundResult["win_type"][] = []
    for(const [type, weight] of Object.entries(win_types_weights)) {
      if(bomb_planted && type === "TIME") continue
      if(!bomb_planted && ["BOMB", "DEFUSE"].includes(type)) continue
      for(let i = 0; i < weight * 100; i++) {
        win_types.push(type as RoundResult["win_type"])
      }
    }
    let win_type = win_types[Math.floor(Math.random() * win_types.length)]
    if(
      win_type === "BOMB"
      ||
      win_type === "DEFUSE"
    ) {
      let duels = Math.floor(
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
          loser,
          winner_index,
          loser_index
        } = this.startPlayerDuel()
        const allPlayers = [
          ...this.teams[0].roster,
          ...this.teams[1].roster
        ]
        const __winner = allPlayers.find(p => p.id === winner)!
        const __loser = allPlayers.find(p => p.id === loser)!
        kills.push({
          killer: __winner,
          killer_index: winner_index,
          victim: __loser,
          victim_index: loser_index,
          weapon: __winner.weapon!
        })
      }
      if(win_type === "DEFUSE") {
        let winning_team = this.teams.findIndex(t => t.side === "DEFENSE")
        const round: RoundResult = {
          bomb_planted,
          kills,
          win_type,
          winning_team
        }
        let index = this.teams.findIndex(t => t.side === "DEFENSE")
        this.rounds_played.push(round)
        let i = this.teams.findIndex(t => t.side === "DEFENSE")
        this.teams[i].lost_round_streak += 1
        this.teams[index].lost_round_streak -= 1
        if(this.teams[i].lost_round_streak > 5) {
          this.teams[i].lost_round_streak = 5
        }
        if(this.teams[index].lost_round_streak < 0) {
          this.teams[index].lost_round_streak = 0
        }
        for(const player of this.teams[index].roster) {
          let credits = 3000
          const __kills = kills.filter(k => k.killer.id === player.id)
          let bonus = __kills.length * 300
          player.credits += credits + bonus
        }
        for(const player of this.teams[i].roster) {
          let credits = 800
          let bonus = 100 * this.teams[i].lost_round_streak
          player.credits += credits + bonus
        }
        const content = locales(
          this.locale,
          "simulator.spike_defused",
          {
            team: this.teams[index].name
          }
        )
        this.content += `${content}\n`
        const embed = new EmbedBuilder()
          .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
          .setDesc(this.content)
          .setField(
            locales(this.locale, "simulator.sides.name"),
            locales(this.locale, "simulator.sides.value", {
              attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
              defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
            })
          )
        await this.ctx.edit(embed.build())
        this.content = ""
        await this.wait(2000)
        return
      }
      else {
        let index = this.teams.findIndex(t => t.side === "ATTACK")
        const round: RoundResult = {
          bomb_planted,
          kills,
          win_type,
          winning_team: index
        }
        this.rounds_played.push(round)
        let i = this.teams.findIndex(t => t.side === "DEFENSE")
        this.teams[i].lost_round_streak += 1
        this.teams[index].lost_round_streak -= 1
        if(this.teams[i].lost_round_streak > 5) {
          this.teams[i].lost_round_streak = 5
        }
        if(this.teams[index].lost_round_streak < 0) {
          this.teams[index].lost_round_streak = 0
        }
        for(const player of this.teams[index].roster) {
          let credits = 3000
          const __kills = kills.filter(k => k.killer.id === player.id)
          let bonus = __kills.length * 300
          player.credits += credits + bonus
        }
        for(const player of this.teams[i].roster) {
          let credits = 800
          let bonus = 100 * this.teams[i].lost_round_streak
          player.credits += credits + bonus
        }
        const content = locales(
          this.locale,
          "simulator.spike_detonated",
          {
            team: this.teams[index].name
          }
        )
        this.content += `${content}\n`
        const embed = new EmbedBuilder()
          .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
          .setDesc(this.content)
          .setField(
            locales(this.locale, "simulator.sides.name"),
            locales(this.locale, "simulator.sides.value", {
              attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
              defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
            })
          )
        await this.ctx.edit(embed.build())
        this.content = ""
        await this.wait(2000)
        return
      }
    }
    else if(win_type === "TIME") {
      let index = this.teams.findIndex(t => t.side === "DEFENSE")
      const round: RoundResult = {
        bomb_planted,
        kills,
        win_type,
        winning_team: index
      }
      this.rounds_played.push(round)
      let i = this.teams.findIndex(t => t.side === "ATTACK")
      this.teams[i].lost_round_streak += 1
      this.teams[index].lost_round_streak -= 1
      if(this.teams[i].lost_round_streak > 5) {
        this.teams[i].lost_round_streak = 5
      }
      if(this.teams[index].lost_round_streak < 0) {
        this.teams[index].lost_round_streak = 0
      }
      for(const player of this.teams[index].roster) {
        let credits = 3000
        const __kills = kills.filter(k => k.killer.id === player.id)
        let bonus = __kills.length * 300
        player.credits += credits + bonus
      }
      for(const player of this.teams[i].roster) {
        let credits = 800
        let bonus = 100 * this.teams[i].lost_round_streak
        player.credits += credits + bonus
      }
      const content = locales(
        this.locale,
        "simulator.spike_not_planted",
        {
          team: this.teams[index].name
        }
      )
      this.content += `${content}\n`
      const embed = new EmbedBuilder()
      .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
      .setDesc(this.content)
      .setField(
        locales(this.locale, "simulator.sides.name"),
        locales(this.locale, "simulator.sides.value", {
          attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
          defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
        })
      )
      await this.ctx.edit(embed.build())
      this.content = ""
      await this.wait(2000)
      return
    }
    else {
      while(
        this.teams[0].roster.some(p => p.alive) &&
        this.teams[1].roster.some(p => p.alive)
       ) {
        const {
          winner,
          loser,
          winner_index,
          loser_index
        } = this.startPlayerDuel()
        const allPlayers = [
          ...this.teams[0].roster,
          ...this.teams[1].roster
        ]
        const __winner = allPlayers.find(p => p.id === winner)!
        const __loser = allPlayers.find(p => p.id === loser)!
        kills.push({
          killer: __winner,
          killer_index: winner_index,
          victim: __loser,
          victim_index: loser_index,
          weapon: __winner.weapon!
        })
        const embed = new EmbedBuilder()
          .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
          .setDesc(this.content)
          .setField(
            locales(this.locale, "simulator.sides.name"),
            locales(this.locale, "simulator.sides.value", {
              attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
              defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
            })
          )
        await this.ctx.edit(embed.build())
      }
    }
    for(const kill of kills) {
      const content = locales(
        this.locale, "simulator.kill",
        {
          t1: this.teams[kill.killer_index].tag,
          p1: kill.killer.name,
          t2: this.teams[kill.victim_index].tag,
          p2: kill.victim.name,
          w: kill.weapon
        }
      )
      this.content += `- ${content}\n`
      const embed = new EmbedBuilder()
      .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
      .setDesc(this.content)
      .setField(
        locales(this.locale, "simulator.sides.name"),
        locales(this.locale, "simulator.sides.value", {
          attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
          defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
        })
      )
      await this.ctx.edit(embed.build())
      await this.wait(1000)
    }
    let winning_team = this.teams[0].roster.filter(p => p.alive).length ? 0 : 1
    let loser_team = winning_team === 1 ? 0 : 1
    const round: RoundResult = {
      bomb_planted,
      kills,
      win_type,
      winning_team
    }
    this.rounds_played.push(round)
    this.teams[loser_team].lost_round_streak += 1
    this.teams[winning_team].lost_round_streak -= 1
    if(this.teams[loser_team].lost_round_streak > 5) {
      this.teams[loser_team].lost_round_streak = 5
    }
    if(this.teams[winning_team].lost_round_streak < 0) {
      this.teams[winning_team].lost_round_streak = 0
    }
    for(const player of this.teams[winning_team].roster) {
      let credits = 200
      const __kills = kills.filter(k => k.killer.id === player.id)
      let bonus = __kills.length * 150
      player.credits += credits + bonus
    }
    for(const player of this.teams[loser_team].roster) {
      let credits = 800
      let bonus = 100 * this.teams[winning_team].lost_round_streak
      player.credits += credits + bonus
    }
    const content = locales(
      this.locale,
      "simulator.won_by_elimination",
      {
        t: this.teams[winning_team].name
      }
    )
    this.content += `${content}\n`
    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
    .setDesc(this.content)
    .setField(
      locales(this.locale, "simulator.sides.name"),
      locales(this.locale, "simulator.sides.value", {
        attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
        defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
      })
    )
    await this.ctx.edit(embed.build())
    this.content = ""
    await this.wait(2000)
    return
  }
  private shouldBuy(team: PrivateTeam) {
    const avgCredits = team.roster.reduce((sum, p) => sum + p.credits, 0) / 5
    return avgCredits >= 3000 || team.lost_round_streak >= 4
  }
  private shouldEco(team: PrivateTeam) {
    const avgCredits = team.roster.reduce((sum, p) => sum + p.credits, 0) / 5
    return avgCredits <= 1200 || team.lost_round_streak <= 1
  }
  public async startRound() {
    if(!this.teams.length) {
      this.setTeams()
    }
    if(this.rounds_played.length === 12) {
      await this.switchSides()
      for(const t of this.teams) {
        for(let i = 0; i < t.roster.length; i++) {
          t.roster[i].credits = 800
        }
      }
    }
    for(const t of this.teams) {
      for(const p of t.roster) {
        let weapon = this.buyWeapon(p.credits, p.role, "ECO")
        if(this.shouldBuy(t)) {
          weapon = this.buyWeapon(p.credits, p.role, "FULL")
        }
        else if(this.shouldEco(t)) {
          weapon = this.buyWeapon(p.credits, p.role, "ECO")
        }
        else {
          weapon = this.buyWeapon(p.credits, p.role, "NORMAL")
        }
        p.weapon = weapon.name
        p.credits -= weapon.price
      }
    }
    const score1 = this.rounds_played.filter(r => r.winning_team === 0).length
    const score2 = this.rounds_played.filter(r => r.winning_team === 1).length
    if(score1 >= 13 || score2 >= 13) {
      await this.finish()
      return
    }
    for(const t of this.teams)
      for(const p of t.roster)
        p.alive = true
    const duels = Math.floor(Math.random() * 6)
    const round_number = this.rounds_played.length + 1
    const content = locales(this.locale, "simulator.round_started", { n: round_number })
    this.content += `${content}\n`
    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
    .setDesc(this.content)
    .setField(
      locales(this.locale, "simulator.sides.name"),
      locales(this.locale, "simulator.sides.value", {
        attack: this.teams.filter(t => t.side === "ATTACK").map(t => `<@${t.user.id}>`).join(""),
        defense: this.teams.filter(t => t.side === "DEFENSE").map(t => `<@${t.user.id}>`).join("")
      })
    )
    await this.ctx.edit(embed.build())
    await this.wait(2000)
    await this.firstStep(duels)
    return
  }
  private calcDuelProb(player1: TeamPlayer, player2: TeamPlayer) {
    const ovr_weight = 0.7
    const weapon_weight = 0.3
    const ovr1 = calcPlayerOvr(player1)
    const ovr2 = calcPlayerOvr(player2)
    const weapon1 = valorant_weapons.find(w => w.name === player1.weapon)!
    const weapon2 = valorant_weapons.find(w => w.name === player2.weapon)!
    const weaponEffectiveness1 = (weapon1.damage * 0.7) + (weapon1.price * 0.3)
    const weaponEffectiveness2 = (weapon2.damage * 0.7) + (weapon2.price * 0.3)
    const maxWeaponEffectiveness = Math.max(
      ...valorant_weapons.map(w => (w.damage * 0.7) + (w.price * 0.3))
    )
    const normalizedWeapon1 = (weaponEffectiveness1 / maxWeaponEffectiveness) * 100
    const normalizedWeapon2 = (weaponEffectiveness2 / maxWeaponEffectiveness) * 100
    const advantage1 = (ovr1 * ovr_weight) + (normalizedWeapon1 * weapon_weight)
    const advantage2 = (ovr2 * ovr_weight) + (normalizedWeapon2 * weapon_weight)
    const diff = (advantage1 - advantage2) / 100
    return 1 / (1 + Math.exp(-diff * 5))
  }
  private buyWeapon(credits: number, role: "initiator" | "controller" | "duelist" | "sentinel" | "flex", buy_type: "ECO" | "FULL" | "NORMAL") {
    let tiers = [
      {
        weapons: ["Vandal", "Phantom", "Operator", "Odin", "Guardian", "Bulldog"],
        minCredits: 2050 
      },
      {
        weapons: ["Spectre", "Ares", "Judge", "Marshal", "Outlaw"],
        minCredits: 950
      },
      {
        weapons: ["Sheriff", "Ghost", "Frenzy", "Shorty"],
        minCredits: 200
      },
      {
        weapons: ["Classic"],
        minCredits: 0
      }
    ]
    if(buy_type === "FULL" && credits >= 950) {
      tiers = tiers.filter(w => w.minCredits >= 950)
    }
    if(buy_type === "ECO") {
      tiers = tiers.filter(w => w.minCredits <= 950)
    }
    for(const tier of tiers) {
      if(credits >= tier.minCredits) {
        const weapons = valorant_weapons.filter(w => tier.weapons.includes(w.name) && w.price <= credits)
        const maxPrice = Math.max(...weapons.map(w => w.price))
        const bestW = weapons.filter(w => w.price <= maxPrice)
        const preferences: Record<string, typeof valorant_weapons[number]["name"][]> = {
          duelist: ["Vandal", "Phantom", "Operator", "Outlaw", "Marshal", "Sheriff"],
          controller: ["Phantom", "Vandal", "Guardian", "Ghost", "Classic", "Sheriff"],
          initiator: ["Phantom", "Vandal", "Guardian", "Bulldog", "Judge", "Bucky", "Ghost", "Sheriff"],
          flex: ["Vandal", "Phantom", "Guardian", "Bulldog", "Judge", "Bucky", "Ghost", "Sheriff"],
          sentinel: ["Vandal", "Phantom", "Guardian", "Ghost", "Sheriff"]
        }
        const preferred = bestW.filter(w => preferences[role].includes(w.name))
        if(preferred.length) {
          return preferred[Math.floor(Math.random() * preferred.length)]
        }
        return bestW[Math.floor(Math.random() * bestW.length)]
      }
    }
    return valorant_weapons.find(w => w.name === "Classic")!
  }
  private calcTeamOvr(i: number, only_alive_players?: boolean) {
    if(only_alive_players) {
      const total = this.teams[i].roster.filter(p => p.alive).reduce((sum, p) => sum + calcPlayerOvr(p), 0)
      return total / 5
    }
    else {
      const total = this.teams[i].roster.reduce((sum, p) => sum + calcPlayerOvr(p), 0)
      return total / 5
    }
  }
  public async switchSides() {
    for(const t of this.teams)
      if(t.side === "ATTACK") t.side = "DEFENSE"
      else t.side = "ATTACK"
    const content = locales(this.locale, "simulator.switch_sides")
    this.content += `${content}\n`
    const embed = new EmbedBuilder()
    .setTitle(`${this.teams[0].name} ${this.rounds_played.filter(r => r.winning_team === 0).length} <:versus:1349105624180330516> ${this.rounds_played.filter(r => r.winning_team === 1).length} ${this.teams[1].name}`)
    .setDesc(this.content)
    await this.ctx.edit(embed.build())
    this.content = ""
    await this.wait(2000)
  }
  private async finish() {
    this.finished = true
    const score1 = this.rounds_played.filter(r => r.winning_team === 0).length
    const score2 = this.rounds_played.filter(r => r.winning_team === 1).length
    const user1 = await User.get(this.teams[0].user.id)
    const user2 = await User.get(this.teams[1].user.id)
    if(score1 >= 13) {
      user1.wins += 1
      user2.defeats += 1
      await this.ctx.reply("simulator.winner", { user: `<@${this.teams[0].user.id}>` })
    }
    else if(score2 >= 13) {
      user1.defeats += 1
      user2.wins += 1
      await this.ctx.reply("simulator.winner", { user: `<@${this.teams[1].user.id}>` })
    }
    user1.career.push({
      teams: [
        {
          user: this.teams[0].user.id,
          score: score1
        },
        {
          user: this.teams[1].user.id,
          score: score2
        }
      ]
    })
    user2.career.push({
      teams: [
        {
          user: this.teams[1].user.id,
          score: score2
        },
        {
          user: this.teams[0].user.id,
          score: score1
        }
      ]
    })
    await user1.save()
    await user2.save()
  }
}