import type { preHandlerMetaHookHandler } from 'fastify/types/hooks.js'

export const auth: preHandlerMetaHookHandler = (req, res, done) => {
  if(req.headers.authorization !== process.env.AUTH) {
    return res.status(403).send({ error: 'Forbidden' })
  }

  return done()
}