import { ActionRowComponents, ComponentInteraction } from 'eris'
import { User } from '../../database'
import { App, ButtonBuilder, Command, CommandContext, EmbedBuilder } from '../structures'


export default class LeaderboardCommand extends Command {
  constructor(client: App) {    
    super({
      client,
      name: 'leaderboard',
      description: 'Ranking of guesses',
      description_localizations: {
        'pt-BR': 'Ranking de palpites'
      },
      syntax: 'leaderboard <page>',
      examples: [
        'leaderboard',
        'leaderboard 1',
        'leaderboard 2',
        'leaderboard 5'
      ],
      options: [
        {
          type: 4,
          name: 'page',
          name_localizations: {
            'pt-BR': 'pagina'
          },
          description: 'Insert the page',
          description_localizations: {
            'pt-BR': 'Insira a página'
          }
        }
      ]
    })
  }
  async run(ctx: CommandContext) {
    let users = (await User.find({
      guessesRight: {
        $gt: 0
      }
    })).sort((a: any, b: any) => b.guessesRight - a.guessesRight)
    let array = users
    let page = Number(ctx.args[0])
    if(!page || page === 1 || isNaN(page)) {
      users = users.slice(0, 10)
      page = 1
    }
    else users = users.slice(page * 10 - 10, page * 10)
    if(!users.length) return ctx.reply('commands.leaderboard.no_users')
    const embed = new EmbedBuilder()
    .setAuthor(this.locale('commands.leaderboard.author', {
      page,
      pages: Math.ceil(array.length / 10)
    }))
    .setTitle(this.locale('commands.leaderboard.title'))
    .setThumbnail((await this.getUser(array[0].id))?.avatarURL!)

    let pos = 0
    if(!isNaN(page) && page > 1) pos = page * 10 - 10
    for(const user of users) {
      pos++
      const u = await this.getUser(user.id)
      let field = `${pos} - ${u?.username}`
      if(pos === 1) field = `🥇 - ${u?.username}`
      if(pos === 2) field = `🥈 - ${u?.username}`
      if(pos === 3) field = `🥉 - ${u?.username}`
      if(u) embed.addField(field, this.locale('commands.leaderboard.field', {
        t: user.guessesRight
      }))
    }
    embed.setFooter(this.locale('commands.leaderboard.footer', {
      pos: array.findIndex((user: any) => user.id === ctx.callback.member?.id) + 1
    }))
    const previous = new ButtonBuilder()
    .setEmoji('◀️')
    .setCustomId(`leaderboard;${ctx.callback.member?.id};${page - 1 < 1 ? 1 : page - 1};previous`)
    .setStyle('gray')
    const next = new ButtonBuilder()
    .setEmoji('▶')
    .setCustomId(`leaderboard;${ctx.callback.member?.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next`)
    .setStyle('gray')
    if(page <= 1) previous.setDisabled()
    if(page >= Math.ceil(array.length / 10)) next.setDisabled()
    ctx.reply({
      embed,
      components: [
        {
          type: 1,
          components: [previous, next] as ActionRowComponents[]
        }
      ]
    })
  }
  async execInteraction(i: ComponentInteraction, args: string[]) {
    if(i.member?.id !== args[1]) return await i.deferUpdate()
    await i.deferUpdate()
    await i.editParent(
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
            ] as ActionRowComponents[]
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
    .setAuthor(this.locale('commands.leaderboard.author', {
      page: args[2],
      pages: Math.ceil(array.length / 10)
    }))
    .setTitle(this.locale('commands.leaderboard.title'))
    .setThumbnail((await this.getUser(array[0].id))?.avatarURL!)

    let pos = 0
    if(Number(args[2]) > 1) pos = 1 * Number(args[2]) * 10 - 10
    for(const user of users) {
      pos++
      const u = await this.getUser(user.id)
      let field = `${pos} - ${u?.username}`
      if(pos === 1) field = `🥇 - ${u?.username}`
      if(pos === 2) field = `🥈 - ${u?.username}`
      if(pos === 3) field = `🥉 - ${u?.username}`
      if(u) embed.addField(field, this.locale('commands.leaderboard.field', {
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
    i.editParent({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [previous, next] as ActionRowComponents[]
        }
      ]
    })
  }
}