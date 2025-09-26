import type { ModalSubmitInteraction } from "oceanic.js"
import App from "../client/App.ts"
import ModalSubmitInteractionContext from "./ModalSubmitInteractionContext.ts"
import { SabineGuild, SabineUser } from "../../database/index.ts"
import locales, { type Args, type Content } from "../../locales/index.ts"
import type { Blacklist } from "@prisma/client"

export default class ModalSubmitInteractionRunner {
  public async run(
    client: App,
    interaction: ModalSubmitInteraction
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

      const ctx = new ModalSubmitInteractionContext({
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

      for(const component of interaction.data.components.getComponents()) {
        args.push(component.value)
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

      return await i.run({ ctx, t })
    }

    if(!command || !command.createModalSubmitInteraction) return

    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)

    let guild: SabineGuild | undefined

    if(interaction.guildID) {
      guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
    }

    const ctx = new ModalSubmitInteractionContext({
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

    await command.createModalSubmitInteraction({ ctx, t, client, i: interaction })
  }
}