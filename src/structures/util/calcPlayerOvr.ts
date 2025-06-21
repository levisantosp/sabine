export type Player = {
  id: number
  name: string
  collection: string
  team: string
  country: string
  role: string
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
  ovr?: number
  price?: number
}

export default function(player: Player) {
  return (player.aim + player.HS + player.movement + player.aggression + player.ACS + player.gamesense) / 4.5
}