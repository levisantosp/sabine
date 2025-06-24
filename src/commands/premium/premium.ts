import createCommand from "../../structures/command/createCommand.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import EmbedBuilder from "../../structures/builders/EmbedBuilder.ts"

export default createCommand({
  name: "premium",
  category: "premium",
  description: "Shows your premium's informations",
  descriptionLocalizations: {
    "pt-BR": "Mostra as informações do seu premium"
  },
  botPermissions: ["EMBED_LINKS"],
  userInstall: true,
  async run({ ctx, t }) {
    if(!ctx.db.user.plan || ctx.db.user.plan.type !== "PREMIUM") {
      ctx.reply("commands.premium.you_dont_have_premium")
      return
    }
    const button = new ButtonBuilder()
      .setLabel(t("commands.premium.button.label"))
      .setStyle("blue")
      .setCustomId(`premium;${ctx.interaction.user.id}`)
    const embed = new EmbedBuilder()
      .setTitle("Premium")
      .setDesc(t(
        "commands.premium.embed.description",
        {
          expiresAt: `<t:${(ctx.db.user.plan.expiresAt / 1000).toFixed(0)}:R>`
        }
      ))
    ctx.reply(button.build(embed.build()))
  },
  async createInteraction({ ctx, t, client }) {
    await ctx.interaction.defer(64)
    const keys = await client.prisma.keys.findMany({
      where: {
        id: ctx.args[1]
      }
    })
    if(!keys.length) {
      ctx.reply("commands.premium.you_dont_have_keys")
      return
    }
    const embed = new EmbedBuilder()
    for(const key of keys) {
      embed.addField(
        key.type,
        t(
          "commands.premium.embed.field.value",
          {
            expiresAt: `<t:${(key.expiresAt! / 1000).toFixed(0)}:R>`,
            key: key.id
          }
        )
      )
    }
    await ctx.reply(embed.build())
  }
})