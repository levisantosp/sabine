import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export default async function() {
  await prisma.user.updateMany({
    data: {
      warn: true
    }
  })
}