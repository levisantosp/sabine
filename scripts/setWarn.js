import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default async function() {
  await prisma.users.updateMany({
    data: {
      warn: true
    }
  })
}