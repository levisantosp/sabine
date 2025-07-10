import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as Oceanic from 'oceanic.js'

export type Args = {
  [key: string]: string | Error | number | Oceanic.File[] | undefined | null
}
export default function(lang: string, content: string, args?: Args): string {
  const path = resolve(`src/locales/${lang}.json`)
  const raw = readFileSync(path, "utf-8")
  let json = JSON.parse(raw)
  for(const param of content.split('.')) {
    json = json[param]
    if(!json) return content
  }
  if(args) {
    for(const arg of Object.keys(args)) {
      json = json.replaceAll(`{${arg}}`, args[arg])
    }
  }
  return json
}