import type { FastifyInstance } from "fastify"
import { readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function(fastify: FastifyInstance) {
  const commands: any[] = []
    for(const folder of readdirSync(path.resolve(__dirname, `../../../commands`))) {
    for(const file of readdirSync(path.resolve(__dirname, `../../../commands/${folder}`))) {
      const command = (await import(`../../../commands/${folder}/${file}`)).default.default ?? (await import(`../../../commands/${folder}/${file}`)).default
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
    }
  }
  fastify.get("/commands", () => {
    return commands
  })
}