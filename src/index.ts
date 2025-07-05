import { client } from './structures/client/App.ts'
import { server } from './server/index.ts'

await client.connect()
server.listen({
  host: process.env.HOST,
  port: process.env.PORT ?? 3001
})