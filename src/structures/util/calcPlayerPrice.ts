import type { Player } from './calcPlayerOvr.ts'

export default function(player: Player, devalue?: boolean) {
  if(devalue) {
    let price: number
    if(player.collection === 'BASE') {
      price = ((player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) * 500) * 0.1
    }
    else price = ((player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) * 500 * 3) * 0.1
    return parseInt(price.toString())
  }
  let price: number
  if(player.collection === 'BASE') {
    price = ((player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) * 500)
  }
  else price = ((player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) * 500 * 3)
  return parseInt(price.toString())
}