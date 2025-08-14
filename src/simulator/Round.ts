import { valorant_agents, valorant_maps } from "../config.ts"
import EmbedBuilder from "../structures/builders/EmbedBuilder.ts"
import Match, { type TeamRoster, type KillEvent } from "./Match.ts"
import Player from "./Player.ts"

export default class Round extends Match {
  public override async start() {
    if(this.rounds.length === this.switchSidesAt) {
      return await this.switchSides()
    }
    const score1 = this.rounds.filter(r => r.winning_team === 0).length
    const score2 = this.rounds.filter(r => r.winning_team === 1).length
    // fazer a logica de terminar a partida aqui
    
    this.content += this.t("simulator.processing")
    const embed = new EmbedBuilder()
    .setTitle(this.t("simulator.mode.ranked"))
    .setDesc(this.content)
    .setImage(valorant_maps.find(map => map.name === "Ascent")!.image)
    .setFields(
      {
        name: this.teams[0].name,
        value: this.teams[0].roster
          .map(player => `${valorant_agents.find(a => a.name === player.agent.name)!.emoji} ${player.name} (${parseInt(player.ovr.toString())})`)
          .join("\n"),
        inline: true
      },
      {
        name: this.teams[1].name,
        value: this.teams[1].roster
          .map(player => `${valorant_agents.find(a => a.name === player.agent.name)!.emoji} ${player.name} (${parseInt(player.ovr.toString())})`)
          .join("\n"),
        inline: true
      }
    )
    await this.ctx.edit(embed.build())
    for(let teamIndex = 0; teamIndex < this.teams.length; teamIndex++) {
      for(let pIndex = 0; pIndex < this.teams[teamIndex].roster.length; pIndex++) {
        const p = this.teams[teamIndex].roster[pIndex]
        const player = new Player({
          name: p.name,
          life: p.life,
          credits: p.credits,
          weapon: {
            melee: {
              damage: {
                head: 50,
                chest: 50
              }
            }
          },
          teamCredits: this.teams[teamIndex].roster.reduce((sum, p) => sum + p.credits, 0) / 5,
          stats: p
        })
        player.buy()
        this.teams[teamIndex].roster[pIndex].credits = player.credits
        this.teams[teamIndex].roster[pIndex].weapon = player.weapon
      }
      console.log("-------------------------------------------")
    }
    await this.wait(5000)
    await this.firstStep(Math.floor(Math.random() * 6))
  }
  private async firstStep(duels: number) {
    this.startPlayerDuel()
    // const kills: KillEvent[] = []
    // for(let i = 0; i < duels; i++) {
    //   this.startPlayerDuel()
    // }
  }
  private startPlayerDuel() {
    const player1 = this.choosePlayer(this.teams[0].roster, 0, p => p.aggression * 5)
    const player2 = this.choosePlayer(this.teams[1].roster, 1, p => p.aggression * 5)
    this.chooseWinner(player1, player2, p => p.aggression)
  }
  private chooseWinner(player1: Player, player2: Player, weightFun: (item: TeamRoster) => number) {
    player1.shoot()
  }
  private choosePlayer(items: TeamRoster[], index: number, weightFun: (item: TeamRoster) => number) {
    const weight = items.reduce((sum, i) => sum + weightFun(i), 0)
    let random = Math.random() * weight
    for(const item of items) {
      random -= weightFun(item)
      if(random <= 0) {
        const player = new Player({
          name: item.name,
          life: item.life,
          credits: item.credits,
          weapon: item.weapon!,
          teamCredits: this.teams[index].roster.reduce((sum, p) => sum + p.credits, 0) / 5,
          stats: item
        })
        return player
      }
    }
    const player = new Player({
      name: items[items.length -1].name,
      life: items[items.length -1].life,
      credits: items[items.length -1].credits,
      weapon: items[items.length -1].weapon!,
      teamCredits: this.teams[index].roster.reduce((sum, p) => sum + p.credits, 0) / 5,
      stats: items[items.length -1]
    })
    return player
  }
}