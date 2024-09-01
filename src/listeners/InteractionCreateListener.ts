import { AutocompleteInteraction, CommandInteraction, ComponentInteraction, ModalSubmitInteraction, ModalSubmitInteractionComponentsWrapper } from 'oceanic.js'
import { App, ButtonBuilder, CommandRunner, Listener, Logger } from '../structures'
import { Blacklist, BlacklistSchemaInterface, Guild, User } from '../database'
import locales, { Args } from '../locales'
import MainController from '../scraper'

export default class InteractionCreateListener extends Listener {
  constructor(client: App) {
    super({
      client,
      name: 'interactionCreate'
    })
  }
  async on(interaction: ComponentInteraction | CommandInteraction | AutocompleteInteraction | ModalSubmitInteraction | ModalSubmitInteractionComponentsWrapper) {
    if(interaction instanceof ComponentInteraction) {
      const blacklist = await Blacklist.findById('blacklist') as BlacklistSchemaInterface
      const ban = blacklist.users.find(user => user.id === interaction.user.id)
      if(ban) return
      const args = interaction.data.customID.split(';')
      const command = this.client.commands.get(args[0])
      const guild = await Guild.findById(interaction.guildID!)
      const user = await User.findById(interaction.user.id)
      if(command) {
        command.locale = (content: string, args?: Args) => {
          return locales(user?.lang ?? guild?.lang ?? 'en', content, args)
        }
        command.getUser = async(user: string) => {
          try {
            if(isNaN(Number(user))) return await this.client.rest.users.get(user.replace(/[<@!>]/g, ''))
            else return await this.client.rest.users.get(user as string)
          }
          catch(e) {
            new Logger(this.client).error(e as Error)
          }
        }
        command.execInteraction(interaction, args)
        .catch((e: Error) => new Logger(this.client).error(e))
      }
      else {
        if(interaction.data.customID === 'pickem') {
          return interaction.createMessage({
            content: locales(user?.lang ?? guild?.lang!, 'helper.pickem.res'),
            flags: 64
          })
        }
        if(interaction.data.customID.startsWith('guess-')) {
          await interaction.defer(64)
          const guild = await Guild.findById(interaction.guildID)
          const user = await User.findById(interaction.member!.id) || new User({ _id: interaction.member!.id })
          await interaction.createFollowup({
            content: locales(user.lang ?? guild?.lang!, 'helper.verifying')
          })
          if(user.history.filter((g: any) => g.match === interaction.data.customID.slice(6))[0]?.match === interaction.data.customID.slice(6)) {
            return interaction.editOriginal({
              content: locales(user.lang ?? guild?.lang!, 'helper.replied')
            })
          }
          const res = await MainController.getMatches()
          const data = res.find(d => d.id == interaction.data.customID.slice(6))
          if(data?.status === 'LIVE' || !data) {
            return interaction.editOriginal({
              content: locales(user.lang ?? guild?.lang!, 'helper.started')
            })
          }
          interaction.editOriginal({
            content: locales(user.lang ?? guild?.lang!, 'helper.verified'),
            components: [
              {
                type: 1,
                components: [
                  new ButtonBuilder()
                  .setStyle('green')
                  .setLabel(locales(user.lang ?? guild?.lang!, 'helper.palpitate'))
                  .setCustomId(`predict-${interaction.data.customID.slice(6)}`)
                ]
              }
            ]
          })
        }
        if(interaction.data.customID.startsWith('predict-')) {
          const guild = await Guild.findById(interaction.guildID)
          const user = await User.findById(interaction.member!.id) || new User({ _id: interaction.member!.id })
          if(user.history.filter((g: any) => g.match === interaction.data.customID.slice(8))[0]?.match === interaction.data.customID.slice(8)) {
            return interaction.editParent({
              content: locales(user.lang ?? guild?.lang!, 'helper.replied'),
              components: []
            })
          }
          const res = await MainController.getMatches()
          const data = res.find(d => d.id == interaction.data.customID.slice(8))
          if(data?.status === 'LIVE' || !data) {
            return interaction.editOriginal({
              content: locales(user.lang ?? guild?.lang!, 'helper.started'),
              components: []
            })
          }
          interaction.createModal({
            customID: `modal-${interaction.data.customID.slice(8)}`,
            title: locales(user.lang ?? guild?.lang!, 'helper.palpitate_modal.title'),
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    customID: 'response-modal-1',
                    label: data?.teams[0].name,
                    style: 1,
                    minLength: 1,
                    maxLength: 1,
                    required: true,
                    placeholder: '0'
                  },
                ]
              },
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    customID: 'response-modal-2',
                    label: data?.teams[1].name,
                    style: 1,
                    minLength: 1,
                    maxLength: 1,
                    required: true,
                    placeholder: '0'
                  }
                ]
              }
            ]
          })
        }
      }
    }
    if(interaction instanceof ModalSubmitInteraction && interaction.data.customID.startsWith('modal-')) {
      const user = await User.findById(interaction.member!.id) || new User({ _id: interaction.member!.id })
      const guild = await Guild.findById(interaction.guildID)
      const res = await MainController.getMatches()
      const data = res.find(d => d.id == interaction.data.customID.slice(6))!
      user.history.push({
        match: data.id,
        teams: [
          {
            name: data.teams[0].name,
            score: interaction.data.components.getComponents()[0].value
          },
          {
            name: data.teams[1].name,
            score: interaction.data.components.getComponents()[1].value
          }
        ]
      })
      await user.save()
      interaction.editParent({
        content: locales(user.lang ?? guild?.lang!, 'helper.palpitate_response', {
          t1: data.teams[0].name,
          t2: data.teams[1].name,
          s1: interaction.data.components.getComponents()[0].value,
          s2: interaction.data.components.getComponents()[1].value
        }),
        components: []
      })
    }
    if(interaction instanceof CommandInteraction) {
      if(!interaction.member) return
      const guild = await Guild.findById(interaction.guildID) || new Guild(
        {
          _id: interaction.guildID
        }
      )
      const user = await User.findById(interaction.user.id)
      await guild.save()
      new CommandRunner(
        {
          client: this.client,
          callback: interaction,
          locale: user && user.lang ? user.lang : guild.lang
        }
      )
      .run()
    }
    if(interaction instanceof AutocompleteInteraction) {
      const command = this.client.commands.get(interaction.data.name)
      if(!command) return
      const guild = await Guild.findById(interaction.guildID) || new Guild({ _id: interaction.guildID })
      const user = await User.findById(interaction.user.id)
      command.locale = (content: string, args?: Args) => {
        return locales(user?.lang ?? guild.lang, content, args)
      }
      command.execAutocomplete(interaction)
      .catch((e: Error) => new Logger(this.client).error(e))
    }
  }
}