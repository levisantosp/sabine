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
        user: ctx.db.user.id
      }
    })
    if(!key) {
      return await ctx.reply("commands.activatekey.invalid_key")
    }
    if((key.type === "BOOSTER" && key.active) || key.active_in.includes(ctx.guild.id)) {
      return await ctx.reply("commands.activatekey.key_already_activated")
    }
    if(key.type === "PREMIUM" && key.active_in.length >= 2) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    if(ctx.db.guild!.key) {
      const button = new ButtonBuilder()
      .setStyle("red")
      .setLabel(t("commands.activatekey.button"))
      .setCustomId(`activatekey;${ctx.interaction.user.id};${key.type};${ctx.args[0]}`)
      await ctx.reply(button.build(t("commands.activatekey.would_like_to_continue", { key: ctx.db.guild!.key.type })))
    }
    else {
      const k = await client.prisma.key.update({
        where: {
          id: key.id
        },
        data: {
          active: true,
          active_in: {
            push: ctx.guild.id
          }
        }
      })
      await client.prisma.guild.update({
        where: {
          id: ctx.db.guild!.id
        },
        data: {
          tournaments_length: 20,
          key: {
            create: {
              type: k.type,
              id: k.id,
              expires_at: k.expires_at,
              user: k.user,
              active: k.active
            }
          }
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
        user: ctx.db.user.id
      }
    })
    if(!key) {
      return await ctx.reply("commands.activatekey.invalid_key")
    }
    if((key.type === "BOOSTER" && key.active) || key.active_in.includes(ctx.guild.id)) {
      return await ctx.reply("commands.activatekey.key_already_activated")
    }
    if(key.type === "PREMIUM" && key.active_in.length >= 2) {
      return await ctx.reply("commands.activatekey.limit_reached")
    }
    const k = await client.prisma.key.update({
      where: {
        id: key.id
      },
      data: {
        active: true,
        active_in: {
          push: ctx.guild.id
        }
      }
    })
    await client.prisma.guild.update({
      where: {
        id: ctx.db.guild!.id
      },
      data: {
        tournaments_length: 20,
        key: {
          create: {
            type: k.type,
            id: k.id,
            expires_at: k.expires_at,
            user: k.user,
            active: k.active
          }
        }
      }
    })
    await ctx.reply("commands.activatekey.key_activated")
  }
})