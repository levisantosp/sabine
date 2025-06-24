import type { FastifyInstance } from "fastify"
import { client } from "../../../structures/client/App.ts"
import { InteractionType, verifyKey } from "discord-interactions"
import {
  CommandInteraction,
  type RawApplicationCommandInteraction,
  type RawAutocompleteInteraction,
  type AnyRawInteraction,
  AutocompleteInteraction,
  ComponentInteraction,
  type RawMessageComponentInteraction,
  ModalSubmitInteraction,
  type RawModalSubmitInteraction
} from "oceanic.js"
import CommandRunner from "../../../structures/command/CommandRunner.ts"
import { SabineUser } from "../../../database/index.ts"
import locales, { type Args } from "../../../locales/index.ts"
import ComponentInteractionContext from "../../../structures/interactions/ComponentInteractionContext.ts"
import ModalSubmitInteractionContext from "../../../structures/interactions/ModalSubmitInteractionContext.ts"
import Logger from "../../../structures/util/Logger.ts"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const types: Record<number, (raw: AnyRawInteraction) => Promise<any>> = {
  [InteractionType.APPLICATION_COMMAND]: async(raw: AnyRawInteraction) => {
    const interaction = new CommandInteraction(raw as RawApplicationCommandInteraction, client)
    return await new CommandRunner().run(client, interaction)
  },
  [InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE]: async(raw: AnyRawInteraction) => {
    const interaction = new AutocompleteInteraction(raw as RawAutocompleteInteraction, client)
    const command = client.commands.get(interaction.data.name)
    if(!command) return
    if(!command.createAutocompleteInteraction) return
    const user = await new SabineUser(interaction.user.id).get()
    const guild = await prisma.guilds.findUnique({
      where: {
        id: interaction.guild?.id
      }
    }) ?? await prisma.guilds.create({
      data: {
        id: interaction.guild!.id,
        lang: "en"
      }
    })
    const t = (content: string, args?: Args) => {
      return locales(user?.lang ?? guild.lang, content, args)
    }
    let args: string[] = interaction.data.options.getSubCommand() ?? []
    for(const option of interaction.data.options.getOptions()) {
      args.push(option.value.toString())
    }
    return await command.createAutocompleteInteraction({ i: interaction, t, client, args })
  },
  [InteractionType.MESSAGE_COMPONENT]: async(raw: AnyRawInteraction) => {
    const interaction = new ComponentInteraction(raw as RawMessageComponentInteraction, client)
    const args = interaction.data.customID.split(";")
    const command = client.commands.get(args[0])
    if(!command) {
      if(!interaction.guild) return
      const i = (await import(`../../../interactions/${args[0]}.ts`)).default
      const user = await new SabineUser(interaction.user.id).get() ?? await prisma.users.create({
        data: {
          id: interaction.user.id
        }
      })
      const guild = await prisma.guilds.findUnique({
        where: {
          id: interaction.guild?.id
        }
      }) ?? await prisma.guilds.create({
        data: {
          id: interaction.guild!.id,
          lang: "en"
        }
      })
      const ctx = new ComponentInteractionContext({
        args,
        client,
        guild: interaction.guild,
        locale: user?.lang ?? guild.lang,
        db: {
          user,
          guild
        },
        interaction
      })
      const t = (content: string, args?: Args) => {
        return locales(ctx.locale, content, args)
      }
      if(i.ephemeral) {
        await interaction.defer(64)
      }
      else if(i.isThinking) {
        await interaction.defer()
      }
      else if(i.flags) {
        ctx.setFlags(64)
      }
      await i.run({ ctx, t })
      return await interaction.createFollowup({
        content: "## I'm now also a Valorant simulator with card system and duels between players!" + "\n" +
          "- Use `/claim` to get a random player and build your `/roster`!" + "\n" +
          "- You can see all commands by using `/help`" + "\n" +
          "- More information about this update in our support and community server: https://discord.com/invite/FaqYcpA84r",
        flags: 64
      })
    }
    else {
      const blacklist = (await prisma.blacklists.findFirst())!
      if(blacklist.users.find(user => user.id === interaction.user.id)) return
      if(!command.createInteraction) return
      if(args[1] !== "all" && args[1] !== interaction.user.id) return
      const user = await new SabineUser(interaction.user.id).get() ?? await prisma.users.create({
        data: {
          id: interaction.user.id
        }
      })
      const guild = await prisma.guilds.findUnique({
        where: {
          id: interaction.guild?.id
        }
      }) ?? await prisma.guilds.create({
        data: {
          id: interaction.guild!.id,
          lang: "en"
        }
      })
      const ctx = new ComponentInteractionContext({
        args,
        client,
        guild: interaction.guild,
        locale: user?.lang ?? guild.lang,
        db: {
          user,
          guild
        },
        interaction
      })
      const t = (content: string, args?: Args) => {
        return locales(ctx.locale, content, args)
      }
      return await command.createInteraction({ ctx, t, i: interaction, client })
    }
  },
  [InteractionType.MODAL_SUBMIT]: async(raw: AnyRawInteraction) => {
    const interaction = new ModalSubmitInteraction(raw as RawModalSubmitInteraction, client)
    let args = interaction.data.customID.split(";")
    const command = client.commands.get(args[0])
    if(!command) {
      if(!interaction.guild) return
      const i = (await import(`../../../interactions/${args[0]}.ts`)).default
      const user = await new SabineUser(interaction.user.id).get() ?? await prisma.users.create({
        data: {
          id: interaction.user.id
        }
      })
      const guild = await prisma.guilds.findUnique({
        where: {
          id: interaction.guild?.id
        }
      }) ?? await prisma.guilds.create({
        data: {
          id: interaction.guild!.id,
          lang: "en"
        }
      })
      args = []
      for(const component of interaction.data.components.getComponents()) {
        args.push(component.value)
      }
      const ctx = new ModalSubmitInteractionContext({
        args,
        client,
        guild: interaction.guild,
        locale: user?.lang ?? guild.lang,
        db: {
          user,
          guild
        },
        interaction
      })
      const t = (content: string, args?: Args) => {
        return locales(ctx.locale, content, args)
      }
      if(i.ephemeral) {
        await interaction.defer(64)
      }
      else if(i.isThinking) {
        await interaction.defer()
      }
      return await i.run({ ctx, t })
    }
    if(!command.createModalSubmitInteraction) return
    const user = await new SabineUser(interaction.user.id).get() ?? await prisma.users.create({
        data: {
          id: interaction.user.id
        }
      })
    const guild = await prisma.guilds.findUnique({
      where: {
        id: interaction.guild?.id
      }
    }) ?? await prisma.guilds.create({
      data: {
        id: interaction.guild!.id,
        lang: "en"
      }
    })
    const ctx = new ModalSubmitInteractionContext({
      args,
      client,
      guild: interaction.guild,
      interaction,
      locale: user?.lang ?? guild.lang,
      db: {
        user,
        guild
      }
    })
    const t = (content: string, args?: Args) => {
      return locales(ctx.locale, content, args)
    }
    await command.createModalSubmitInteraction({ ctx, t, client, i: interaction })
  },
  [InteractionType.PING]: async() => {
    return { type: 1 }
  }
}
export default async function(fastify: FastifyInstance) {
  const app = await client.rest.applications.getCurrent()
  fastify.addHook("preHandler", async(req, reply) => {
    const signature = req.headers["x-signature-ed25519"] as string
    const timestamp = req.headers["x-signature-timestamp"] as string
    const verified = await verifyKey(JSON.stringify(req.body), signature, timestamp, app.verifyKey)
    if(!verified) return reply.code(401).send("Bad request signature")
  })
  fastify.post("/interactions", async(req) => {
    const raw = req.body as AnyRawInteraction
    return await types[raw.type](raw).catch(e => new Logger(client).error(e))
  })
}