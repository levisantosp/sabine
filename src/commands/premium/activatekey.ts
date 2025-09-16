import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"

export default createCommand({
  name: "activatekey",
  category: "premium",
  nameLocalizations: {
    "pt-BR": "ativarchave"
  },
  description: "Activate your premium key",
  descriptionLocalizations: {
    "pt-BR": "Ative sua chave premium"
  },
  options: [
    {
      type: 3,
      name: "key",
      nameLocalizations: {
        "pt-BR": "chave"
      },
      description: "Insert your key",
      descriptionLocalizations: {
        "pt-BR": "Insira sua chave"
      },
      required: true
    }
  ],
  syntax: "activatekey [key]",
  examples: [
    "activatekey ABCD-1234-AB12-abcdf"
  ],
  permissions: ["ADMINISTRATOR"],
  ephemeral: true,
  async run({ ctx, t, client }) {
    if(!ctx.guild) return
    const key = await client.prisma.key.findFirst({
      where: {
        id: ctx.args[0].toString()
      },
      include: {
        guildKeys: true
      }
    })
    if(!key) {
      return await ctx.reply("commands.activatekey.invalid_key")
    }
    if(key.guildKeys.some(gk => gk.guildId === ctx.guild!.id)) {
      return await ctx.reply("commands.activatekey.key_already_activated")
    }
    if(key.type === "PREMIUM" && key.guildKeys.length >= 2) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    if(key.type === "BOOSTER" && key.guildKeys.length > 0) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    const guildKey = await client.prisma.guildKey.findUnique({
      where: {
        guildId: ctx.guild.id,
        keyId: key.id
      }
    })
    console.log(guildKey)
    if(guildKey) {
      const button = new ButtonBuilder()
      .setStyle("red")
      .setLabel(t("commands.activatekey.button"))
      .setCustomId(`activatekey;${ctx.interaction.user.id};${key.type};${ctx.args[0]}`)
      await ctx.reply(button.build(t("commands.activatekey.would_like_to_continue", { key: key.type })))
    }
    else {
      await client.prisma.guildKey.create({
        data: {
          guildId: ctx.guild.id,
          keyId: key.id
        }
      })
      await ctx.reply("commands.activatekey.key_activated")
    }
  },
  messageComponentInteractionTime: 60 * 1000,
  async createMessageComponentInteraction({ ctx, client }) {
    if(!ctx.guild) return
    await ctx.interaction.defer(64)
    const key = await client.prisma.key.findFirst({
      where: {
        id: ctx.args[3]
      },
      include: {
        guildKeys: true
      }
    })
    if(!key) {
      return await ctx.reply("commands.activatekey.invalid_key")
    }
    if(key.guildKeys.some(gk => gk.guildId === ctx.guild!.id)) {
      return await ctx.reply("commands.activatekey.key_already_activated")
    }
    if(key.type === "PREMIUM" && key.guildKeys.length >= 2) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    if(key.type === "BOOSTER" && key.guildKeys.length > 0) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    await client.prisma.guildKey.create({
      data: {
        guildId: ctx.guild.id,
        keyId: key.id
      }
    })
    return await ctx.reply("commands.activatekey.key_activated")
  }
})