import type { ComponentInteraction } from "oceanic.js"
import App from "../client/App.ts"
import ComponentInteractionContext from "./ComponentInteractionContext.ts"
import { SabineGuild, SabineUser } from "../../database/index.ts"
import locales, { type Args, type Content } from "../../locales/index.ts"
import type { Blacklist } from "@prisma/client"
import type ModalSubmitInteractionContext from "./ModalSubmitInteractionContext.ts"

export default class ComponentInteractionRunner {
  public async run(
    client: App,
    interaction: ComponentInteraction
  ): Promise<unknown> {
    const args = interaction.data.customID.split(";")
    const i = client.interactions.get(args[0])
    const command = client.commands.get(args[0])

    const rawBlacklist = await client.redis.get("blacklist")
    const value: Blacklist[] = rawBlacklist ? JSON.parse(rawBlacklist) : []
    const blacklist = new Map<string | null, Blacklist>(value.map(b => [b.id, b]))

    if(blacklist.get(interaction.user.id)) return
    if(blacklist.get(interaction.guildID)) return

    if(i?.global && !command) {
      if(!interaction.guild || !interaction.guildID) return

      const guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
      const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)

      const ctx = new ComponentInteractionContext({
        args,
        client,
        guild: interaction.guild,
        locale: user.lang,
        db: {
          user,
          guild
        },
        interaction
      })

      const t = <T extends Content>(content: T, args?: Args) => {
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

      return await i.run({
        ctx: ctx as ComponentInteractionContext & ModalSubmitInteractionContext,
        t,
        client
      })
    }

    if(command) {
      if(!command.createMessageComponentInteraction) return

      let guild: SabineGuild | undefined

      if(interaction.guildID) {
        guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
      }

      const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)

      const ctx = new ComponentInteractionContext({
        args,
        client,
        guild: interaction.guild,
        locale: user.lang,
        db: {
          user,
          guild
        },
        interaction
      })

      if(
        command.messageComponentInteractionTime &&
        interaction.message.createdAt.getTime() + command.messageComponentInteractionTime < Date.now()
      ) {
        ctx.setFlags(64)

        return await ctx.reply("helper.unknown_interaction")
      }

      if(args[1] !== "all" && args[1] !== interaction.user.id) {
        ctx.setFlags(64)

        return await ctx.reply("helper.this_isnt_for_you")
      }

      const t = <T extends Content>(content: T, args?: Args) => {
        return locales(ctx.locale, content, args)
      }

      return await command.createMessageComponentInteraction({
        ctx,
        t,
        i: interaction,
        client
      })
    }

    if(!i) return

    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)

    let guild: SabineGuild | undefined

    if(interaction.guildID) {
      guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
    }

    const ctx = new ComponentInteractionContext({
      args,
      client,
      guild: interaction.guild,
      locale: user.lang,
      db: {
        user,
        guild
      },
      interaction
    })

    if(
      i.time &&
      (interaction.message.createdAt.getTime() + i.time) < Date.now()
    ) {
      ctx.setFlags(64)

      return await ctx.reply("helper.unknown_interaction")
    }

    if(args[1] !== interaction.user.id) {
      ctx.setFlags(64)

      return await ctx.reply("helper.this_isnt_for_you")
    }

    const t = <T extends Content>(content: T, args?: Args) => {
      return locales(ctx.locale, content, args)
    }

    if(i.ephemeral) {
      await interaction.defer(64)
    }

    else if(i.isThinking) {
      await interaction.defer()
    }

    else if(i.flags) {
      ctx.setFlags(i.flags)
    }

    await i.run({ ctx, t, client })
  }
}