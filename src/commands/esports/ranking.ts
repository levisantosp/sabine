import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'
import { ApplicationCommandOptionTypes } from 'oceanic.js'

export default createCommand({
  name: 'ranking',
  category: 'esports',
  description: 'Ranking of users with most correct predictions, most victories and most coins',
  descriptionLocalizations: {
    'pt-BR': 'Tabela de usuários com mais palpites corretos'
  },
  options: [
    {
      type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
      name: 'local',
      description: 'Shows the ranking of this server',
      descriptionLocalizations: {
        'pt-BR': 'Mostra a tabela de classificação desse servidor'
      },
      options: [
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: 'predictions',
          nameLocalizations: {
            'pt-BR': 'palpites'
          },
          description: 'The local ranking of predictions',
          descriptionLocalizations: {
            'pt-BR': 'Classificação local de palpites'
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.STRING,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Insert the page',
              descriptionLocalizations: {
                'pt-BR': 'Informe a página'
              }
            }
          ]
        },
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: 'coins',
          description: 'The local ranking of coins',
          descriptionLocalizations: {
            'pt-BR': 'Classificação local de coins'
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.STRING,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Insert the page',
              descriptionLocalizations: {
                'pt-BR': 'Informe a página'
              }
            }
          ]
        },
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: 'wins',
          nameLocalizations: {
            'pt-BR': 'vitórias'
          },
          description: 'The local ranking of wins',
          descriptionLocalizations: {
            'pt-BR': 'Classificação local de vitórias'
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.STRING,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Insert the page',
              descriptionLocalizations: {
                'pt-BR': 'Informe a página'
              }
            }
          ]
        }
      ]
    },
    {
      type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
      name: 'global',
      description: 'Shows the global ranking',
      descriptionLocalizations: {
        'pt-BR': 'Mostra a tabela de classificação global'
      },
      options: [
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: 'predictions',
          nameLocalizations: {
            'pt-BR': 'palpites'
          },
          description: 'The global ranking of predictions',
          descriptionLocalizations: {
            'pt-BR': 'Classificação global de palpites'
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.STRING,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Insert the page',
              descriptionLocalizations: {
                'pt-BR': 'Informe a página'
              }
            }
          ]
        },
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: 'coins',
          description: 'The global ranking of coins',
          descriptionLocalizations: {
            'pt-BR': 'Classificação global de coins'
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.STRING,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Insert the page',
              descriptionLocalizations: {
                'pt-BR': 'Informe a página'
              }
            }
          ]
        },
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: 'wins',
          nameLocalizations: {
            'pt-BR': 'vitórias'
          },
          description: 'The local ranking of wins',
          descriptionLocalizations: {
            'pt-BR': 'Classificação global de vitórias'
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.STRING,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Insert the page',
              descriptionLocalizations: {
                'pt-BR': 'Informe a página'
              }
            }
          ]
        }
      ]
    }
  ],
  syntax: 'ranking global/local <page>',
  examples: [
    'ranking global',
    'ranking global 2',
    'ranking global 5',
    'ranking local',
    'ranking local 2',
    'ranking local 5'
  ],
  isThiking: true,
  async run({ ctx, t, client }) {
    if(ctx.args[0] === 'local' && ctx.guild) {
      if(ctx.args[1] === 'predictions') {
        let users = (await client.prisma.users.findMany({
          where: {
            correct_predictions: {
              gt: 0
            }
          }
        })).filter(user => ctx.guild!.members.get(user.id)).sort((a, b) => b.correct_predictions - a.correct_predictions)
        const array = users
        let page = Number(ctx.args[1])
        if(!page || page === 1 || isNaN(page)) {
          users = users.slice(0, 10)
          page = 1
        }
        else users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.predictions.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.predictions.title'))
          .setThumb((client.users.get(array[0].id!))!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.predictions.field', {
            t: user.correct_predictions
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.predictions.footer', {
            pos: array.findIndex(user => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;local;predictions`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;local;predictions`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= Math.ceil(array.length / 10)) next.setDisabled()
        await ctx.reply(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[1] === 'coins') {
        let users = (await client.prisma.users.findMany({
          where: {
            coins: {
              gt: 0
            }
          }
        })).filter(user => ctx.guild!.members.get(user.id)).sort((a, b) => Number(b.coins - a.coins))
        const array = users
        let page = Number(ctx.args[1])
        if(!page || page === 1 || isNaN(page)) {
          users = users.slice(0, 10)
          page = 1
        }
        else users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.coins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.coins.title'))
          .setThumb((client.users.get(array[0].id!))!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.coins.field', {
            t: user.coins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.coins.footer', {
            pos: array.findIndex(user => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;local;coins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;local;coins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= Math.ceil(array.length / 10)) next.setDisabled()
        await ctx.reply(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[1] === 'wins') {
        let users = (await client.prisma.users.findMany({
          where: {
            wins: {
              gt: 0
            }
          }
        })).filter(user => ctx.guild!.members.get(user.id)).sort((a, b) => b.wins - a.wins)
        const array = users
        let page = Number(ctx.args[1])
        if(!page || page === 1 || isNaN(page)) {
          users = users.slice(0, 10)
          page = 1
        }
        else users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.wins.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.wins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.wins.title'))
          .setThumb((client.users.get(array[0].id!))!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.wins.field', {
            t: user.wins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.wins.footer', {
            pos: array.findIndex(user => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;local;wins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;local;wins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= Math.ceil(array.length / 10)) next.setDisabled()
        await ctx.reply(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
    }
    else {
      if(ctx.args[1] === 'predictions') {
        let users = (await client.prisma.users.findMany({
          where: {
            correct_predictions: {
              gt: 0
            }
          }
        })).sort((a, b) => b.correct_predictions - a.correct_predictions)
        const array = users
        let page = Number(ctx.args[1])
        if(!page || page === 1 || isNaN(page)) {
          users = users.slice(0, 10)
          page = 1
        }
        else users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.predictions.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.predictions.title'))
          .setThumb((client.users.get(array[0].id!))!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.predictions.field', {
            t: user.correct_predictions
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.predictions.footer', {
            pos: array.findIndex(user => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;global;predictions`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;global;predictions`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= Math.ceil(array.length / 10)) next.setDisabled()
        await ctx.reply(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[1] === 'coins') {
        let users = (await client.prisma.users.findMany({
          where: {
            coins: {
              gt: 0
            }
          }
        })).sort((a, b) => Number(b.coins - a.coins))
        const array = users
        let page = Number(ctx.args[1])
        if(!page || page === 1 || isNaN(page)) {
          users = users.slice(0, 10)
          page = 1
        }
        else users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.coins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.coins.title'))
          .setThumb((client.users.get(array[0].id!))!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.coins.field', {
            t: user.coins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.coins.footer', {
            pos: array.findIndex(user => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;global;coins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;global;coins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= Math.ceil(array.length / 10)) next.setDisabled()
        await ctx.reply(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[1] === 'wins') {
        let users = (await client.prisma.users.findMany({
          where: {
            wins: {
              gt: 0
            }
          }
        })).sort((a, b) => b.wins - a.wins)
        const array = users
        let page = Number(ctx.args[1])
        if(!page || page === 1 || isNaN(page)) {
          users = users.slice(0, 10)
          page = 1
        }
        else users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.wins.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.wins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.wins.title'))
          .setThumb((client.users.get(array[0].id!))!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.wins.field', {
            t: user.wins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.wins.footer', {
            pos: array.findIndex(user => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;global;wins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;global;wins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= Math.ceil(array.length / 10)) next.setDisabled()
        await ctx.reply(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
    }
  },
  userInstall: true,
  async createInteraction({ ctx, t, client }) {
    await ctx.interaction.deferUpdate()
    if(ctx.args[4] === 'local' && ctx.guild) {
      if(ctx.args[5] === 'predictions') {
        let users = (await client.prisma.users.findMany({
          where: {
            correct_predictions: {
              gt: 0
            }
          }
        })).filter(user => ctx.guild!.members.get(user.id)).sort((a, b) => b.correct_predictions - a.correct_predictions)
        const array = users
        const page = Number(ctx.args[2]) || 1
        const pages = Math.ceil(array.length / 10)
        users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.predictions.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.predictions.title'))
          .setThumb(client.users.get(array[0].id!)!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.predictions.field', {
            t: user.correct_predictions
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.predictions.footer', {
            pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous;local;predictions`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next;local;predictions`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= pages) next.setDisabled()
        return await ctx.edit(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[5] === 'coins') {
        let users = (await client.prisma.users.findMany({
          where: {
            coins: {
              gt: 0
            }
          }
        })).filter(user => ctx.guild!.members.get(user.id)).sort((a, b) => Number(b.coins - a.coins))
        const array = users
        const page = Number(ctx.args[2]) || 1
        const pages = Math.ceil(array.length / 10)
        users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.coins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.coins.title'))
          .setThumb(client.users.get(array[0].id!)!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.coins.field', {
            t: user.coins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.coins.footer', {
            pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous;local;coins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next;local;coins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= pages) next.setDisabled()
        return await ctx.edit(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[5] === 'wins') {
        let users = (await client.prisma.users.findMany({
          where: {
            wins: {
              gt: 0
            }
          }
        })).filter(user => ctx.guild!.members.get(user.id)).sort((a, b) => b.wins - a.wins)
        const array = users
        const page = Number(ctx.args[2]) || 1
        const pages = Math.ceil(array.length / 10)
        users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.wins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.wins.title'))
          .setThumb(client.users.get(array[0].id!)!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.wins.field', {
            t: user.wins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.wins.footer', {
            pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous;local;wins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next;local;wins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= pages) next.setDisabled()
        return await ctx.edit(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
    }
    else {
      if(ctx.args[5] === 'predictions') {
        let users = (await client.prisma.users.findMany({
          where: {
            correct_predictions: {
              gt: 0
            }
          }
        })).sort((a, b) => b.correct_predictions - a.correct_predictions)
        const array = users
        const page = Number(ctx.args[2]) || 1
        const pages = Math.ceil(array.length / 10)
        users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.predictions.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.predictions.title'))
          .setThumb(client.users.get(array[0].id!)!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.predictions.field', {
            t: user.correct_predictions
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.predictions.footer', {
            pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous;global;predictions`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next;global;predictions`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= pages) next.setDisabled()
        return await ctx.edit(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[5] === 'coins') {
        let users = (await client.prisma.users.findMany({
          where: {
            coins: {
              gt: 0
            }
          }
        })).sort((a, b) => Number(b.coins - a.coins))
        const array = users
        const page = Number(ctx.args[2]) || 1
        const pages = Math.ceil(array.length / 10)
        users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.coins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.coins.title'))
          .setThumb(client.users.get(array[0].id!)!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.coins.field', {
            t: user.coins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.coins.footer', {
            pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous;global;coins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next;global;coins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= pages) next.setDisabled()
        return await ctx.edit(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
      else if(ctx.args[5] === 'wins') {
        let users = (await client.prisma.users.findMany({
          where: {
            wins: {
              gt: 0
            }
          }
        })).sort((a, b) => b.wins - a.wins)
        const array = users
        const page = Number(ctx.args[2]) || 1
        const pages = Math.ceil(array.length / 10)
        users = users.slice(page * 10 - 10, page * 10)
        if(!users.length) {
          return await ctx.reply('commands.ranking.no_users')
        }
        const embed = new EmbedBuilder()
          .setAuthor({
            name: t('commands.ranking.wins.author', {
              page,
              pages: Math.ceil(array.length / 10)
            })
          })
          .setTitle(t('commands.ranking.wins.title'))
          .setThumb(client.users.get(array[0].id!)!.avatarURL()!)
        let pos = 0
        if(!isNaN(page) && page > 1) pos = page * 10 - 10
        for(const user of users) {
          pos++
          const u = client.users.get(user.id)
          let field = `${pos} - ${!u ? '*unknown*' : u.username}`
          if(pos === 1) field = `🥇 - ${!u ? '*unknown*' : u.username}`
          if(pos === 2) field = `🥈 - ${!u ? '*unknown*' : u.username}`
          if(pos === 3) field = `🥉 - ${!u ? '*unknown*' : u.username}`
          embed.addField(field, t('commands.ranking.wins.field', {
            t: user.wins.toLocaleString('en')
          }))
        }
        embed.setFooter({
          text: t('commands.ranking.wins.footer', {
            pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
          })
        })
        const previous = new ButtonBuilder()
          .setEmoji('◀️')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous;global;wins`)
          .setStyle('gray')
        const next = new ButtonBuilder()
          .setEmoji('▶')
          .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next;global;wins`)
          .setStyle('gray')
        if(page <= 1) previous.setDisabled()
        if(page >= pages) next.setDisabled()
        return await ctx.edit(embed.build({
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        }))
      }
    }
  }
})