import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'

const prisma = new PrismaClient()
const updates = await prisma.updates.findMany()

export default async function(fastify: FastifyInstance) {
  fastify.get('/updates', () => {
    return updates
  })
}