import { ComponentInteraction } from 'oceanic.js'
import { User } from '../database'
import { App, ButtonBuilder, Command, CommandContext, EmbedBuilder } from '../structures'

export default class rankingCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'ranking',
      description: 'Ranking of predictions',
      descriptionLocalizations: {
        'pt-BR': 'Ranking de palpites'
      },
      syntax: 'ranking <page>',
      examples: [
        'ranking',
        'ranking 1',
        'ranking 2',
        'ranking 5'
      ],
      options: [
        {
          type: 1,
          name: 'local',
          description: 'Shows the predictions ranking of this server',
          descriptionLocalizations: {
            'pt-BR': 'Mostra o ranking de palpites deste servidor'
          },
          options: [
            {
              type: 4,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Enter a page',
              descriptionLocalizations: {
                'pt-BR': 'Informe uma página'
              }
            }
          ]
        },
        {
          type: 1,
          name: 'global',
          description: 'Shows the global predictions ranking',
          descriptionLocalizations: {
            'pt-BR': 'Mostra o ranking global de palpites'
          },
          options: [
            {
              type: 4,
              name: 'page',
              nameLocalizations: {
                'pt-BR': 'página'
              },
              description: 'Enter a page',
              descriptionLocalizations: {
                'pt-BR': 'Informe uma página'
              }
            }
          ]
        }
      ]
    })
  }
  public async run(ctx: CommandContext) {
    if(ctx.args[0] === 'local') {
      let users = (await User.find({
        guessesRight: {
          $gt: 0
        }
      })).filter(user => ctx.guild.members.get(user.id)).sort((a: any, b: any) => b.guessesRight - a.guessesRight)
      let array = users
      let page = Number(ctx.args[1])
      if(!page || page === 1 || isNaN(page)) {
        users = users.slice(0, 10)
        page = 1
      }
      else users = users.slice(page * 10 - 10, page * 10)
      if(!users.length) return ctx.reply('commands.ranking.no_users')
      const embed = new EmbedBuilder()
      .setAuthor(this.locale('commands.ranking.author', {
        page,
        pages: Math.ceil(array.length / 10)
      }))
      .setTitle(this.locale('commands.ranking.title'))
      .setThumbnail((await this.getUser(array[0].id))?.avatarURL()!)
  
      let pos = 0
      if(!isNaN(page) && page > 1) pos = page * 10 - 10
      for(const user of users) {
        pos++
        const u = await this.getUser(user.id)
        let field = `${pos} - ${u?.username}`
        if(pos === 1) field = `🥇 - ${u?.username}`
        if(pos === 2) field = `🥈 - ${u?.username}`
        if(pos === 3) field = `🥉 - ${u?.username}`
        if(u) embed.addField(field, this.locale('commands.ranking.field', {
          t: user.guessesRight
        }))
      }
      embed.setFooter(this.locale('commands.ranking.footer', {
        pos: array.findIndex((user: any) => user.id === ctx.callback.member?.id) + 1
      }))
      const previous = new ButtonBuilder()
      .setEmoji('◀️')
      .setCustomId(`ranking;${ctx.callback.member?.id};${page - 1 < 1 ? 1 : page - 1};previous;local`)
      .setStyle('gray')
      const next = new ButtonBuilder()
      .setEmoji('▶')
      .setCustomId(`ranking;${ctx.callback.member?.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;local`)
      .setStyle('gray')
      if(page <= 1) previous.setDisabled()
      if(page >= Math.ceil(array.length / 10)) next.setDisabled()
      ctx.reply({
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      })
    }
    else {
      let users = (await User.find({
        guessesRight: {
          $gt: 0
        }
      })).sort((a: any, b: any) => b.guessesRight - a.guessesRight)
      let array = users
      let page = Number(ctx.args[1])
      if(!page || page === 1 || isNaN(page)) {
        users = users.slice(0, 10)
        page = 1
      }
      else users = users.slice(page * 10 - 10, page * 10)
      if(!users.length) return ctx.reply('commands.ranking.no_users')
      const embed = new EmbedBuilder()
      .setAuthor(this.locale('commands.ranking.author', {
        page,
        pages: Math.ceil(array.length / 10)
      }))
      .setTitle(this.locale('commands.ranking.title'))
      .setThumbnail((await this.getUser(array[0].id))?.avatarURL()!)
  
      let pos = 0
      if(!isNaN(page) && page > 1) pos = page * 10 - 10
      for(const user of users) {
        pos++
        const u = await this.getUser(user.id)
        let field = `${pos} - ${u?.username}`
        if(pos === 1) field = `🥇 - ${u?.username}`
        if(pos === 2) field = `🥈 - ${u?.username}`
        if(pos === 3) field = `🥉 - ${u?.username}`
        if(u) embed.addField(field, this.locale('commands.ranking.field', {
          t: user.guessesRight
        }))
      }
      embed.setFooter(this.locale('commands.ranking.footer', {
        pos: array.findIndex((user: any) => user.id === ctx.callback.member?.id) + 1
      }))
      const previous = new ButtonBuilder()
      .setEmoji('◀️')
      .setCustomId(`ranking;${ctx.callback.member?.id};${page - 1 < 1 ? 1 : page - 1};previous`)
      .setStyle('gray')
      const next = new ButtonBuilder()
      .setEmoji('▶')
      .setCustomId(`ranking;${ctx.callback.member?.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next`)
      .setStyle('gray')
      if(page <= 1) previous.setDisabled()
      if(page >= Math.ceil(array.length / 10)) next.setDisabled()
      ctx.reply({
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      })
    }
  }
  public async execInteraction(i: ComponentInteraction, args: string[]) {
    if(args[4] === 'local') {
      if(i.member?.id !== args[1]) return await i.deferUpdate()
        await i.deferUpdate()
        await i.editOriginal(
          {
            components: [
              {
                type: 1,
                components: [
                  new ButtonBuilder()
                  .setEmoji('809221866434199634')
                  .setCustomId('blablabla')
                  .setStyle('gray')
                  .setDisabled()
                ]
              }
            ]
          }
        )
        let users = (await User.find({
          guessesRight: {
            $gt: 0
          }
        })).filter(user => i.guild!.members.get(user.id)).sort((a: any, b: any) => b.guessesRight - a.guessesRight)
        let array = users
        users = users.slice(Number(args[2]) * 10 - 10, Number(args[2]) * 10)
        const embed = new EmbedBuilder()
        .setAuthor(this.locale('commands.ranking.author', {
          page: args[2],
          pages: Math.ceil(array.length / 10)
        }))
        .setTitle(this.locale('commands.ranking.title'))
        .setThumbnail((await this.getUser(array[0].id))?.avatarURL()!)
    
        let pos = 0
        if(Number(args[2]) > 1) pos = 1 * Number(args[2]) * 10 - 10
        for(const user of users) {
          pos++
          const u = await this.getUser(user.id)
          let field = `${pos} - ${u?.username}`
          if(pos === 1) field = `🥇 - ${u?.username}`
          if(pos === 2) field = `🥈 - ${u?.username}`
          if(pos === 3) field = `🥉 - ${u?.username}`
          if(u) embed.addField(field, this.locale('commands.ranking.field', {
            t: user.guessesRight
          }))
        }
        embed.setFooter(i.message.embeds[0].footer!.text)
        let page = Number(args[2])
        const previous = new ButtonBuilder()
        .setEmoji('◀️')
        .setStyle('gray')
        const next = new ButtonBuilder()
        .setEmoji('▶')
        .setStyle('gray')
        if(args[3] === 'previous') {
          page =- 1
          if(page > Math.ceil(array.length / 10)) {
            page = Math.ceil(array.length / 10)
            next.setDisabled()
          }
          if(page < 1) {
            page = 1
            previous.setDisabled()
          }
          previous.setCustomId(`${args[0]};${args[1]};${page};previous;local`)
          next.setCustomId(`${args[0]};${args[1]};${page + 1};next;local`)
        }
        else {
          page += 1
          if(page === Math.ceil(array.length / 10) || page > Math.ceil(array.length / 10)) {
            page = Math.ceil(array.length / 10) - 1
            next.setDisabled()
          }
          if(page < 1) {
            page = 1
            previous.setDisabled()
          }
          next.setCustomId(`${args[0]};${args[1]};${page + 1};next`)
          previous.setCustomId(`${args[0]};${args[1]};${page};previous`)
        }
        i.editOriginal({
          embeds: [embed],
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        })
    }
    else {
      if(i.member?.id !== args[1]) return await i.deferUpdate()
        await i.deferUpdate()
        await i.editOriginal(
          {
            components: [
              {
                type: 1,
                components: [
                  new ButtonBuilder()
                  .setEmoji('809221866434199634')
                  .setCustomId('blablabla')
                  .setStyle('gray')
                  .setDisabled()
                ]
              }
            ]
          }
        )
        let users = (await User.find({
          guessesRight: {
            $gt: 0
          }
        })).sort((a: any, b: any) => b.guessesRight - a.guessesRight)
        let array = users
        users = users.slice(Number(args[2]) * 10 - 10, Number(args[2]) * 10)
        const embed = new EmbedBuilder()
        .setAuthor(this.locale('commands.ranking.author', {
          page: args[2],
          pages: Math.ceil(array.length / 10)
        }))
        .setTitle(this.locale('commands.ranking.title'))
        .setThumbnail((await this.getUser(array[0].id))?.avatarURL()!)
    
        let pos = 0
        if(Number(args[2]) > 1) pos = 1 * Number(args[2]) * 10 - 10
        for(const user of users) {
          pos++
          const u = await this.getUser(user.id)
          let field = `${pos} - ${u?.username}`
          if(pos === 1) field = `🥇 - ${u?.username}`
          if(pos === 2) field = `🥈 - ${u?.username}`
          if(pos === 3) field = `🥉 - ${u?.username}`
          if(u) embed.addField(field, this.locale('commands.ranking.field', {
            t: user.guessesRight
          }))
        }
        embed.setFooter(i.message.embeds[0].footer!.text)
        let page = Number(args[2])
        const previous = new ButtonBuilder()
        .setEmoji('◀️')
        .setStyle('gray')
        const next = new ButtonBuilder()
        .setEmoji('▶')
        .setStyle('gray')
        if(args[3] === 'previous') {
          page =- 1
          if(page > Math.ceil(array.length / 10)) {
            page = Math.ceil(array.length / 10)
            next.setDisabled()
          }
          if(page < 1) {
            page = 1
            previous.setDisabled()
          }
          previous.setCustomId(`${args[0]};${args[1]};${page};previous`)
          next.setCustomId(`${args[0]};${args[1]};${page + 1};next`)
        }
        else {
          page += 1
          if(page === Math.ceil(array.length / 10) || page > Math.ceil(array.length / 10)) {
            page = Math.ceil(array.length / 10) - 1
            next.setDisabled()
          }
          if(page < 1) {
            page = 1
            previous.setDisabled()
          }
          next.setCustomId(`${args[0]};${args[1]};${page + 1};next`)
          previous.setCustomId(`${args[0]};${args[1]};${page};previous`)
        }
        i.editOriginal({
          embeds: [embed],
          components: [
            {
              type: 1,
              components: [previous, next]
            }
          ]
        })
    }
  }
}