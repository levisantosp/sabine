import { PrismaClient } from "@prisma/client"
import type { FastifyInstance } from "fastify"

const prisma = new PrismaClient()

export default async function(fastify: FastifyInstance) {
  fastify.get("/updates", async() => {
    const updates = await prisma.update.findMany({
      include: {
        content: true
      }
    })
    return updates
  })
}