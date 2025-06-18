import { Key, KeySchemaInterface } from "../../database/index.js"
import createCommand from "../../structures/command/createCommand.js"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.js"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.js"

export default createCommand({
  name: "premium",
  category: "premium",
  description: "Shows your premium's informations",
  descriptionLocalizations: {
    "pt-BR": "Mostra as informações do seu premium"
  },
  botPermissions: ["EMBED_LINKS"],
  async run({ ctx, locale }) {
    if(!ctx.db.user.plan || ctx.db.user.plan.type !== "PREMIUM") {
      ctx.reply("commands.premium.you_dont_have_premium")
      return
    }
    const button = new ButtonBuilder()
      .setLabel(locale("commands.premium.button.label"))
      .setStyle("blue")
      .setCustomId(`premium;${ctx.interaction.user.id}`)
    const embed = new EmbedBuilder()
      .setTitle("Premium")
      .setDesc(locale(
        "commands.premium.embed.description",
        {
          expiresAt: `<t:${(ctx.db.user.plan.expiresAt! / 1000).toFixed(0)}:R>`
        }
      ))
    ctx.reply(button.build(embed.build()))
  },
  async createInteraction({ ctx, locale }) {
    await ctx.interaction.defer(64)
    const keys = await Key.find({ user: { $eq: ctx.args[1] } }) as KeySchemaInterface[]
    if(!keys.length) {
      ctx.reply("commands.premium.you_dont_have_keys")
      return
    }
    const embed = new EmbedBuilder()
    for(const key of keys) {
      embed.addField(
        key.type,
        locale(
          "commands.premium.embed.field.value",
          {
            expiresAt: `<t:${(key.expiresAt! / 1000).toFixed(0)}:R>`,
            key: key.id
          }
        )
      )
    }
    ctx.reply(embed.build())
  }
})