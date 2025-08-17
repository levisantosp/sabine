import { AutocompleteInteraction, CommandInteraction, ComponentInteraction, type Guild, InteractionTypes, type AnyInteractionGateway, ModalSubmitInteraction } from "oceanic.js"
import createListener from "../structures/client/createListener.ts"
import CommandRunner from "../structures/command/CommandRunner.ts"
import { client } from "../structures/client/App.ts"
import { SabineGuild, SabineUser } from "../database/index.ts"
import locales, { type Args } from "../locales/index.ts"
import ComponentInteractionContext from "../structures/interactions/ComponentInteractionContext.ts"
import ModalSubmitInteractionContext from "../structures/interactions/ModalSubmitInteractionContext.ts"

const interactionTypes: Record<number, (i: AnyInteractionGateway) => Promise<any>> = {
  [InteractionTypes.APPLICATION_COMMAND]: async(interaction) => {
    if(!(interaction instanceof CommandInteraction)) return
    return await new CommandRunner().run(client, interaction)
  },
  [InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE]: async(interaction) => {
    if(!(interaction instanceof AutocompleteInteraction)) return
    const command = client.commands.get(interaction.data.name)
    if(!command) return
    if(!command.createAutocompleteInteraction) return
    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)
    let guild: SabineGuild | undefined
    if(interaction.guildID) {
      guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
    }
    const t = (content: string, args?: Args) => {
      return locales(user.lang ?? guild?.lang, content, args)
    }
    const args: string[] = interaction.data.options.getSubCommand() ?? []
    for(const option of interaction.data.options.getOptions()) {
      args.push(option.value.toString())
    }
    return await command.createAutocompleteInteraction({ i: interaction, t, client, args })
  },
  [InteractionTypes.MESSAGE_COMPONENT]: async(interaction) => {
    if(!(interaction instanceof ComponentInteraction)) return
    const args = interaction.data.customID.split(";")
    const command = client.commands.get(args[0])
    const int = client.interactions.get(args[0])
    if(!command && !int) {
      if(!interaction.guild) return
      const i = (await import(`../interactions/globals/${args[0]}.ts`)).default
      const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)
      let guild: SabineGuild | undefined
      let g: Guild | undefined
      if(interaction.guildID) {
        guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
        g = client.guilds.get(interaction.guildID)
      }
      const ctx = new ComponentInteractionContext({
        args,
        client,
        guild: g,
        locale: user.lang ?? guild?.lang ?? "en",
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
      await i.run({ ctx, t, client })
    }
    else if(command) {
      const blacklist = (await client.prisma.blacklists.findFirst())!
      if(blacklist.users.find(user => user.id === interaction.user.id)) return
      if(command.createMessageComponentInteraction) {
        const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)
        let guild: SabineGuild | undefined
        let g: Guild | undefined
        if(interaction.guildID) {
          guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
          g = client.guilds.get(interaction.guildID)
        }
        const ctx = new ComponentInteractionContext({
          args,
          client,
          guild: g,
          locale: user.lang ?? guild?.lang,
          db: {
            user,
            guild
          },
          interaction
        })
        if(
          command.messageComponentInteractionTime &&
          ((new Date(interaction.message.createdAt).getTime() + command.messageComponentInteractionTime) < Date.now())
        ) {
          ctx.setFlags(64)
          return await ctx.reply("helper.unknown_interaction")
        }
        if(args[1] !== "all" && args[1] !== interaction.user.id) {
          ctx.setFlags(64)
          return await ctx.reply("helper.this_isnt_for_you")
        }
        const t = (content: string, args?: Args) => {
          return locales(ctx.locale, content, args)
        }
        return await command.createMessageComponentInteraction({ ctx, t, i: interaction, client })
      }
    }
    else if(int) {
      const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)
      let guild: SabineGuild | undefined
      let g: Guild | undefined
      if(interaction.guildID) {
        guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
        g = client.guilds.get(interaction.guildID)
      }
      const ctx = new ComponentInteractionContext({
        args,
        client,
        guild: g,
        locale: user.lang ?? guild?.lang ?? "en",
        db: {
          user,
          guild
        },
        interaction
      })
      if(
        int.time &&
        ((new Date(interaction.message.createdAt).getTime() + int.time) < Date.now())
      ) {
        ctx.setFlags(64)
        return await ctx.reply("helper.unknown_interaction")
      }
      if(args[1] !== interaction.user.id) {
        ctx.setFlags(64)
        return await ctx.reply("helper.this_isnt_for_you")
      }
      const t = (content: string, args?: Args) => {
        return locales(ctx.locale, content, args)
      }
      if(int.ephemeral) {
        await interaction.defer(64)
      }
      else if(int.isThinking) {
        await interaction.defer()
      }
      else if(int.flags) {
        ctx.setFlags(int.flags)
      }
      await int.run({ ctx, t, client })
    }
  },
  [InteractionTypes.MODAL_SUBMIT]: async(interaction) => {
    if(!(interaction instanceof ModalSubmitInteraction)) return
    const args = interaction.data.customID.split(";")
    const command = client.commands.get(args[0])
    if(!command) {
      if(!interaction.guild) return
      const i = (await import(`../interactions/globals/${args[0]}.ts`)).default
      const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)
      let guild: SabineGuild | undefined
      let g: Guild | undefined
      if(interaction.guildID) {
        guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
        g = client.guilds.get(interaction.guildID)
      }
      for(const component of interaction.data.components.getComponents()) {
        args.push(component.value)
      }
      const ctx = new ModalSubmitInteractionContext({
        args,
        client,
        guild: g,
        locale: user.lang ?? guild?.lang,
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
        ctx.setFlags(i.flags)
      }
      return await i.run({ ctx, t })
    }
    if(!command.createModalSubmitInteraction) return
    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)
    let guild: SabineGuild | undefined
    let g: Guild | undefined
    if(interaction.guildID) {
      guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
      g = client.guilds.get(interaction.guildID)
    }
    const ctx = new ModalSubmitInteractionContext({
      args,
      client,
      guild: g,
      interaction,
      locale: user.lang ?? guild?.lang,
      db: {
        user,
        guild
      }
    })
    const t = (content: string, args?: Args) => {
      return locales(ctx.locale, content, args)
    }
    await command.createModalSubmitInteraction({ ctx, t, client, i: interaction })
  }
}
export default createListener({
  name: "interactionCreate",
  async run(client, interaction) {
    await interactionTypes[interaction.type](interaction)
  }
})