import { AutocompleteInteraction, CommandInteraction, ComponentInteraction, UnknownInteraction } from 'eris'
import { App, CommandRunner, Listener, Logger } from '../structures'
import { Guild, User } from '../../database'
import locales from '../../locales'
import { ComponentInteractionButtonData, Tournament } from '../../../types'
import { AutocompleteInteractionDataOptions } from '../commands/AdminCommand'
const cache = new Map()

export default class InteractionCreateListener extends Listener {
  constructor(client: App) {
    super({
      client,
      name: 'interactionCreate'
    })
  }
  async on(interaction: ComponentInteraction | CommandInteraction | UnknownInteraction | AutocompleteInteraction) {
    if(interaction instanceof ComponentInteraction) {
      const args = interaction.data.custom_id.split(';')
      const command = this.client.commands.get(args[0])
      const guild = await Guild.findById(interaction.guildID!)
      if(command) {
        command.locale = (content: string, args: any) => {
          return locales(guild?.lang ?? 'en', content, args)
        }
        command.getUser = async(user: string) => {
          try {
            if(isNaN(Number(user))) return await this.client.getRESTUser(user.replace(/[<@!>]/g, ''))
            else return await this.client.getRESTUser(user as string)
          }
          catch(e) {
            new Logger(this.client).error(e as Error)
          }
        }
        command.execInteraction(interaction, args)
      }
      else {
        if(!(interaction.data as unknown as ComponentInteractionButtonData).custom_id.startsWith('guess-')) return
        const guild = await Guild.findById(interaction.guildID)
        const user = await User.findById(interaction.member!.id) || new User({ _id: interaction.member!.id })
        if(user.history.filter((g: any) => g.match === (interaction.data as unknown as ComponentInteractionButtonData).custom_id.slice(6))[0]?.match === (interaction.data as unknown as ComponentInteractionButtonData).custom_id.slice(6)) {
          await interaction.defer(64)
          return interaction.createMessage(locales(guild?.lang!, 'helper.replied'))
        }
        const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
          method: 'GET'
        })).json()
        const data = res.data.filter((d: any) => d.id == (interaction.data as unknown as ComponentInteractionButtonData).custom_id.slice(6))[0]
        if(!data?.in) {
          await interaction.defer(64)
          interaction.createMessage(locales(guild?.lang!, 'helper.started'))
          return
        }
        fetch(`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 9,
            data: {
              custom_id: `modal-${(interaction.data as unknown as ComponentInteractionButtonData).custom_id.slice(6)}`,
              title: locales(guild?.lang!, 'helper.palpitate_modal.title'),
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      custom_id: 'response-modal-1',
                      label: data.teams[0].name,
                      style: 1,
                      min_length: 1,
                      max_length: 1,
                      required: true
                    },
                  ]
                },
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      custom_id: 'response-modal-2',
                      label: data.teams[1].name,
                      style: 1,
                      min_length: 1,
                      max_length: 1,
                      required: true
                    }
                  ]
                }
              ]
            }
          })
        }) 
      }
    }
    if(interaction instanceof UnknownInteraction && (interaction.data as unknown as ComponentInteractionButtonData).custom_id.startsWith('modal-')) {
      const user = await User.findById(interaction.member!.id) || new User({ _id: interaction.member!.id })
      const guild = await Guild.findById(interaction.guildID)
      await interaction.defer(64)
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json()
      const data = res.data.filter((d: any) => d.id == (interaction.data as unknown as ComponentInteractionButtonData).custom_id.slice(6))[0]
      user.history.push({
        match: data.id,
        teams: [
          {
            name: data.teams[0].name,
            score: (interaction.data as unknown as ComponentInteractionButtonData).components[0].components[0].value
          },
          {
            name: data.teams[1].name,
            score: (interaction.data as unknown as ComponentInteractionButtonData).components[1].components[0].value
          }
        ]
      })
      await user.save()
      interaction.createMessage(locales(guild?.lang!, 'helper.palpitate_response', {
        t1: data.teams[0].name,
        t2: data.teams[1].name,
        s1: (interaction.data as unknown as ComponentInteractionButtonData).components[0].components[0].value,
        s2: (interaction.data as unknown as ComponentInteractionButtonData).components[1].components[0].value
      }))
    }
    if(interaction instanceof CommandInteraction) {
      if(!interaction.member) return
      const guild = await Guild.findById(interaction.guildID) || new Guild(
        {
          _id: interaction.guildID
        }
      )
      await guild.save()
      new CommandRunner(
        {
          client: this.client,
          callback: interaction,
          locale: guild.lang
        }
      )
      .run()
    }
    if(interaction instanceof AutocompleteInteraction) {
      const command = this.client.commands.get(interaction.data.name)
      if(!command) return
      const guild = (await Guild.findById(interaction.guildID!))!
      command.execAutocomplete(interaction)
      .catch((e: Error) => new Logger(this.client).error(e))
    }
  }
}