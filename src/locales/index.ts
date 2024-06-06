export default function(lang: string, content: string, args?: any): string {
  let locale = require(`./locales-${lang}.js`)

  for(const file of content.split('.')) {
    locale = locale[file]
    if(!locale) return content
  }
  if(args) {
    for (const arg of Object.keys(args)) {
      locale = locale.replaceAll(`{${arg}}`, args[arg])
    }
  }
  return locale
}