import { CommandInteraction } from 'eris'
import { App, Listener } from '../structures'
import { Guild, User } from '../../database'
import locales from '../../locales'
import { ButtonInteraction } from '../../types'

export default class InteractionCreateListener extends Listener {
  constructor(client: App) {
    super({
      client,
      name: 'interactionCreate'
    })
  }
  async on(interaction: ButtonInteraction | CommandInteraction) {
    if(interaction instanceof ButtonInteraction) {
      if(!interaction.data.custom_id.startsWith('guess-')) return
      const guild = await Guild.findById(interaction.guildID)
      const user = await User.findById(interaction.member!.id) || new User({ _id: interaction.member!.id })
      if(user.guesses.filter((g: any) => g.match === interaction.data.custom_id.slice(6))[0]?.match === interaction.data.custom_id.slice(6)) {
        await interaction.defer(64)
        return interaction.createMessage(locales(guild?.lang!, 'helper.replied'))
      }
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json()
      const data = res.data.filter((d: any) => d.id == interaction.data.custom_id.slice(6))[0]
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
            custom_id: `modal-${interaction.data.custom_id.slice(6)}`,
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
    if(interaction instanceof ButtonInteraction && interaction.data.custom_id.startsWith('modal-')) {
      const user = await User.findById(interaction.member!.id) || new User({ _id: interaction.member!.id })
      const guild = await Guild.findById(interaction.guildID)
      await interaction.defer(64)
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json()
      const data = res.data.filter((d: any) => d.id == interaction.data.custom_id.slice(6))[0]
      interaction.createMessage(locales(guild?.lang!, 'helper.palpitate_response', {
        t1: data.teams[0].name,
        t2: data.teams[1].name,
        s1: interaction.data.components[0].components[0].value,
        s2: interaction.data.components[1].components[0].value
      }))

      user.history.push({
        match: data.id,
        teams: [
          {
            name: data.teams[0].name,
            score: interaction.data.components[0].components[0].value
          },
          {
            name: data.teams[1].name,
            score: interaction.data.components[1].components[0].value
          }
        ]
      })
      user.guesses.push({
        match: data.id,
        score1: interaction.data.components[0].components[0].value,
        score2: interaction.data.components[1].components[0].value
      })
      user.save()
    }
  }
}