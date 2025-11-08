import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const server = fastify()

await server.register(fastifyCors, {
  origin: true,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-dbl-signature'
  ]
})

for(const folder of readdirSync(path.resolve(__dirname, './routes'))) {
  for(const file of readdirSync(path.resolve(__dirname, `./routes/${folder}`))) {
    const route = await import(`./routes/${folder}/${file}`)

    await server.register(route)
  }
}

export {
  server
}