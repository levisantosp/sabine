import type { MatchesData } from '../../types.ts'
import Service from '../../api/index.ts'
import locales from '../../i18n/index.ts'
import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'
import { emojis } from '../../util/emojis.ts'
import { ChannelType, TextChannel } from 'discord.js'

const service = new Service(process.env.AUTH)

const tournaments: { [key: string]: RegExp[] } = {
  'Valorant Champions Tour': [
    /valorant champions/,
    /valorant masters/,
    /vct \d{4}/
  ],
  'Valorant Challengers League': [
    /challengers \d{4}/,
    /vct \d{4}: ascension/
  ],
  'Valorant Game Changers': [
    /game changers \d{4}/
  ]
}

export default createCommand({
  name: 'admin',
  category: 'admin',
  description: 'See the dashboard and change the bot language',
  descriptionLocalizations: {
    'pt-BR': 'Veja o painel de controle e mude o idioma do bot'
  },
  options: [
    {
      type: 1,
      name: 'dashboard',
      nameLocalizations: {
        'pt-BR': 'painel'
      },
      description: 'Shows the dashboard',
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
              name: 'pt-BR',
              value: 'pt'
            },
            {
              name: 'en-US',
              value: 'en'
            }
          ],
          required: true
        }
      ]
    },
    {
      type: 1,
      name: 'premium',
      description: 'Shows information about server premium',
      descriptionLocalizations: {
        'pt-BR': 'Mostra informações sobre o premium do servidor'
      }
    }
  ],
  permissions: ['ManageGuild', 'ManageChannels'],
  botPermissions: ['ManageMessages', 'SendMessages'],
  syntaxes: [
    'admin dashboard',
    'adming language [lang]',
  ],
  examples: [
    'admin dashboard',
    'admin language pt-BR',
    'admin language en-US'
  ],
  messageComponentInteractionTime: 5 * 60 * 1000,
  async run({ ctx, t, id, app }) {
    if(!ctx.db.guild) return

    console.log(id)

    if(ctx.args[0] === 'dashboard') {
      const guild = (await app.prisma.guild.findUnique({
        where: {
          id: ctx.db.guild.id
        },
        include: {
          events: true
        }
      }))!

      const embed = new EmbedBuilder()
        .setTitle(t('commands.admin.dashboard'))
        .setDesc(t('commands.admin.desc', {
          lang: ctx.db.guild!.lang.replace('en', 'English').replace('pt', 'Português'),
          limit: ctx.db.guild!.tournaments_length === Infinity ? '`Infinity`' : `${guild.events.length}/${ctx.db.guild!.tournaments_length}`,
          id,
          vlr_news: !ctx.db.guild!.valorant_news_channel ? '`undefined`' : `<#${ctx.db.guild!.valorant_news_channel}>`,
          vlr_live: !ctx.db.guild!.valorant_live_feed_channel ? '`undefined`' : `<#${ctx.db.guild!.valorant_live_feed_channel}>`,
          lol_news: !ctx.db.guild!.lol_news_channel ? '`undefined`' : `<#${ctx.db.guild!.lol_news_channel}>`,
          lol_live: !ctx.db.guild!.lol_live_feed_channel ? '`undefined`' : `<#${ctx.db.guild!.lol_live_feed_channel}>`,
        }))

      await ctx.reply(embed.build({
        components: [
          {
            type: 1,
            components: [
              new ButtonBuilder()
                .defineStyle('blue')
                .setLabel(t('commands.admin.vlr_esports_coverage'))
                .setCustomId(`admin;${ctx.interaction.user.id};vlr`),
              new ButtonBuilder()
                .defineStyle('blue')
                .setLabel(t('commands.admin.lol_esports_coverage'))
                .setCustomId(`admin;${ctx.interaction.user.id};lol`)
            ]
          },
          {
            type: 1,
            components: [
              new ButtonBuilder()
                .setLabel(t('commands.admin.resend', { game: 'VALORANT' }))
                .defineStyle('red')
                .setCustomId(`admin;${ctx.interaction.user.id};resend;vlr`),
              new ButtonBuilder()
                .setLabel(t('commands.admin.resend', { game: 'League of Legends' }))
                .defineStyle('red')
                .setCustomId(`admin;${ctx.interaction.user.id};resend;lol`)
            ]
          }
        ]
      }))
    }
    else if(ctx.args[0] === 'language') {
      const options = {
        en: async() => {
          ctx.db.guild!.lang = 'en'

          await ctx.db.guild?.save()

          await ctx.reply('Now I will interact in English on this server!')
        },
        pt: async() => {
          ctx.db.guild!.lang = 'pt'

          await ctx.db.guild?.save()

          await ctx.reply('Agora eu irei interagir em português neste servidor!')
        }
      }

      await options[ctx.args[1] as 'pt' | 'en']()
    }
    else if(ctx.args[0] === 'premium') {
      if(!ctx.db.guild) {
        return await ctx.reply('commands.admin.no_premium')
      }

      const key = await app.prisma.guildKey.findUnique({
        where: {
          guildId: ctx.db.guild.id
        },
        include: {
          key: true
        }
      })

      if(!key || !key.key.expires_at) {
        return await ctx.reply('commands.admin.no_premium')
      }

      const embed = new EmbedBuilder()
        .setTitle('Premium')
        .setDesc(t('commands.admin.premium', {
          key: key.key.type,
          expiresAt: `<t:${(key.key.expires_at.getTime() / 1000).toFixed(0)}:R>`
        }))

      await ctx.reply(embed.build())
    }
  },
  async createMessageComponentInteraction({ ctx, t, app }) {
    if(!ctx.db.guild) return

    if(ctx.args[2] === 'vlr') {
      ctx.setFlags(64)

      const guild = (await app.prisma.guild.findUnique({
        where: {
          id: ctx.db.guild.id
        },
        include: {
          events: {
            where: {
              type: 'valorant'
            }
          }
        }
      }))!

      const embed = new EmbedBuilder()
        .setDesc(t('commands.admin.tournaments', { game: 'VALORANT' }))

      for(const event of guild.events) {
        embed.addField(event.name, t('commands.admin.event_channels', {
          ch1: `<#${event.channel1}>`,
          ch2: `<#${event.channel2}>`
        }), true)
      }

      await ctx.reply(embed.build())
    }
    else if(ctx.args[2] === 'lol') {
      ctx.setFlags(64)

      const guild = (await app.prisma.guild.findUnique({
        where: {
          id: ctx.db.guild.id
        },
        include: {
          events: {
            where: {
              type: 'lol'
            }
          }
        }
      }))!

      const embed = new EmbedBuilder()
        .setDesc(t('commands.admin.tournaments', { game: 'League of Legends' }))

      for(const event of guild.events) {
        embed.addField(event.name, t('commands.admin.event_channels', {
          ch1: `<#${event.channel1}>`,
          ch2: `<#${event.channel2}>`
        }), true)
      }

      await ctx.reply(embed.build())
    }
    else if(ctx.args[2] === 'resend' && ctx.args[3] === 'vlr') {
      ctx.setFlags(64)

      if(
        ctx.db.guild.valorant_resend_time &&
        ctx.db.guild.valorant_resend_time > new Date()
      ) {
        return await ctx.reply('commands.admin.resend_time', { t: `<t:${(ctx.db.guild.valorant_resend_time.getTime() / 1000).toFixed(0)}:R>` })
      }

      const button = new ButtonBuilder()
        .setLabel(t('commands.admin.continue'))
        .defineStyle('red')
        .setCustomId(`admin;${ctx.interaction.user.id};continue;vlr`)

      await ctx.reply(button.build(t('commands.admin.confirm')))
    }

    else if(ctx.args[2] === 'resend' && ctx.args[3] === 'lol') {
      ctx.setFlags(64)

      if(
        ctx.db.guild.lol_resend_time &&
        ctx.db.guild.lol_resend_time > new Date()
      ) {
        return await ctx.reply('commands.admin.resend_time', { t: `<t:${(ctx.db.guild.lol_resend_time.getTime() / 1000).toFixed(0)}:R>` })
      }

      const button = new ButtonBuilder()
        .setLabel(t('commands.admin.continue'))
        .defineStyle('red')
        .setCustomId(`admin;${ctx.interaction.user.id};continue;lol`)

      await ctx.reply(button.build(t('commands.admin.confirm')))
    }
    else if(ctx.args[2] === 'continue' && ctx.args[3] === 'vlr') {
      if(
        ctx.db.guild.valorant_resend_time &&
        ctx.db.guild.valorant_resend_time > new Date()
      ) {
        return await ctx.edit('commands.admin.resend_time', { t: `<t:${(ctx.db.guild.valorant_resend_time.getTime() / 1000).toFixed(0)}:R>` })
      }

      const guild = (await app.prisma.guild.findUnique({
        where: {
          id: ctx.db.guild.id
        },
        include: {
          events: {
            where: {
              type: 'valorant'
            }
          },
          tbd_matches: {
            where: {
              type: 'valorant'
            }
          },
          key: true
        }
      }))!

      guild.valorant_matches = []
      guild.tbd_matches = []
      guild.valorant_resend_time = new Date(Date.now() + 3600000)

      await ctx.edit('commands.admin.resending')

      const res = await service.getMatches('valorant')

      if(!res || !res.length) return

      const res2 = await service.getResults('valorant')
      if(guild.valorant_matches.length && !res2.some(d => d.id === guild.valorant_matches[guild.valorant_matches.length - 1])) return

      let data: MatchesData[]

      if(guild.events.length > 5 && !guild.key) {
        if(guild.events.slice().reverse().slice(0, 5).some(e => Object.keys(tournaments).includes(e.name))) {
          data = res.filter(d =>
            guild.events.some(e =>
              tournaments[e.name]?.some(regex =>
                regex.test(d.tournament.name.trim().replace(/\s+/g, ' ').toLowerCase())
              )
            )
          )
        }
        else data = res.filter(d => guild.events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }

      else {
        if(guild.events.slice().reverse().slice(0, 5).some(e => Object.keys(tournaments).includes(e.name))) {
          data = res.filter(d =>
            guild.events.some(e =>
              tournaments[e.name]?.some(regex =>
                regex.test(d.tournament.name.trim().replace(/\s+/g, ' ').toLowerCase())
              )
            )
          )
        }
        else data = res.filter(d => guild.events.some(e => e.name === d.tournament.name))
      }

      for(const e of guild.events) {
        const channel = await app.channels.fetch(e.channel1)
        if(!channel || channel.type !== ChannelType.GuildText) continue

        try {
          const messages = await channel.messages.fetch({ limit: 100 })
          const messagesIds = messages.filter(m => m.author.id === app.user?.id).map(m => m.id)
          if(messagesIds.length) {
            await channel.bulkDelete(messagesIds)
          }
        }

        catch { }
      }
      try {
        for(
          const d of data.map(body => ({
            ...body,
            when: new Date(body.when)
          }))
        ) {
          if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue

          for(const e of guild.events) {
            if(
              e.name === d.tournament.name
              || tournaments[e.name]?.some(regex =>
                regex.test(d.tournament.name.trim().replace(/\s+/g, ' ').toLowerCase())
              )
            ) {
              const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
              const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji

              const index = guild.valorant_matches.findIndex((m) => m === d.id)

              if(index > -1) guild.valorant_matches.splice(index, 1)

              guild.valorant_matches.push(d.id!)

              const embed = new EmbedBuilder()
                .setAuthor({
                  iconURL: d.tournament.image,
                  name: d.tournament.name
                })
                .setField(`${emoji1} **${d.teams[0].name}** <:versus:1349105624180330516> **${d.teams[1].name}** ${emoji2}`, `<t:${d.when.getTime() / 1000}:F> | <t:${d.when.getTime() / 1000}:R>`)
                .setFooter({
                  text: d.stage
                })

              const button = new ButtonBuilder()
                .setLabel(locales(guild.lang!, 'helper.palpitate'))
                .setCustomId(`predict;valorant;${d.id}`)
                .defineStyle('green')

              const urlButton = new ButtonBuilder()
                .setLabel(locales(guild.lang!, 'helper.stats'))
                .defineStyle('link')
                .setURL(`https://vlr.gg/${d.id}`)

              if(d.stage.toLowerCase().includes('showmatch')) continue

              const channel = ctx.app.channels.cache.get(e.channel1) as TextChannel

              if(!channel) return

              if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await channel.send({
                embeds: [embed],
                components: [
                  {
                    type: 1,
                    components: [
                      button,
                      new ButtonBuilder()
                        .setLabel(locales(guild.lang!, 'helper.bet'))
                        .setCustomId(`bet;valorant;${d.id}`)
                        .defineStyle('gray'),
                      urlButton,
                      new ButtonBuilder()
                        .setLabel(locales(guild.lang!, 'helper.pickem.label'))
                        .defineStyle('blue')
                        .setCustomId('pickem')
                    ]
                  }
                ]
              }).catch(() => { })

              else {
                guild.tbd_matches.push({
                  id: d.id!,
                  channel: e.channel1,
                  guildId: guild.id,
                  type: 'valorant'
                })
              }
            }
          }
        }
      }
      catch { }

      await app.prisma.guild.update({
        where: {
          id: ctx.interaction.guildId!
        },
        data: {
          valorant_matches: guild.valorant_matches,
          tbd_matches: {
            create: guild.tbd_matches.length
              ? guild.tbd_matches.map(m => ({
                type: m.type,
                id: m.id,
                channel: m.channel
              }))
              : undefined
          },
          valorant_resend_time: guild.valorant_resend_time
        }
      })

      await ctx.edit('commands.admin.resent')
    }
    else if(ctx.args[2] === 'continue' && ctx.args[3] === 'lol') {
      if(
        ctx.db.guild.lol_resend_time &&
        ctx.db.guild.lol_resend_time > new Date()
      ) {
        return await ctx.edit('commands.admin.resend_time', { t: `<t:${(ctx.db.guild.lol_resend_time.getTime() / 1000).toFixed(0)}:R>` })
      }

      const guild = (await app.prisma.guild.findUnique({
        where: {
          id: ctx.db.guild.id
        },
        include: {
          events: {
            where: {
              type: 'lol'
            }
          },
          tbd_matches: {
            where: {
              type: 'lol'
            }
          },
          key: true
        }
      }))!

      guild.lol_matches = []
      guild.tbd_matches = []
      guild.lol_resend_time = new Date(Date.now() + 3600000)

      await ctx.edit('commands.admin.resending')

      const res = await service.getMatches('lol')

      if(!res || !res.length) return

      const res2 = await service.getResults('lol')

      if(guild.lol_matches.length && !res2.some(d => d.id === guild.lol_matches[guild.lol_matches.length - 1])) return

      let data: MatchesData[]

      if(guild.events.length > 5 && !guild.key) {
        data = res.filter(d => guild.events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }

      else data = res.filter(d => guild.events.some(e => e.name === d.tournament.name))

      for(const e of guild.events) {
        const channel = await app.channels.fetch(e.channel1)
        if(!channel || channel.type !== ChannelType.GuildText) continue

        try {
          const messages = await channel.messages.fetch({ limit: 100 })
          const messagesIds = messages.filter(m => m.author.id === app.user?.id).map(m => m.id)
          if(messagesIds.length) {
            await channel.bulkDelete(messagesIds)
          }
        }

        catch { }
      }

      try {
        for(
          const d of data.map(body => ({
            ...body,
            when: new Date(body.when)
          }))
        ) {
          if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue

          for(const e of guild.events) {
            if(e.name === d.tournament.name) {
              const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
              const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji

              const index = guild.lol_matches.findIndex((m) => m === d.id)

              if(index > -1) guild.lol_matches.splice(index, 1)

              guild.lol_matches.push(d.id!)

              const embed = new EmbedBuilder()
                .setAuthor({
                  iconURL: d.tournament.image,
                  name: d.tournament.full_name!
                })
                .setField(`${emoji1} **${d.teams[0].name}** <:versus:1349105624180330516> **${d.teams[1].name}** ${emoji2}`, `<t:${d.when.getTime() / 1000}:F> | <t:${d.when.getTime() / 1000}:R>`)
                .setFooter({
                  text: d.stage
                })

              const button = new ButtonBuilder()
                .setLabel(t('helper.palpitate'))
                .setCustomId(`predict;lol;${d.id}`)
                .defineStyle('green')

              if(d.stage.toLowerCase().includes('showmatch')) continue

              const channel = ctx.app.channels.cache.get(e.channel1) as TextChannel

              if(!channel) return

              if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await channel.send({
                embeds: [embed],
                components: [
                  {
                    type: 1,
                    components: [
                      button,
                      new ButtonBuilder()
                        .setLabel(locales(guild.lang!, 'helper.bet'))
                        .setCustomId(`bet;lol;${d.id}`)
                        .defineStyle('gray'),
                      new ButtonBuilder()
                        .setLabel(locales(guild.lang!, 'helper.pickem.label'))
                        .defineStyle('blue')
                        .setCustomId('pickem')
                    ]
                  }
                ]
              }).catch(() => { })

              else {
                guild.tbd_matches.push({
                  id: d.id!,
                  channel: e.channel1,
                  guildId: guild.id,
                  type: 'lol'
                })
              }
            }
          }
        }
      }
      catch { }

      await app.prisma.guild.update({
        where: {
          id: ctx.interaction.guildId!
        },
        data: {
          lol_matches: guild.lol_matches,
          tbd_matches: {
            create: guild.tbd_matches
          },
          lol_resend_time: guild.lol_resend_time
        }
      })

      await ctx.edit('commands.admin.resent')
    }
  }
})