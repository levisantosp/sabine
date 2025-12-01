import { ButtonStyle, ContainerBuilder } from 'discord.js'
import createCommand from '../../structures/command/createCommand'

const price = {
    ascendant: 500,
    diamond: 250,
    platinum: 200,
    gold: 150
} as const

export default createCommand({
    name: 'shop',
    nameLocalizations: {
        'pt-BR': 'loja'
    },
    category: 'economy',
    description: 'Card pack shop',
    descriptionLocalizations: {
        'pt-BR': 'Loja de pacotes de cartas'
    },
    messageComponentInteractionTime: 5 * 60 * 1000,
    userInstall: true,
    async run({ ctx }) {
        const container = new ContainerBuilder()
      .setAccentColor(6719296)
      .addTextDisplayComponents(
          text => text.setContent(ctx.t('commands.shop.container.title'))
      )
      .addSectionComponents(
          section => section
          .addTextDisplayComponents(
              text => text.setContent(ctx.t('commands.shop.container.text.gold', { price: price.gold }))
          )
          .setButtonAccessory(
              button => button
              .setStyle(ButtonStyle.Success)
              .setLabel(ctx.t('commands.shop.container.button'))
              .setCustomId(`shop;${ctx.db.user.id};gold`)
              .setDisabled(ctx.db.user.fates < price.gold)
          )
      )
      .addSectionComponents(
          section => section
          .addTextDisplayComponents(
              text => text.setContent(ctx.t('commands.shop.container.text.platinum', { price: price.platinum }))
          )
          .setButtonAccessory(
              button => button
              .setStyle(ButtonStyle.Success)
              .setLabel(ctx.t('commands.shop.container.button'))
              .setCustomId(`shop;${ctx.db.user.id};platinum`)
              .setDisabled(ctx.db.user.fates < price.platinum)
          )
      )
      .addSectionComponents(
          section => section
          .addTextDisplayComponents(
              text => text.setContent(ctx.t('commands.shop.container.text.diamond', { price: price.diamond }))
          )
          .setButtonAccessory(
              button => button
              .setStyle(ButtonStyle.Success)
              .setLabel(ctx.t('commands.shop.container.button'))
              .setCustomId(`shop;${ctx.db.user.id};diamond`)
              .setDisabled(ctx.db.user.fates < price.diamond)
          )
      )
      .addSectionComponents(
          section => section
          .addTextDisplayComponents(
              text => text.setContent(ctx.t('commands.shop.container.text.ascendant', { price: price.ascendant }))
          )
          .setButtonAccessory(
              button => button
              .setStyle(ButtonStyle.Success)
              .setLabel(ctx.t('commands.shop.container.button'))
              .setCustomId(`shop;${ctx.db.user.id};ascendant`)
              .setDisabled(ctx.db.user.fates < price.ascendant)
          )
      )

        await ctx.reply({
            flags: 'IsComponentsV2',
            components: [container]
        })
    },
    async createMessageComponentInteraction({ ctx }) {
        const args: {[key: string]: () => Promise<unknown>} = {
            gold: async() => {
                if(ctx.db.user.fates < price.gold) {
                    return await ctx.reply('commands.shop.not_enough')
                }

                ctx.db.user.fates -= price.gold
                ctx.db.user.gold_packs += 1

                await ctx.db.user.save()
                await ctx.reply('commands.shop.success.gold', { fates: price.gold })
            },
            platinum: async() => {
                if(ctx.db.user.fates < price.platinum) {
                    return await ctx.reply('commands.shop.not_enough')
                }

                ctx.db.user.fates -= price.platinum
                ctx.db.user.platinum_packs += 1

                await ctx.db.user.save()
                await ctx.reply('commands.shop.success.platinum', { fates: price.platinum })
            },
            diamond: async() => {
                if(ctx.db.user.fates < price.diamond) {
                    return await ctx.reply('commands.shop.not_enough')
                }

                ctx.db.user.fates -= price.diamond
                ctx.db.user.diamond_packs += 1

                await ctx.db.user.save()
                await ctx.reply('commands.shop.success.diamond', { fates: price.diamond })
            },
            ascendant: async() => {
                if(ctx.db.user.fates < price.ascendant) {
                    return await ctx.reply('commands.shop.not_enough')
                }

                ctx.db.user.fates -= price.ascendant
                ctx.db.user.ascendant_packs += 1

                await ctx.db.user.save()
                await ctx.reply('commands.shop.success.gold', { fates: price.ascendant })
            }
        }

        if(!args[ctx.args[2]]) return

    ctx.setFlags(64)
    
    await args[ctx.args[2]]()
    }
})