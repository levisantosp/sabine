import {
  ModalSubmitInteraction,
  InteractionType,
  type Interaction
} from 'discord.js'
import createListener from '../structures/app/createListener.ts'
import CommandRunner from '../structures/command/CommandRunner.ts'
import { SabineGuild, SabineUser } from '../database/index.ts'
import locales, { type Args } from '../locales/index.ts'
import ComponentInteractionRunner from '../structures/interaction/ComponentInteractionRunner.ts'
import ModalSubmitInteractionRunner from '../structures/interaction/ModalSubmitInteractionRunner.ts'
import App from '../structures/app/App.ts'

const interactionType: Record<number, (app: App, i: Interaction) => Promise<unknown>> = {
  [InteractionType.ApplicationCommand]: async(app, interaction) => {
    if(!interaction.isChatInputCommand()) return

    return await new CommandRunner().run(app, interaction)
  },
  [InteractionType.ApplicationCommandAutocomplete]: async(app, interaction) => {
    if(!interaction.isAutocomplete()) return

    const command = app.commands.get(interaction.commandName)

    if(!command) return
    if(!command.createAutocompleteInteraction) return

    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)

    let guild: SabineGuild | undefined

    if(interaction.guildId) {
      guild = await SabineGuild.fetch(interaction.guildId) ?? new SabineGuild(interaction.guildId)
    }

    const t = (content: string, args?: Args) => {
      return locales(user.lang ?? guild?.lang, content, args)
    }

    const args: string[] = []

    const sub = interaction.options.getSubcommand(false)
    const group = interaction.options.getSubcommandGroup(false)

    if(sub) args.push(sub)
    if(group) args.push(group)

    return await command.createAutocompleteInteraction({ i: interaction, t, app, args })
  },
  [InteractionType.MessageComponent]: async(app, interaction) => {
    if(!interaction.isMessageComponent()) return

    return await new ComponentInteractionRunner().run(app, interaction)
  },
  [InteractionType.ModalSubmit]: async(app, interaction) => {
    if(!(interaction instanceof ModalSubmitInteraction)) return

    return await new ModalSubmitInteractionRunner().run(app, interaction)
  }
}
export default createListener({
  name: 'interactionCreate',
  async run(app, interaction) {
    await interactionType[interaction.type](app, interaction)
  }
})