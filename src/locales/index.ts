import * as Oceanic from 'oceanic.js'
import pt from './pt.json' with { type: 'json' }
import en from './en.json' with { type: 'json' }

export type Args = {
  [key: string]: string | Error | number | Oceanic.File[] | undefined | null | bigint
}

export type Content = Keys<Locale> | (string & {})

type Locale = typeof en

type Keys<T> = T extends object
  ? {[K in keyof T]: K extends string 
      ? T[K] extends object 
        ? `${K}.${Keys<T[K]>}`
        : K
      : never
    }[keyof T]
  : never

const locale: {
  [key: string]: any
} = {
  en,
  pt
}

export default function t<T extends Content>(lang: string, content: T, args?: Args): string {
  let json = locale[lang]

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