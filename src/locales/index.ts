import { createRequire } from "module"
import * as Oceanic from "oceanic.js"

export type Args = {
  [key: string]: string | Error | number | Oceanic.File[] | undefined | null
}
const require = createRequire(import.meta.url)
export default function(lang: string, content: string, args?: Args): string {
  let locale = require(`./${lang}.ts`)
  for(const param of content.split(".")) {
    locale = locale[param]
    if(!locale) return content
  }
  if(args) {
    for(const arg of Object.keys(args)) {
      locale = locale.replaceAll(`{${arg}}`, args[arg])
    }
  }
  return locale
}