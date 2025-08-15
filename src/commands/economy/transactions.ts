import { getPlayer } from "players"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"
import { ApplicationCommandOptionTypes } from "oceanic.js"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"

export default createCommand({
  name: "transactions",
  nameLocalizations: {
    "pt-BR": "transações"
  },
  description: "View your player transactions",
  descriptionLocalizations: {
    "pt-BR": "Veja sua transação de jogadores"
  },
  category: "economy",
  options: [
    {
      type: ApplicationCommandOptionTypes.INTEGER,
      name: "page",
      nameLocalizations: {
        "pt-BR": "página"
      },
      description: "Provide a page",
      descriptionLocalizations: {
        "pt-BR": "Informe a página"
      }
    }
  ],
  userInstall: true,
  messageComponentInteractionTime: 5 * 60 * 1000,
  async run({ ctx, t, client }) {
    const page = Number(ctx.args[0]) || 1
    let transactions = (await client.prisma.transactions.findMany({
      where: {
        userId: ctx.db.user.id
      }
    })).sort((a, b) => b.when.getTime() - a.when.getTime())
    let array = transactions
    if(page === 1) {
      transactions = transactions.slice(0, 10)
    }
    else transactions = transactions.slice(page * 10 - 10, page * 10)
    if(!transactions.length) {
      return await ctx.reply("commands.transactions.none_yet")
    }
    const embed = new EmbedBuilder()
    .setTitle(t("commands.transactions.embed.title"))
    .setFooter({
      text: t(
        "commands.transactions.embed.footer",
        {
          page,
          pages: Math.ceil(array.length / 10)
        }
      )
    })
    let description = ""
    for(const transaction of transactions) {
      const timestamp = (transaction.when.getTime() / 1000).toFixed(0)
      const player = getPlayer(transaction.player)
      description += `[<t:${timestamp}:d> <t:${timestamp}:t> | <t:${timestamp}:R>] ${t(`commands.transactions.type.${transaction.type}`, { player: `${player?.name} (${player?.collection})`, price: transaction.price?.toLocaleString(), user: `<@${transaction.who}>` })}\n`
    }
    embed.setDesc(description)
    const previous = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176223621611572")
    .setCustomId(`transactions;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous`)
    const next = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176291829121028")
    .setCustomId(`transactions;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next`)
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
  },
  async createMessageComponentInteraction({ ctx, t, client }) {
    ctx.setFlags(64)
    const page = Number(ctx.args[2])
    let transactions = (await client.prisma.transactions.findMany({
      where: {
        userId: ctx.db.user.id
      }
    })).sort((a, b) => b.when.getTime() - a.when.getTime())
    let array = transactions
    transactions = transactions.slice(page * 10 - 10, page * 10)
    if(!transactions.length) {
      return await ctx.reply("commands.transactions.none_yet")
    }
    const embed = new EmbedBuilder()
    .setTitle(t("commands.transactions.embed.title"))
    .setFooter({
      text: t(
        "commands.transactions.embed.footer",
        {
          page,
          pages: Math.ceil(array.length / 10)
        }
      )
    })
    let description = ""
    for(const transaction of transactions) {
      const timestamp = (transaction.when.getTime() / 1000).toFixed(0)
      const player = getPlayer(transaction.player)
      description += `[<t:${timestamp}:d> <t:${timestamp}:t> | <t:${timestamp}:R>] ${t(`commands.transactions.type.${transaction.type}`, { player: `${player?.name} (${player?.collection})`, price: transaction.price?.toLocaleString(), user: `<@${transaction.who}>` })}\n`
    }
    embed.setDesc(description)
    const previous = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176223621611572")
    .setCustomId(`transactions;${ctx.interaction.user.id};${page - 1};previous`)
    const next = new ButtonBuilder()
    .setStyle("blue")
    .setEmoji("1404176291829121028")
    .setCustomId(`transactions;${ctx.interaction.user.id};${page + 1};next`)
    if(page <= 1) previous.setDisabled()
    if(page >= Math.ceil(array.length / 10)) next.setDisabled()
    await ctx.edit(embed.build({
      components: [
        {
          type: 1,
          components: [previous, next]
        }
      ]
    }))
  }
})