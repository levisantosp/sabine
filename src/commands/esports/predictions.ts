import type { ComponentInteraction } from 'oceanic.js'
import createCommand from '../../structures/command/createCommand.ts'
import EmbedBuilder from '../../structures/builders/EmbedBuilder.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'

export default createCommand({
  name: 'predictions',
  category: 'esports',
  nameLocalizations: {
    'pt-BR': 'palpites'
  },
  description: 'Shows your predictions',
  descriptionLocalizations: {
    'pt-BR': 'Mostra seus palpites'
  },
  options: [
    {
      type: 1,
      name: 'valorant',
      description: 'Shows your VALORANT predictions',
      descriptionLocalizations: {
        'pt-BR': 'Mostra seus palpites de VALORANT'
      },
      options: [
        {
          type: 4,
          name: 'page',
          nameLocalizations: {
            'pt-BR': 'página'
          },
          description: 'Insert the page',
          descriptionLocalizations: {
            'pt-BR': 'Insira a página'
          }
        }
      ]
    },
    {
      type: 1,
      name: 'lol',
      description: 'Shows your League of Legends predictions',
      descriptionLocalizations: {
        'pt-BR': 'Mostra seus palpites de League of Legends'
      },
      options: [
        {
          type: 4,
          name: 'page',
          nameLocalizations: {
            'pt-BR': 'página'
          },
          description: 'Insert the page',
          descriptionLocalizations: {
            'pt-BR': 'Insira a página'
          }
        }
      ]
    }
  ],
  syntax: 'predictions <page>',
  examples: [
    'predictions valorant',
    'precitions lol',
    'predictions valorant 1',
    'predictions lol 2',
    'predictions valorant 5'
  ],
  userInstall: true,
  async run({ ctx, t }) {
    if(ctx.args[0] === 'valorant') {
      if(!ctx.db.user.valorant_predictions.length) {
        return await ctx.reply('commands.predictions.no_predictions')
      }
      let preds = ctx.db.user.valorant_predictions.reverse()
      const page = !ctx.args[1] ? 1 : Number(ctx.args[1])
      const pages = Math.ceil(ctx.db.user.valorant_predictions.length / 5)
      if(page === 1) preds = preds.slice(0, 5)
      else preds = preds.slice(page * 5 - 5, page * 5)
      if(!preds.length) {
        return await ctx.reply('commands.predictions.no_pages')
      }
      const embed = new EmbedBuilder()
        .setAuthor({
          name: t('commands.predictions.embed.author'),
          iconURL: ctx.interaction.user.avatarURL()
        })
        .setDesc(t('commands.predictions.embed.desc', {
          correct: ctx.db.user.correct_predictions,
          wrong: ctx.db.user.wrong_predictions,
          t: ctx.db.user.valorant_predictions.length
        }))
        .setFooter({
          text: t('commands.predictions.embed.footer', {
            p1: isNaN(page) ? 1 : page,
            p2: pages
          })
        })
      for(const prediction of preds) {
        let status: string
        let odd = ''
        if(prediction.status === 'correct') {
          status = '\nStatus: <:success:1300882212190945292>'
        }
        else if(prediction.status === 'wrong') {
          status = '\nStatus: <:error:1300882259078938685>'
        }
        else if(prediction.status === 'pending') {
          status = '\nStatus: <a:carregando:809221866434199634>'
        }
        else status = ''
        if(prediction.odd) {
          odd += `\nOdd: \`${prediction.odd}x\``
        }
        embed.addField(`${prediction.teams[0].name} <:versus:1349105624180330516> ${prediction.teams[1].name}`, t('commands.predictions.embed.field', {
          score1: prediction.teams[0].score,
          score2: prediction.teams[1].score,
          link: `https://www.vlr.gg/${prediction.match}`
        }) + status + odd)
      }
      const previous = new ButtonBuilder()
        .setEmoji('1404176223621611572')
        .setCustomId(`predictions;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;valorant`)
        .setStyle('blue')
      const next = new ButtonBuilder()
        .setEmoji('1404176291829121028')
        .setCustomId(`predictions;${ctx.interaction.user.id};${page + 1 > pages ? pages : page + 1};next;valorant`)
        .setStyle('blue')
      if(page <= 1) previous.setDisabled()
      if(page >= pages) next.setDisabled()
      await ctx.reply(embed.build({
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      }))
    }
    else {
      if(!ctx.db.user.lol_predictions.length) {
        return await ctx.reply('commands.predictions.no_predictions')
      }
      let preds = ctx.db.user.lol_predictions.reverse()
      const page = !ctx.args[1] ? 1 : Number(ctx.args[1])
      const pages = Math.ceil(ctx.db.user.lol_predictions.length / 5)
      if(page === 1) preds = preds.slice(0, 5)
      else preds = preds.slice(page * 5 - 5, page * 5)
      if(!preds.length) {
        return await ctx.reply('commands.predictions.no_pages')
      }
      const embed = new EmbedBuilder()
        .setAuthor({
          name: t('commands.predictions.embed.author'),
          iconURL: ctx.interaction.user.avatarURL()
        })
        .setDesc(t('commands.predictions.embed.desc', {
          correct: ctx.db.user.correct_predictions,
          wrong: ctx.db.user.wrong_predictions,
          t: ctx.db.user.lol_predictions.length
        }))
        .setFooter({
          text: t('commands.predictions.embed.footer', {
            p1: isNaN(page) ? 1 : page,
            p2: pages
          })
        })
      for(const prediction of preds) {
        let status: string
        let odd = ''
        if(prediction.status === 'correct') {
          status = '\nStatus: <:success:1300882212190945292>'
        }
        else if(prediction.status === 'wrong') {
          status = '\nStatus: <:error:1300882259078938685>'
        }
        else if(prediction.status === 'pending') {
          status = '\nStatus: <a:carregando:809221866434199634>'
        }
        else status = ''
        if(prediction.odd) {
          odd += `\nOdd: \`${prediction.odd}x\``
        }
        embed.addField(`${prediction.teams[0].name} <:versus:1349105624180330516> ${prediction.teams[1].name}`, t('commands.predictions.embed.field', {
          score1: prediction.teams[0].score,
          score2: prediction.teams[1].score,
          link: `https://loltv.gg/match/${prediction.match}`
        }) + status + odd)
      }
      const previous = new ButtonBuilder()
        .setEmoji('1404176223621611572')
        .setCustomId(`predictions;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;lol`)
        .setStyle('blue')
      const next = new ButtonBuilder()
        .setEmoji('1404176291829121028')
        .setCustomId(`predictions;${ctx.interaction.user.id};${page + 1 > pages ? pages : page + 1};next;lol`)
        .setStyle('blue')
      if(page <= 1) previous.setDisabled()
      if(page >= pages) next.setDisabled()
      await ctx.reply(embed.build({
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      }))
    }
  },
  async createMessageComponentInteraction({ ctx, t }) {
    if(ctx.args[4] === 'valorant') {
      await (ctx.interaction as ComponentInteraction).deferUpdate()
      if(!ctx.db.user.valorant_predictions.length) {
        return await ctx.reply('commands.predictions.no_predictions')
      }
      let preds = ctx.db.user.valorant_predictions.reverse()
      const page = Number(ctx.args[2])
      const pages = Math.ceil(ctx.db.user.valorant_predictions.length / 5)
      preds = preds.slice(page * 5 - 5, page * 5)
      if(!preds.length) {
        return await ctx.reply('commands.predictions.no_pages')
      }
      const embed = new EmbedBuilder()
        .setAuthor({
          name: t('commands.predictions.embed.author'),
          iconURL: ctx.interaction.user.avatarURL()
        })
        .setDesc(t('commands.predictions.embed.desc', {
          correct: ctx.db.user.correct_predictions,
          wrong: ctx.db.user.wrong_predictions,
          t: ctx.db.user.valorant_predictions.length
        }))
        .setFooter({
          text: t('commands.predictions.embed.footer', {
            p1: isNaN(page) ? 1 : page,
            p2: pages
          })
        })
      for(const prediction of preds) {
        let status: string
        let odd = ''
        if(prediction.status === 'correct') {
          status = '\nStatus: <:success:1300882212190945292>'
        }
        else if(prediction.status === 'wrong') {
          status = '\nStatus: <:error:1300882259078938685>'
        }
        else if(prediction.status === 'pending') {
          status = '\nStatus: <a:carregando:809221866434199634>'
        }
        else status = ''
        if(prediction.odd) {
          odd += `\nOdd: \`${prediction.odd}x\``
        }
        embed.addField(`${prediction.teams[0].name} <:versus:1349105624180330516> ${prediction.teams[1].name}`, t('commands.predictions.embed.field', {
          score1: prediction.teams[0].score,
          score2: prediction.teams[1].score,
          link: `https://www.vlr.gg/${prediction.match}`
        }) + status + odd)
      }
      const previous = new ButtonBuilder()
        .setEmoji('1404176223621611572')
        .setStyle('blue')
        .setCustomId(`${ctx.args[0]};${ctx.args[1]};${page - 1};previous;valorant`)
      const next = new ButtonBuilder()
        .setEmoji('1404176291829121028')
        .setStyle('blue')
        .setCustomId(`${ctx.args[0]};${ctx.args[1]};${page + 1};next;valorant`)
      if(page <= 1) previous.setDisabled()
      if(page >= pages) next.setDisabled()
      await ctx.edit(embed.build({
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      }))
    }
    else {
      await (ctx.interaction as ComponentInteraction).deferUpdate()
      if(!ctx.db.user.lol_predictions.length) {
        return await ctx.reply('commands.predictions.no_predictions')
      }
      let preds = ctx.db.user.lol_predictions.reverse()
      const page = Number(ctx.args[2])
      const pages = Math.ceil(ctx.db.user.lol_predictions.length / 5)
      preds = preds.slice(page * 5 - 5, page * 5)
      if(!preds.length) {
        return await ctx.reply('commands.predictions.no_pages')
      }
      const embed = new EmbedBuilder()
        .setAuthor({
          name: t('commands.predictions.embed.author'),
          iconURL: ctx.interaction.user.avatarURL()
        })
        .setDesc(t('commands.predictions.embed.desc', {
          correct: ctx.db.user.correct_predictions,
          wrong: ctx.db.user.wrong_predictions,
          t: ctx.db.user.lol_predictions.length
        }))
        .setFooter({
          text: t('commands.predictions.embed.footer', {
            p1: isNaN(page) ? 1 : page,
            p2: pages
          })
        })
      for(const prediction of preds) {
        let status: string
        let odd = ''
        if(prediction.status === 'correct') {
          status = '\nStatus: <:success:1300882212190945292>'
        }
        else if(prediction.status === 'wrong') {
          status = '\nStatus: <:error:1300882259078938685>'
        }
        else if(prediction.status === 'pending') {
          status = '\nStatus: <a:carregando:809221866434199634>'
        }
        else status = ''
        if(prediction.odd) {
          odd += `\nOdd: \`${prediction.odd}x\``
        }
        if(prediction) embed.addField(`${prediction.teams[0].name} <:versus:1349105624180330516> ${prediction.teams[1].name}`, t('commands.predictions.embed.field', {
          score1: prediction.teams[0].score,
          score2: prediction.teams[1].score,
          link: `https://www.loltv.gg/match/${prediction.match}`
        }) + status + odd)
      }
      const previous = new ButtonBuilder()
        .setEmoji('1404176223621611572')
        .setStyle('blue')
        .setCustomId(`${ctx.args[0]};${ctx.args[1]};${page - 1};previous;lol`)
      const next = new ButtonBuilder()
        .setEmoji('1404176291829121028')
        .setStyle('blue')
        .setCustomId(`${ctx.args[0]};${ctx.args[1]};${page + 1};next;lol`)
      if(page <= 1) previous.setDisabled()
      if(page >= pages) next.setDisabled()
      await ctx.edit(embed.build({
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      }))
    }
  }
})