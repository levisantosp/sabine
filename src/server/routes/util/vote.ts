import { Elysia, t } from 'elysia'
import { SabineUser } from '@db'
import { auth } from '../../auth'

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

export const vote = new Elysia()
    .post(
        '/vote',
        async ({ body, set }) => {
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

            const user = await SabineUser.fetch(body.id) ?? new SabineUser(body.id)

            await user.addPack(pack, true)

            set.status = 'OK'

            return { ok: true }
        },
        {
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
    )