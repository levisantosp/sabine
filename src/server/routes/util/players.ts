import type { FastifyInstance } from 'fastify'
import getPlayers from '../../../simulator/valorant/players/getPlayers.ts'

export default function(fastify: FastifyInstance) {
  fastify.get('/players', () => {
    return getPlayers()
  })
}