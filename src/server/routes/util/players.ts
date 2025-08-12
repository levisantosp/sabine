import type { FastifyInstance } from "fastify"
import { getPlayers } from "players"

export default function(fastify: FastifyInstance) {
  fastify.get("/players", () => {
    return getPlayers()
  })
}