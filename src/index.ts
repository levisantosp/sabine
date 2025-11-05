import { app } from './structures/app/App.ts'

await app.redis.connect()
await app.connect()