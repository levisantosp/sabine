import { Elysia } from 'elysia'
import { prisma } from '@db'

export const updates = new Elysia()
    .get(
        '/updates',
        async({ set }) => {
            const updates = await prisma.update.findMany({
                include: {
                    content: true
                }
            })

            set.status = 'OK'

            return updates
        }
    )