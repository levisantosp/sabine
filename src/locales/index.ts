import { readFileSync } from "node:fs"
import path from "node:path"
import * as Oceanic from "oceanic.js"

export type Args = {
  [key: string]: string | Error | number | Oceanic.File[] | undefined | null | bigint
}
const locale: {
  [key: string]: any
} = {
  en: JSON.parse(
    readFileSync(path.resolve(`src/locales/en.json`), "utf-8")
  ),
  pt: JSON.parse(
    readFileSync(path.resolve(`src/locales/pt.json`), "utf-8")
  )
}

export default function t(lang: string, content: string, args?: Args): string {
  let json = locale[lang]
  for(const param of content.split(".")) {
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