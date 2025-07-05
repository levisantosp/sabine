import type { Player } from './calcPlayerOvr.ts'

export default function(player: Player, devalue?: boolean) {
  if(devalue) {
    const price = ((player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) * 500) * 0.2
    return parseInt(price.toString())
  }
  const price = (player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) * 500
  return parseInt(price.toString())
}