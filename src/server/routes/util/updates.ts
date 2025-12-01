import type { FastifyInstance } from 'fastify'
import { prisma } from '@db'

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