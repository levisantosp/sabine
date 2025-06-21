import fs from "fs"

type Player = {
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
}

export default function<T extends Player[]>() {
  const lines = fs.readFileSync("data.csv").toString().split("\n")
  const headers = lines.shift()!.split(",")
  const data = []
  for(let i = 0; i < lines.length; i++) {
    const obj: Record<string, string | number> = {}
    const values = lines[i].split(",")
    for(let i = 0; i < values.length; i++) {
      var value: string | number = values[i]
      if(!isNaN(Number(value))) {
        value = Number(values[i])
      }
      obj[headers[i]] = value
    }
    data.push(obj)
  }
  return data as T
}