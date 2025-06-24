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
    const key = await client.prisma.keys.findFirst()
    if(!key) {
      return await ctx.reply("commands.activatekey.invalid_key")
    }
    if((key.type === "BOOSTER" && key.active) || key.activeIn.includes(ctx.guild.id)) {
      return await ctx.reply("commands.activatekey.key_already_activated")
    }
    if(key.type === "PREMIUM" && key.activeIn.length >= 2) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    if(ctx.db.guild.key) {
      const button = new ButtonBuilder()
        .setStyle("red")
        .setLabel(t("commands.activatekey.button"))
        .setCustomId(`activatekey;${ctx.interaction.user.id};${key.type};${ctx.args[0]}`)
      await ctx.reply(button.build(t("commands.activatekey.would_like_to_continue", { key: ctx.db.guild.key.type })))
    }
    else {
      await client.prisma.keys.update({
        where: {
          id: key.id
        },
        data: {
          active: true,
          activeIn: {
            push: ctx.guild.id
          }
        }
      })
      await client.prisma.guilds.update({
        where: {
          id: ctx.db.guild.id
        },
        data: {
          tournamentsLength: 20,
          key: {
            type: key.type,
            id: key.id,
            expiresAt: key.expiresAt
          }
        }
      })
      await ctx.reply("commands.activatekey.key_activated")
    }
  },
  async createInteraction({ ctx, client }) {
    if(!ctx.guild) return
    await ctx.interaction.defer(64)
    const key = await client.prisma.keys.findFirst()
    if(!key) {
      return await ctx.reply("commands.activatekey.invalid_key")
    }
    if((key.type === "BOOSTER" && key.active) || key.activeIn.includes(ctx.guild.id)) {
      return await ctx.reply("commands.activatekey.key_already_activated")
    }
    if(key.type === "PREMIUM" && key.activeIn.length >= 2) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    await client.prisma.keys.update({
      where: {
        id: key.id
      },
      data: {
        active: true,
        activeIn: {
          push: ctx.guild.id
        }
      }
    })
    await client.prisma.guilds.update({
      where: {
        id: ctx.db.guild.id
      },
      data: {
        tournamentsLength: 20,
        key: {
          type: key.type,
          id: key.id,
          expiresAt: key.expiresAt
        }
      }
    })
    await ctx.reply("commands.activatekey.key_activated")
  }
})