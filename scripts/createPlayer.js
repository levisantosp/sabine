import fs from "fs"
import getPlayers from "./getPlayers.js"

export default function(data) {
  var players = getPlayers()
  var id = players.length + 1
  var csv = data.map(row => `${id++},${row.join(",")}`).join("\n")
  fs.appendFileSync("data.csv", `\n${csv}`, "utf-8")
  console.log("players added")
}