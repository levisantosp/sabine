import { locale } from "moment"
import { Key, KeySchemaInterface, User, UserSchemaInterface } from "../database"
import { ButtonBuilder, createCommand, EmbedBuilder } from "../structures"

export default createCommand({
  name: "premium",
  description: "Shows your premium's informations",
  descriptionLocalizations: {
    "pt-BR": "Mostra as informações do seu premium"
  },
  botPermissions: ["EMBED_LINKS"],
  async run({ ctx, locale }) {
    if(!ctx.db.user.plans.length) {
      ctx.reply("commands.premium.you_dont_have_premium");
      return;
    }
    const button = new ButtonBuilder()
    .setLabel(locale("commands.premium.button.label"))
    .setStyle("blue")
    .setCustomId(`premium;${ctx.interaction.user.id}`);
    const embeds = [
      new EmbedBuilder()
      .setTitle("Premium")
      .setDesc(locale(
        "commands.premium.embed.description",
        {
          type: ctx.db.user.plans[0].type,
          expiresAt: `<t:${(ctx.db.user.plans[0].expiresAt / 1000).toFixed(0)}:R>`
        }
      ))
    ];
    const embed = new EmbedBuilder()
    .setTitle(locale("commands.premium.embed.title"))
    if(ctx.db.user.plans.length >= 2) {
      for(const premium of ctx.db.user.plans.splice(1)) {
        embed.addField(
          `Premium ${premium.type}`,
          locale(
            "commands.premium.embed.field.value",
            {
              expiresAt: `<t:${(premium.expiresAt / 1000).toFixed(0)}:R>`
            }
          )
        );
      }
      embeds.push(embed);
    }
    ctx.reply(button.build({ embeds }));
  },
  async createInteraction({ ctx, locale }) {
    await ctx.interaction.defer(64);
    const keys = await Key.find({ user: { $eq: ctx.args[1] } }) as KeySchemaInterface[];
    if(!keys.length) {
      ctx.reply("commands.premium.you_dont_have_keys");
      return;
    }
    const embed = new EmbedBuilder();
    for(const key of keys) {
      if(key.canBeActivated && (key.canBeActivated && key.canBeActivated >= Date.now())) {
        embed.addField(
          `Premium ${key.type}`,
          locale(
            "commands.premium.embed.field.value2",
            {
              key: key.id,
              0: `<t:${(key.canBeActivated / 1000).toFixed(0)}:R>`
            }
          )
        );
      }
      else {
        embed.addField(
          `Premium ${key.type}`,
          locale(
            "commands.premium.embed.field.value3",
            {
              expiresAt: `<t:${(key.expiresAt! / 1000).toFixed(0)}:R>`,
              key: key.id
            }
          )
        );
      }
    }
    ctx.reply(embed.build());
  }
});