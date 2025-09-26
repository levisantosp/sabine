import {
  AutocompleteInteraction,
  CommandInteraction,
  ComponentInteraction,
  InteractionTypes,
  type AnyInteractionGateway,
  ModalSubmitInteraction
} from "oceanic.js"
import createListener from "../structures/client/createListener.ts"
import CommandRunner from "../structures/command/CommandRunner.ts"
import { client } from "../structures/client/App.ts"
import { SabineGuild, SabineUser } from "../database/index.ts"
import locales, { type Args } from "../locales/index.ts"
import ComponentInteractionRunner from "../structures/interaction/ComponentInteractionRunner.ts"
import ModalSubmitInteractionRunner from "../structures/interaction/ModalSubmitInteractionRunner.ts"

const interactionTypes: Record<number, (i: AnyInteractionGateway) => Promise<unknown>> = {
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

    return await new ComponentInteractionRunner().run(client, interaction)
  },
  [InteractionTypes.MODAL_SUBMIT]: async(interaction) => {
    if(!(interaction instanceof ModalSubmitInteraction)) return

    return await new ModalSubmitInteractionRunner().run(client, interaction)
  }
}
export default createListener({
  name: "interactionCreate",
  async run(client, interaction) {
    await interactionTypes[interaction.type](interaction)
  }
})