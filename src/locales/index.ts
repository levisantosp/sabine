import { File } from "oceanic.js"

export type Args = {
  [key: string]: string | Error | number | File[];
}
export default function(lang: string, content: string, args?: Args): string {
  let locale = require(`./${lang}`);
  for(const param of content.split(".")) {
    locale = locale[param]
    if(!locale) return content;
  }
  if(args) {
    for(const arg of Object.keys(args)) {
      locale = locale.replaceAll(`{${arg}}`, args[arg]);
    }
  }
  return locale;
}