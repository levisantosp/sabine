import { Type as t, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'
import { auth } from '../../auth'
import { SabineUser } from '@db'

export type Pack =
    | 'IRON' // 59-
    | 'BRONZE' // 60-66
    | 'SILVER' // 67-72
    | 'GOLD' // 73-77
    | 'PLATINUM' // 78-82
    | 'DIAMOND' // 83-86
    | 'ASCENDANT' // 87-90
    | 'IMMORTAL' // 91-94
    | 'RADIANT' // 95+

export default function(fastify: FastifyInstance) {
  fastify.withTypeProvider<TypeBoxTypeProvider>()
    .addHook('preHandler', auth)
    .post('/vote', {
        schema: {
            body: t.Object({
                admin: t.Boolean(),
                avatar: t.String(),
                username: t.String(),
                id: t.String(),
                discriminator: t.Optional(t.String()),
                promotable_bot: t.Optional(t.String()),
                promotable_server: t.Optional(t.Object({
                    icon: t.String(),
                    id: t.String(),
                    name: t.String()
                })),
                roblox: t.Optional(t.Boolean()),
                stripe: t.Optional(t.Boolean())
            })
        }
    }, async(req, reply) => {
        const random = Math.random() * 100
        const pack: Pack =
        random < 0.5 ? 'RADIANT'
            : random < 2.0 ? 'IMMORTAL'
                : random < 5.0 ? 'ASCENDANT'
                    : random < 20.0 ? 'DIAMOND'
                        : random < 50.0 ? 'PLATINUM'
                            : random < 70.0 ? 'GOLD'
                                : random < 85.0 ? 'SILVER'
                                    : random < 95.0 ? 'BRONZE'
                                        : 'IRON'

        const user = await SabineUser.fetch(req.body.id) ?? new SabineUser(req.body.id)

        await user.addPack(pack, true)

        return reply.code(200).send({ success: true })
    })
}