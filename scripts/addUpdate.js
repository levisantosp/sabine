import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default async function(version, content) {
  if(!version) throw new Error('version is needed')
  if(!content || !content.length) throw new Error('content is needed')
  // if(!content.lang) throw new Error('lang is needed')
  // if(!content.title) throw new Error('title is needed')
  // if(!content.text) throw new Error('text is needed')
  if(await prisma.updates.findUnique({ where: { id: version } })) throw new Error('this version already exists')
  return await prisma.updates.create({
    data: {
      id: version,
      content,
      published_at: Date.now()
    }
  })
}