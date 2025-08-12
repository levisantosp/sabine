import type { CommandInteraction, ComponentInteraction } from 'oceanic.js'
import type { MatchesData } from '../../types.ts'
import Service from '../../api/index.ts'
import locales from '../../locales/index.ts'
import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'
import { PrismaClient } from '@prisma/client'
import { emojis } from '../../util/emojis.ts'
const service = new Service(process.env.AUTH)

const prisma = new PrismaClient()

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
  permissions: ['MANAGE_GUILD', 'MANAGE_CHANNELS'],
  botPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
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
  async run({ ctx, t, id }) {
    if(ctx.args[0] === 'dashboard') {
      const embed = new EmbedBuilder()
				.setTitle(t('commands.admin.dashboard'))
				.setDesc(t('commands.admin.desc', {
				  lang: ctx.db.guild!.lang.replace('en', 'English').replace('pt', 'Português'),
				  limit: ctx.db.guild!.tournamentsLength === Infinity ? '`Infinity`' : `${ctx.db.guild!.lol_events.length + ctx.db.guild!.valorant_events.length}/${ctx.db.guild!.tournamentsLength}`,
				  id,
				  vlr_news: !ctx.db.guild!.valorant_news_channel ? '`undefined`' : `<#${ctx.db.guild!.valorant_news_channel}>`,
				  vlr_live: !ctx.db.guild!.valorant_livefeed_channel ? '`undefined`' : `<#${ctx.db.guild!.valorant_livefeed_channel}>`,
				  lol_news: !ctx.db.guild!.lol_news_channel ? '`undefined`' : `<#${ctx.db.guild!.lol_news_channel}>`,
				  lol_live: !ctx.db.guild!.lol_livefeed_channel ? '`undefined`' : `<#${ctx.db.guild!.lol_livefeed_channel}>`,
				}))
      await ctx.reply(embed.build({
        components: [
          {
            type: 1,
            components: [
							new ButtonBuilder()
								.setStyle('blue')
								.setLabel(t('commands.admin.vlr_esports_coverage'))
								.setCustomId(`admin;${ctx.interaction.user.id};vlr`),
							new ButtonBuilder()
								.setStyle('blue')
								.setLabel(t('commands.admin.lol_esports_coverage'))
								.setCustomId(`admin;${ctx.interaction.user.id};lol`)
            ]
          },
          {
            type: 1,
            components: [
							new ButtonBuilder()
								.setLabel(t('commands.admin.resend', { game: 'VALORANT' }))
								.setStyle('red')
								.setCustomId(`admin;${ctx.interaction.user.id};resend;vlr`),
							new ButtonBuilder()
								.setLabel(t('commands.admin.resend', { game: 'League of Legends' }))
								.setStyle('red')
								.setCustomId(`admin;${ctx.interaction.user.id};resend;lol`)
            ]
          }
        ]
      }))
    }
    else if(ctx.args[0] === 'language') {
      const options = {
        en: async() => {
          await prisma.guilds.update({
            where: {
              id: ctx.db.guild!.id
            },
            data: {
              lang: 'en'
            }
          })
          await ctx.reply('Now I will interact in English on this server!')
        },
        pt: async() => {
          await prisma.guilds.update({
            where: {
              id: ctx.db.guild!.id
            },
            data: {
              lang: 'pt'
            }
          })
          await ctx.reply('Agora eu irei interagir em português neste servidor!')
        }
      }
      await options[(ctx.interaction as CommandInteraction).data.options.getStringOption('lang')?.value as 'pt' | 'en']()
    }
    else if(ctx.args[0] === 'premium') {
      if(!ctx.db.guild!.key) {
        return await ctx.reply('commands.admin.no_premium')
      }
      const embed = new EmbedBuilder()
				.setTitle('Premium')
				.setDesc(t('commands.admin.premium', {
				  key: ctx.db.guild!.key.type,
				  expiresAt: `<t:${(ctx.db.guild!.key.expiresAt! / 1000).toFixed(0)}:R>`
				}))
			ctx.reply(embed.build())
    }
  },
  async createMessageComponentInteraction({ ctx, t }) {
    if(ctx.args[2] === 'vlr') {
      await ctx.interaction.defer(64)
      const embed = new EmbedBuilder()
				.setDesc(t('commands.admin.tournaments', { game: 'VALORANT' }))
      for(const event of ctx.db.guild!.valorant_events) {
				embed.addField(event.name, t('commands.admin.event_channels', {
				  ch1: `<#${event.channel1}>`,
				  ch2: `<#${event.channel2}>`
				}), true)
      }
      await ctx.reply(embed.build())
    }
    else if(ctx.args[2] === 'lol') {
      await ctx.interaction.defer(64)
      const embed = new EmbedBuilder()
				.setDesc(t('commands.admin.tournaments', { game: 'League of Legends' }))
      for(const event of ctx.db.guild!.lol_events) {
				embed.addField(event.name, t('commands.admin.event_channels', {
				  ch1: `<#${event.channel1}>`,
				  ch2: `<#${event.channel2}>`
				}), true)
      }
      await ctx.reply(embed.build())
    }
    else if(ctx.args[2] === 'resend' && ctx.args[3] === 'vlr') {
      await ctx.interaction.defer(64)
      const guild = (await prisma.guilds.findUnique({ where: { id: ctx.interaction.guild!.id } }))!
      if(guild.valorant_resend_time > Date.now()) {
        return await ctx.reply('commands.admin.resend_time', { t: `<t:${(guild.valorant_resend_time / 1000).toFixed(0)}:R>` })
      }
      const button = new ButtonBuilder()
				.setLabel(t('commands.admin.continue'))
				.setStyle('red')
				.setCustomId(`admin;${ctx.interaction.user.id};continue;vlr`)
      await ctx.reply(button.build(t('commands.admin.confirm')))
    }
    else if(ctx.args[2] === 'resend' && ctx.args[3] === 'lol') {
      await ctx.interaction.defer(64)
      const guild = (await prisma.guilds.findUnique({ where: { id: ctx.interaction.guild!.id } }))!
      if(guild.lol_resend_time > Date.now()) {
        return await ctx.reply('commands.admin.resend_time', { t: `<t:${(guild.lol_resend_time / 1000).toFixed(0)}:R>` })
      }
      const button = new ButtonBuilder()
				.setLabel(t('commands.admin.continue'))
				.setStyle('red')
				.setCustomId(`admin;${ctx.interaction.user.id};continue;lol`)
      await ctx.reply(button.build(t('commands.admin.confirm')))
    }
    else if(ctx.args[2] === 'continue' && ctx.args[3] === 'vlr') {
      await (ctx.interaction as ComponentInteraction).deferUpdate()
      const guild = (await prisma.guilds.findUnique({ where: { id: ctx.interaction.guild!.id } }))!
      if(guild.valorant_resend_time > Date.now()) {
        return await ctx.edit('commands.admin.resend_time', { t: `<t:${(guild.valorant_resend_time / 1000).toFixed(0)}:R>` })
      }
      guild.valorant_matches = []
      guild.valorant_tbd_matches = []
      guild.valorant_resend_time = Date.now() + 3600000
      await ctx.edit('commands.admin.resending')
      const res = await service.getMatches('valorant')
      if(!res || !res.length) return
      const res2 = await service.getResults('valorant')
      if(guild.valorant_matches.length && !res2.some(d => d.id === guild.valorant_matches[guild.valorant_matches.length - 1])) return
      let data: MatchesData[]
      if(guild.valorant_events.length > 5 && !guild.key) {
        data = res.filter(d => guild.valorant_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }
      else data = res.filter(d => guild.valorant_events.some(e => e.name === d.tournament.name))
      for(const e of guild.valorant_events) {
        if(!ctx.client.getChannel(e.channel1)) continue
        try {
          const messages = await ctx.client.rest.channels.getMessages(e.channel1, { limit: 100 })
          const messagesIds = messages.filter(m => m.author.id === ctx.client.user.id).map(m => m.id)
          if(messagesIds.length) {
            await ctx.client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
          }
        }
        catch{ }
      }
      try {
        for(const d of data) {
          if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
          for(const e of guild.valorant_events) {
            if(e.name === d.tournament.name) {
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
								.setField(`${emoji1} **${d.teams[0].name}** <:versus:1349105624180330516> **${d.teams[1].name}** ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
								.setFooter({
								  text: d.stage
								})

							const button = new ButtonBuilder()
								.setLabel(locales(guild.lang!, 'helper.palpitate'))
								.setCustomId(`predict;valorant;${d.id}`)
								.setStyle('green')

							const urlButton = new ButtonBuilder()
								.setLabel(locales(guild.lang!, 'helper.stats'))
								.setStyle('link')
								.setURL(`https://vlr.gg/${d.id}`)

							if(d.stage.toLowerCase().includes('showmatch')) continue
							if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await ctx.client.rest.channels.createMessage(e.channel1, {
							  embeds: [embed],
							  components: [
							    {
							      type: 1,
							      components: [
							        button,
											new ButtonBuilder()
												.setLabel(locales(guild.lang!, 'helper.bet'))
												.setCustomId(`bet;valorant;${d.id}`)
												.setStyle('gray'),
											urlButton,
											new ButtonBuilder()
												.setLabel(locales(guild.lang!, 'helper.pickem.label'))
												.setStyle('blue')
												.setCustomId('pickem')
							      ]
							    }
							  ]
							}).catch(() => { })
							else {
								guild.valorant_tbd_matches.push({
								  id: d.id!,
								  channel: e.channel1
								})
							}
            }
          }
        }
      }
      catch{ }
      await prisma.guilds.update({
        where: {
          id: ctx.interaction.guildID!
        },
        data: {
          valorant_matches: guild.valorant_matches,
          valorant_tbd_matches: guild.valorant_tbd_matches,
          valorant_resend_time: guild.valorant_resend_time
        }
      })
      await ctx.edit('commands.admin.resent')
    }
    else if(ctx.args[2] === 'continue' && ctx.args[3] === 'lol') {
      await (ctx.interaction as ComponentInteraction).deferUpdate()
      const guild = (await prisma.guilds.findUnique({ where: { id: ctx.interaction.guild!.id } }))!
      if(guild.lol_resend_time > Date.now()) {
        return await ctx.edit('commands.admin.resend_time', { t: `<t:${(guild.lol_resend_time / 1000).toFixed(0)}:R>` })
      }
      guild.lol_matches = []
      guild.lol_tbd_matches = []
      guild.lol_resend_time = Date.now() + 3600000
      await ctx.edit('commands.admin.resending')
      const res = await service.getMatches('lol')
      if(!res || !res.length) return
      const res2 = await service.getResults('lol')
      if(guild.lol_matches.length && !res2.some(d => d.id === guild.lol_matches[guild.lol_matches.length - 1])) return
      let data: MatchesData[]
      if(guild.lol_events.length > 5 && !guild.key) {
        data = res.filter(d => guild.lol_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }
      else data = res.filter(d => guild.lol_events.some(e => e.name === d.tournament.name))
      for(const e of guild.lol_events) {
        if(!ctx.client.getChannel(e.channel1)) continue
        try {
          const messages = await ctx.client.rest.channels.getMessages(e.channel1, { limit: 100 })
          const messagesIds = messages.filter(m => m.author.id === ctx.client.user.id).map(m => m.id)
          if(messagesIds.length) {
						ctx.client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
          }
        }
        catch{ }
      }
      try {
        for(const d of data) {
          if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
          for(const e of guild.lol_events) {
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
								.setField(`${emoji1} **${d.teams[0].name}** <:versus:1349105624180330516> **${d.teams[1].name}** ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
								.setFooter({
								  text: d.stage
								})
							const button = new ButtonBuilder()
								.setLabel(t('helper.palpitate'))
								.setCustomId(`predict;lol;${d.id}`)
								.setStyle('green')

							if(d.stage.toLowerCase().includes('showmatch')) continue
							if(d.teams[0].name !== 'TBD' && d.teams[1].name !== 'TBD') await ctx.client.rest.channels.createMessage(e.channel1, {
							  embeds: [embed],
							  components: [
							    {
							      type: 1,
							      components: [
							        button,
											new ButtonBuilder()
												.setLabel(locales(guild.lang!, 'helper.bet'))
												.setCustomId(`bet;lol;${d.id}`)
												.setStyle('gray'),
											new ButtonBuilder()
												.setLabel(locales(guild.lang!, 'helper.pickem.label'))
												.setStyle('blue')
												.setCustomId('pickem')
							      ]
							    }
							  ]
							}).catch(() => { })
							else {
								guild.lol_tbd_matches.push({
								  id: d.id!,
								  channel: e.channel1
								})
							}
            }
          }
        }
      }
      catch{ }
      await prisma.guilds.update({
        where: {
          id: ctx.interaction.guildID!
        },
        data: {
          lol_matches: guild.lol_matches,
          lol_tbd_matches: guild.lol_tbd_matches,
          lol_resend_time: guild.lol_resend_time
        }
      })
      await ctx.edit('commands.admin.resent')
    }
  }
})