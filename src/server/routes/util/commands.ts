import type { FastifyInstance } from 'fastify'
import { app } from '../../../structures/app/App.ts'

export default async function (fastify: FastifyInstance) {
  fastify.get('/commands', async () => {
    type Command = Pick<
      typeof client.commands extends Map<any, infer V> ? V : never,
      | 'name'
      | 'nameLocalizations'
      | 'description'
      | 'descriptionLocalizations'
      | 'syntax'
      | 'syntaxes'
      | 'examples'
      | 'permissions'
      | 'botPermissions'
    >

    const commands: Command[] = []

    client.commands.forEach(command => {
      commands.push({
        name: command.name,
        nameLocalizations: command.nameLocalizations,
        description: command.description,
        descriptionLocalizations: command.descriptionLocalizations,
        syntax: command.syntax,
        syntaxes: command.syntaxes,
        examples: command.examples,
        permissions: command.permissions,
        botPermissions: command.botPermissions
      })
    })

    return commands
  })
}