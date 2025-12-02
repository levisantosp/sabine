import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { lolLive } from './routes/lol/live'
import { lolResults } from './routes/lol/results'
import { valorantLive } from './routes/valorant/live'
import { news } from './routes/valorant/news'
import { valorantResults } from './routes/valorant/results'
import { commands } from './routes/util/commands'
import { players } from './routes/util/players'
import { updates } from './routes/util/updates'
import { vote } from './routes/util/vote'

export const server = new Elysia()
    .use(cors({
        origin: true,
        methods: ['POST', 'GET', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'x-dbl-signature',
        ]
    }))
    .use(lolLive)
    .use(lolResults)
    .use(valorantLive)
    .use(news)
    .use(valorantResults)
    .use(commands)
    .use(players)
    .use(updates)
    .use(vote)