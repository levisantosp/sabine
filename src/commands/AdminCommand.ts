import { AutocompleteInteraction, ComponentInteraction } from 'oceanic.js'
import { App, ButtonBuilder, Command, CommandContext, EmbedBuilder } from '../structures'
import { Guild } from '../database'
import MainController from '../scraper'
import { EventsData } from '../../types'
const cache = new Map()

export default class AdminCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'admin',
      description: 'Manage the bot configs',
      descriptionLocalizations: {
        'pt-BR': 'Gerencie as configurações do bot'
      },
      options: [
        {
          type: 2,
          name: 'tournament',
          nameLocalizations: {
            'pt-BR': 'campeonato'
          },
          description: 'Add a tournament to announce',
          descriptionLocalizations: {
            'pt-BR': 'Adicione um torneio para anunciar'
          },
          options: [
            {
              type: 1,
              name: 'add',
              nameLocalizations: {
                'pt-BR': 'adicionar'
              },
              description: 'Add a tournament to announce',
              descriptionLocalizations: {
                'pt-BR': 'Adicione um camepenato para anunciar'
              },
              options: [
                {
                  type: 3,
                  name: 'tournament',
                  nameLocalizations: {
                    'pt-BR': 'campeonato'
                  },
                  description: 'Enter a tournament',
                  descriptionLocalizations: {
                    'pt-BR': 'Informe o campeonato'
                  },
                  autocomplete: true,
                  required: true
                },
                {
                  type: 7,
                  name: 'matches_channel',
                  nameLocalizations: {
                    'pt-BR': 'canal_de_partidas'
                  },
                  description: 'Enter a channel',
                  descriptionLocalizations: {
                    'pt-BR': 'Informe o canal'
                  },
                  required: true
                },
                {
                  type: 7,
                  name: 'results_channel',
                  nameLocalizations: {
                    'pt-BR': 'canal_de_resultados'
                  },
                  description: 'Enter a channel',
                  descriptionLocalizations: {
                    'pt-BR': 'Informe o canal'
                  },
                  required: true
                }
              ]
            },
            {
              type: 1,
              name: 'remove',
              nameLocalizations: {
                'pt-BR': 'remover'
              },
              description: 'Remove a tournament',
              descriptionLocalizations: {
                'pt-BR': 'Remove um torneio'
              },
              options: [
                {
                  type: 3,
                  name: 'tournament',
                  nameLocalizations: {
                    'pt-BR': 'campeonato'
                  },
                  description: 'Enter a tournament',
                  descriptionLocalizations: {
                    'pt-BR': 'Informe um torneio'
                  },
                  autocomplete: true,
                  required: true
                }
              ]
            }
          ]
        },
        {
          type: 1,
          name: 'panel',
          nameLocalizations: {
            'pt-BR': 'painel'
          },
          description: 'Shows the control panel',
          descriptionLocalizations: {
            'pt-BR': 'Mostra o painel de controle'
          }
        },
        {
          type: 1,
          name: 'language',
          nameLocalizations: {
            'pt-BR': 'idioma'
          },
          description: 'Change the languague that I interact on this server',
          descriptionLocalizations: {
            'pt-BR': 'Altera o idioma que eu interajo neste servidor'
          },
          options: [
            {
              type: 3,
              name: 'lang',
              description: 'Choose the language',
              descriptionLocalizations: {
                'pt-BR': 'Escolha o idioma'
              },
              choices: [
                {
                  name: 'Português Brasileiro',
                  value: 'pt'
                },
                {
                  name: 'American English',
                  value: 'en'
                }
              ],
              required: true
            }
          ]
        }
      ],
      permissions: ['ADMINISTRATOR'],
      botPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'SEND_MESSAGES'],
      examples: [
        'admin panel',
        'admin tournament add VCT Americas',
        'admin tournament remove VCT Americas',
        'admin language Português Brasileiro',
        'admin language American English'
      ],
      syntaxes: [
        'admin panel',
        'admin tournament add [tournament]',
        'admin tournament remove [tournament]',
        'admin language [lang]'
      ]
    })
  }
  async run(ctx: CommandContext) {
    if(ctx.args[0] === 'panel') {
      const embed = new EmbedBuilder()
      .setTitle(this.locale('commands.admin.panel'))
      .setDescription(this.locale('commands.admin.desc', {
        lang: ctx.db.guild.lang.replace('en', 'English').replace('pt', 'Português'),
        limit: ctx.db.guild.tournamentsLength === Infinity ? Infinity : `${ctx.db.guild.events.length}/${ctx.db.guild.tournamentsLength}`,
        id: this.id
      }))
      for(const event of ctx.db.guild.events) {
        embed.addField(event.name, this.locale('commands.admin.event_channels', {
          ch1: `<#${event.channel1}>`,
          ch2: `<#${event.channel2}>`
        }), true)
      }
      const button = new ButtonBuilder()
      .setLabel(this.locale('commands.admin.resend'))
      .setStyle('red')
      .setCustomId(`admin;resend;${ctx.callback.member?.id}`)
      if(!ctx.db.guild.events.length) button.setDisabled()
      ctx.reply({
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [button]
          }
        ]
      })
    }
    if(ctx.args[0] === 'language') {
      const options = {
        en: async() => {
          ctx.db.guild.lang = 'en'
          await ctx.db.guild.save()
          ctx.reply('Now I will interact in English on this server!')
        },
        pt: async() => {
          ctx.db.guild.lang = 'pt'
          await ctx.db.guild.save()
          ctx.reply('Agora eu irei interagir em português neste servidor!')
        }
      }
      options[ctx.callback.data.options.getStringOption('lang')?.value as 'pt' | 'en']()
    }
    if(ctx.args[0] === 'tournament') {
      const options = {
        add: async() => {
          if(ctx.db.guild.events.length >= ctx.db.guild.tournamentsLength) return ctx.reply('commands.admin.limit_reached', { cmd: `</admin tournament remove:${this.id}>` })
          if(ctx.db.guild.events.some(e => e.channel1 === ctx.args[1])) return ctx.reply('commands.admin.channel_being_used', {
            ch: `<#${ctx.args[1]}>`,
            cmd: `</admin panel:${this.id}>`
          })
          if(ctx.db.guild.events.filter(e => e.name === ctx.args[0]).length) return ctx.reply('commands.admin.tournament_has_been_added')
          if(ctx.args[1] === ctx.args[2]) return ctx.reply('commands.admin.channels_must_be_different')
          if(ctx.guild.channels.get(ctx.args[3])?.type !== 0 || ctx.guild.channels.get(ctx.args[4])?.type !== 0) return ctx.reply('commands.admin.invalid_channel')
          ctx.db.guild.events.push({
            name: ctx.args[2],
            channel1: ctx.args[3],
            channel2: ctx.args[4]
          })
          await ctx.db.guild.save()
          ctx.reply('commands.admin.tournament_added', {
            t: ctx.args[2]
          })
        },
        remove: async() => {
          ctx.db.guild.events.splice(ctx.db.guild.events.findIndex(e => e.name === ctx.args[2]), 1)
          await ctx.db.guild.save()
          ctx.reply('commands.admin.tournament_removed', {
            t: ctx.args[2]
          })
        }
      }
      options[ctx.args[1] as 'remove' | 'add']()
    }
  }
  async execAutocomplete(i: AutocompleteInteraction) {
    if(!cache.has('events')) {
      const res = await MainController.getEvents()
      cache.set('events', res)
    }
    const res: EventsData[] = cache.get('events')
    const events = res.filter(e => e.status !== 'completed')
    .map(e => e.name)
    .filter(e => {
      if(e.toLowerCase().includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return e
    })
    .slice(0, 25)
    const guild = (await Guild.findById(i.guildID))!
    const args = {
      add: async() => {
        i.result(events.map(e => ({ name: e, value: e })))
      },
      remove: async() => {
        const events = guild!.events.map(e => e.name)
        .filter(e => {
          if(e.toLowerCase().includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return e
        })
        i.result(events.map(e => ({ name: e, value: e })))
      }
    }
    args[i.data.options.getSubCommand()![1] as 'add' | 'remove']()
  }
  async execInteraction(i: ComponentInteraction, args: string[]) {
    if(i.member?.id !== args[2]) return
    if(args[1] === 'resend') {
      await i.defer(64)
      const guild = (await Guild.findById(i.guildID!))!
      if(guild.resendTime > Date.now()) return i.createFollowup({ content: this.locale('commands.admin.resend_time') })
      const button = new ButtonBuilder()
      .setLabel(this.locale('commands.admin.continue'))
      .setStyle('red')
      .setCustomId(`admin;continue;${i.member.id}`)
      i.createFollowup(button.build(this.locale('commands.admin.confirm')))
    }
    if(args[1] === 'continue') {
      const guild = (await Guild.findById(i.guildID!))!
      if(guild.resendTime > Date.now()) return i.editParent({
        content: this.locale('commands.admin.resend_time'),
        components: []
      })
      guild.matches = []
      guild.verificationTime = 0
      guild.tbdMatches = []
      guild.resendTime = new Date().setHours(24, 0, 0, 0)
      await guild.save()
      i.editParent({
        content: this.locale('commands.admin.resending'),
        components: []
      })
    }
  }
}