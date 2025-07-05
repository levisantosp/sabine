import fastify from 'fastify'
import { readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const server = fastify()
for(const route of readdirSync(path.resolve(__dirname, './routes'))) {
  for(const file of readdirSync(path.resolve(__dirname, `./routes/${route}`))) {
    const r = await import(path.resolve(__dirname, `./routes/${route}/${file}`))
    await server.register(r)
  }
}

export {
  server
}