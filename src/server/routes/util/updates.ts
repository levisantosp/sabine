import type { FastifyInstance } from 'fastify'
import { prisma } from '../../../database/index.ts'

export default async function(fastify: FastifyInstance) {
  fastify.get('/updates', async() => {
    const updates = await prisma.update.findMany({
      include: {
        content: true
      }
    })

    return updates
  })
}