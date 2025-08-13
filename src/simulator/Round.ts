import { valorant_agents, valorant_maps } from "../config.ts"
import EmbedBuilder from "../structures/builders/EmbedBuilder.ts"
import Match from "./Match.ts"
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
          teamIndex,
          index: pIndex,
          teamCredits: this.teams[teamIndex].roster.reduce((sum, p) => sum + p.credits, 0) / 5,
          stats: p
        })
        player.buy()
        this.teams[teamIndex].roster[pIndex].credits = player.credits
        this.teams[teamIndex].roster[pIndex].weapon = player.weapon
      }
    }
  }
}