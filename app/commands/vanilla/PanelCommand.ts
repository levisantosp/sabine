import { SelectMenuInteraction } from '../../../types'
import { App, Command, CommandContext, EmbedBuilder, SelectMenuBuilder } from '../../structures'

export default class PanelCommand extends Command {
  constructor(client: App) {
    super({
      client,
      name: 'panel',
      aliases: ['painel', 'config'],
      description: 'Manage the bot configurations',
      permissions: ['manageChannels'],
      botPermissions: ['embedLinks'],
      syntax: 'panel vct24/vcb/vcn [channel1] [channel2]',
      examples: [
        'panel vct24 #matches #results',
        'panel vcb #matches #results',
        'panel vcn #matches #results'
      ]
    })
  }
  async run(ctx: CommandContext) {
    const p = ctx.db.guild.prefix ?? process.env.PREFIX
    if(!ctx.args[0]) {
      const menu = new SelectMenuBuilder()
      .setCustomId('control-panel')
      .addOption('Valorant Champions Tour 2024', this.locale('commands.panel.menu.option', { p, arg: 'vct24' }), 'vct24', '1234489921738375168')
      .addOption('Valorant Challengers Brazil', this.locale('commands.panel.menu.option', { p, arg: 'vcb' }), 'vcb', '1234492769360285807')
      .addOption('Valorant Challengers NA', this.locale('commands.panel.menu.option', { p, arg: 'vcn' }), 'vcn', '1234493582098825318')
      .addOption('Alterar idioma para português', '', 'lang-br', '🇧🇷')
      .addOption('Change the language to english', '', 'lang-us', '🇺🇸')
  
      const embed = new EmbedBuilder()
      .setTitle(this.locale('commands.panel.embed_title'))
      if(ctx.db.guild.events.length == 0) embed.setDescription(this.locale('commands.panel.embed_desc'))
      else for (const event of ctx.db.guild.events) {
        embed.addField(event.name, this.locale('commands.panel.embed_field', { ch: `<#${event.channel1}>, <#${event.channel2}>` }), true)
      }
  
      const msg = await ctx.reply({
        embed,
        components: [
          {
            type: 1,
            components: [menu]
          }
        ]
      })
  
      const collector = async(i: SelectMenuInteraction) => {
        if(i.data.custom_id !== 'control-panel') return
        if(i.message.id !== msg.id) return
        if(i.member?.id !== ctx.message.author.id) return

        await i.deferUpdate()

        const e = new EmbedBuilder()
        switch(i.data.values[0]) {
          case 'vct24': {
            e.setTitle('Valorant Champions Tour 2024')
            e.setThumbnail('https://imgur.com/4LBg5rL.png')
            if(ctx.db.guild.events.length == 0 || !ctx.db.guild.events.filter((e: any) => e.name == 'Valorant Champions Tour 2024')[0]) e.setDescription(this.locale('commands.panel.embed_desc2', { p, arg: 'vct24' }))
            else e.setDescription(this.locale('commands.panel.embed_desc3', { p, arg: 'vct24', ch: `<#${ctx.db.guild.events.filter((e: any) => e.name === 'Valorant Champions Tour 2024')[0].channel1}>, <#${ctx.db.guild.events.filter((e: any) => e.name === 'Valorant Champions Tour 2024')[0].channel2}>` }))
            ctx.reply(e.build())
          }
          break
          case 'vcb': {
            e.setTitle('Valorant Challengers Brazil')
            e.setThumbnail('https://imgur.com/NmlNqTL.png')
            if(ctx.db.guild.events.length == 0 || !ctx.db.guild.events.filter((e: any) => e.name == 'Valorant Challengers Brazil')[0]) e.setDescription(this.locale('commands.panel.embed_desc2', { p, arg: 'vcb' }))
            else e.setDescription(this.locale('commands.panel.embed_desc4', { p, arg: 'vcb', ch: `<#${ctx.db.guild.events.filter((e: any) => e.name === 'Valorant Challengers Brazil')[0].channel1}>, <#${ctx.db.guild.events.filter((e: any) => e.name === 'Valorant Challengers Brazil')[0].channel2}>` }))
            ctx.reply(e.build())
          }
          break
          case 'vcn': {
            e.setTitle('Valorant Challengers NA')
            e.setThumbnail('https://imgur.com/NmlNqTL.png')
            if(ctx.db.guild.events.length == 0 || !ctx.db.guild.events.filter((e: any) => e.name == 'Valorant Challengers NA')[0]) e.setDescription(this.locale('commands.panel.embed_desc2', { p, arg: 'vcn' }))
            else e.setDescription(this.locale('commands.panel.embed_desc5', { p, arg: 'vcn', ch: `<#${ctx.db.guild.events.filter((e: any) => e.name === 'Valorant Challengers NA')[0]?.channel1}>, <#${ctx.db.guild.events.filter((e: any) => e.name === 'Valorant Challengers NA')[0].channel2}>` }))
            ctx.reply(e.build())
          }
          break
          case 'lang-br': {
            ctx.db.guild.lang = 'pt'
            ctx.db.guild.save()
            ctx.reply('Idioma alterado para português.')
          }
          break
          case 'lang-us': {
            ctx.db.guild.lang = 'en'
            ctx.db.guild.save()
            ctx.reply('Language changed to english.')
          }
        }
      }
  
      this.client.on('interactionCreate', collector)
      setTimeout(() => {
        this.client.removeListener('interactionCreate', collector)
      }, 120000)
    }
    else {
      switch(ctx.args[0]) {
        case 'vct24': {
          let channel = ctx.guild.channels.get(ctx.message.channelMentions[0] ?? ctx.args[0])
          let channel2 = ctx.guild.channels.get(ctx.message.channelMentions[1] ?? ctx.args[1])
          if(!channel || channel.type !== 0) return ctx.reply('commands.panel.non-existent_channel')
          if(!channel2) return ctx.reply('commands.panel.enter_second_channel')
          if(ctx.db.guild.events[0]) ctx.db.guild.events = ctx.db.guild.events.filter((e: any) => e.name !== 'Valorant Champions Tour 2024')
          ctx.db.guild.events.push(
            {
              name: 'Valorant Champions Tour 2024',
              channel1: channel.id,
              channel2: channel2.id
            }
          )
          ctx.db.guild.save()
          ctx.reply('commands.panel.success')
        }
        break
        case 'vcb': {
          let channel = ctx.guild.channels.get(ctx.message.channelMentions[0] ?? ctx.args[0])
          let channel2 = ctx.guild.channels.get(ctx.message.channelMentions[1] ?? ctx.args[1])
          if(!channel || channel.type !== 0) return ctx.reply('commands.panel.non-existent_channel')
          if(!channel2) return ctx.reply('commands.panel.enter_second_channel')
          if(ctx.db.guild.events[0]) ctx.db.guild.events = ctx.db.guild.events.filter((e: any) => e.name !== 'Valorant Challengers Brazil')
          ctx.db.guild.events.push(
            {
              name: 'Valorant Challengers Brazil',
              channel1: channel.id,
              channel2: channel2.id
            }
          )
          ctx.db.guild.save()
          ctx.reply('commands.panel.success')
        }
        break
        case 'vcn': {
          let channel = ctx.guild.channels.get(ctx.message.channelMentions[0] ?? ctx.args[0])
          let channel2 = ctx.guild.channels.get(ctx.message.channelMentions[1] ?? ctx.args[1])
          if(!channel || channel.type !== 0) return ctx.reply('commands.panel.non-existent_channel')
          if(!channel2) return ctx.reply('commands.panel.enter_second_channel')
          if(ctx.db.guild.events[0]) ctx.db.guild.events = ctx.db.guild.events.filter((e: any) => e.name !== 'Valorant Challengers NA')
          ctx.db.guild.events.push(
            {
              name: 'Valorant Challengers NA',
              channel1: channel.id,
              channel2: channel2.id
            }
          )
          ctx.db.guild.save()
          ctx.reply('commands.panel.success')
        }
      }
    }
  }
}