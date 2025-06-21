import getPlayers from "./getPlayers.js"

export default function(playerID: number) {
  return getPlayers().find(p => p.id === playerID)
}