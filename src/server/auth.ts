import { Elysia } from 'elysia'

export const auth = new Elysia()
    .onBeforeHandle({ as: 'scoped' }, ({ headers, set }) => {
        if(headers.authorization !== process.env.AUTH) {
            set.status = 'Unauthorized'

            return { message: 'Unauthorized' }
        }
    })