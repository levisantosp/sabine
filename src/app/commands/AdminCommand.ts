import { AutocompleteInteraction } from 'eris'
import { App, Command, CommandContext } from '../structures'
import { AutocompleteCommandOptions } from '../structures/command/Command'

type AutocompleteOptions = {
  type: number
  name: 'add' | 'remove'
  options: Array<{
    value: string
    type: number
    name: string
    focused?: boolean
  }>
}
// type AutocompleteInteractionOptions = {
//   type: number
//   name: string
//   options: AutocompleteOptions[]
// }
export type AutocompleteInteractionDataOptions = {
  type: number
  options: AutocompleteOptions[]
  name: string
}
type Options = {
  options: Array<{
    name: 'add' | 'remove'
  }>
}
export default class AdminCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'admin',
      description: 'Manage the bot configs',
      description_localizations: {
        'pt-BR': 'Gerencie as configurações do bot'
      },
      options: [
        {
          type: 2,
          name: 'tournament',
          name_localizations: {
            'pt-BR': 'campeonato'
          },
          description: 'Add a tournament to announce',
          description_localizations: {
            'pt-BR': 'Adicione um torneio para anunciar'
          },
          options: [
            {
              type: 1,
              name: 'add',
              name_localizations: {
                'pt-BR': 'adicionar'
              },
              description: 'Add a tournament to announce',
              description_localizations: {
                'pt-BR': 'Adicione um camepenato para anunciar'
              },
              options: [
                {
                  type: 3,
                  name: 'tournament',
                  name_localizations: {
                    'pt-BR': 'campeonato'
                  },
                  description: 'Enter a tournament',
                  description_localizations: {
                    'pt-BR': 'Informe o campeonato'
                  },
                  autocomplete: true,
                  required: true
                },
                {
                  type: 7,
                  name: 'results_channel',
                  name_localizations: {
                    'pt-BR': 'canal_de_resultados'
                  },
                  description: 'Enter a channel',
                  description_localizations: {
                    'pt-BR': 'Informe o canal'
                  },
                  required: true
                },
                {
                  type: 7,
                  name: 'matches_channel',
                  name_localizations: {
                    'pt-BR': 'canal_de_partidas'
                  },
                  description: 'Enter a channel',
                  description_localizations: {
                    'pt-BR': 'Informe o canal'
                  },
                  required: true
                }
              ]
            },
            {
              type: 1,
              name: 'remove',
              name_localizations: {
                'pt-BR': 'remover'
              },
              description: 'Remove a tournament',
              description_localizations: {
                'pt-BR': 'Remove um torneio'
              },
              options: [
                {
                  type: 3,
                  name: 'tournament',
                  name_localizations: {
                    'pt-BR': 'campeonato'
                  },
                  description: 'Enter a tournament',
                  description_localizations: {
                    'pt-BR': 'Informe um torneio'
                  },
                  autocomplete: true,
                  required: true
                }
              ]
            }
          ]
        }
      ]
    })
  }
  async run(ctx: CommandContext) {
    const options = {
      add: async() => {
        if(ctx.db.guild.events.filter((e: any) => e.name === ctx.args[0]).length) return ctx.reply('commands.admin.tournament_has_been_added')
        if(ctx.args[1] === ctx.args[2]) return ctx.reply('commands.admin.channels_must_be_different')
        ctx.db.guild.events.push({
          name: ctx.args[0],
          channel1: ctx.args[2],
          channel2: ctx.args[1]
        })
        await ctx.db.guild.save()
        ctx.reply('commands.admin.tournament_added', {
          t: ctx.args[0]
        })
      },
      remove: async() => {
        ctx.db.guild.events.splice(ctx.db.guild.events.findIndex((e: any) => e.name === ctx.args[0]), 1)
        await ctx.db.guild.save()
        ctx.reply('commands.admin.tournament_removed', {
          t: ctx.args[0]
        })
      }
    }
    options[(ctx.callback.data.options![0] as Options).options[0].name]()
  }
  async execAutocomplete(i: AutocompleteInteraction, options: AutocompleteCommandOptions) {
    const args = {
      add: async() => {
        i.result(options.events!.map(e => ({ name: e, value: e })))
      },
      remove: async() => {
        i.result(options.guild!.events.map(e => ({ name: e, value: e })))
      }
    }
    args[(i.data.options as AutocompleteInteractionDataOptions[])[0].options[0].name]()
  }
}