import { Player } from "./calcPlayerOvr.js"

export default function(player: Player) {
  const price = (player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) * 500
  return parseInt(price.toString())
}