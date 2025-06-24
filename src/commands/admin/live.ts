import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"

export default createCommand({
  name: "live",
  category: "admin",
  description: "Manage lvie feed feature",
  descriptionLocalizations: {
    "pt-BR": "Gerencie a funcionalidade de transmissão ao vivo"
  },
  options: [
    {
      type: 2,
      name: "enable",
      nameLocalizations: {
        "pt-BR": "habilitar"
      },
      description: "Enable live feed feature",
      descriptionLocalizations: {
        "pt-BR": "Habilita a funcionalidade de transmissão aivo"
      },
      options: [
        {
          type: 1,
          name: "valorant",
          description: "Enable VALORANT live feed feature",
          descriptionLocalizations: {
            "pt-BR": "Habilita a funcionalidade de transmissão ao vivo de VALORANT"
          },
          options: [
            {
              type: 7,
              name: "channel",
              nameLocalizations: {
                "pt-BR": "canal"
              },
              description: "Enter a channel",
              descriptionLocalizations: {
                "pt-BR": "Informe o canal"
              },
              required: true
            }
          ]
        },
        {
          type: 1,
          name: "lol",
          description: "Enable League of Legends live feed feature",
          descriptionLocalizations: {
            "pt-BR": "Habilita a funcionalidade de transmissão ao vivo de League of Legends"
          },
          options: [
            {
              type: 7,
              name: "channel",
              nameLocalizations: {
                "pt-BR": "canal"
              },
              description: "Enter a channel",
              descriptionLocalizations: {
                "pt-BR": "Informe o canal"
              },
              required: true
            }
          ]
        }
      ]
    },
    {
      type: 2,
      name: "disable",
      nameLocalizations: {
        "pt-BR": "desabilitar"
      },
      description: "Disable live feed feature",
      descriptionLocalizations: {
        "pt-BR": "Desabilitar a funcionalidade de transmissão ao vivo"
      },
      options: [
        {
          type: 1,
          name: "valorant",
          description: "Disable VALORANT live feed feature",
          descriptionLocalizations: {
            "pt-BR": "Desabilita a funcionalidade de transmissão ao vivo de VALORANT"
          }
        },
        {
          type: 1,
          name: "lol",
          description: "Disable League of Legends live feed feature",
          descriptionLocalizations: {
            "pt-BR": "Desabilita a funcionalidade de transmissão ao vivo de League of Legends"
          }
        }
      ]
    }
  ],
  async run({ ctx, t, client }) {
    if(ctx.args[0] === "enable") {
      if(!ctx.db.guild.partner && !["PREMIUM"].some(k => k === ctx.db.guild.key?.type)) {
        const button = new ButtonBuilder()
          .setLabel(t("commands.news.buy_premium"))
          .setStyle("link")
          .setURL("https://discord.com/invite/FaqYcpA84r")
        await ctx.reply({
          content: t("helper.premium_feature"),
          components: [
            {
              type: 1,
              components: [button]
            }
          ]
        })
        return
      }
      const games = {
        valorant: async() => {
          if(!ctx.guild) return
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.live.invalid_channel")
          await client.prisma.guilds.update({
            where: {
              id: ctx.db.guild.id
            },
            data: {
              valorant_livefeed_channel: channel.id
            }
          })
          await ctx.reply("commands.live.live_enabled", { ch: channel.mention })
        },
        lol: async() => {
          if(!ctx.guild) return
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.live.invalid_channel")
          await ctx.reply("commands.live.live_enabled", { ch: channel.mention })
        }
      }
      await games[ctx.args[1] as "valorant" | "lol"]()
    }
    else {
      const games = {
        valorant: async() => {
          if(!ctx.guild) return
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.live.invalid_channel")
          await client.prisma.guilds.update({
            where: {
              id: ctx.db.guild.id
            },
            data: {
              valorant_livefeed_channel: {
                unset: true
              }
            }
          })
          await ctx.reply("commands.live.live_disabled")
        },
        lol: async() => {
          if(!ctx.guild) return
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.live.invalid_channel")
          await client.prisma.guilds.update({
            where: {
              id: ctx.db.guild.id
            },
            data: {
              lol_livefeed_channel: {
                unset: true
              }
            }
          })
          await ctx.reply("commands.live.live_disabled")
        }
      }
      await games[ctx.args[1] as "valorant" | "lol"]()
    }
  }
})