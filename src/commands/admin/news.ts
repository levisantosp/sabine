import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import createCommand from "../../structures/command/createCommand.ts"

export default createCommand({
  name: "news",
  category: "admin",
  nameLocalizations: {
    "pt-BR": "noticias"
  },
  description: "Manage news feature",
  descriptionLocalizations: {
    "pt-BR": "Gerencie a funcionalidade de notícias"
  },
  options: [
    {
      type: 2,
      name: "enable",
      nameLocalizations: {
        "pt-BR": "habilitar"
      },
      description: "Enable news feature",
      descriptionLocalizations: {
        "pt-BR": "Habilitar"
      },
      options: [
        {
          type: 1,
          name: "valorant",
          description: "Enable VALORANT news feature",
          descriptionLocalizations: {
            "pt-BR": "Habilita a funcionalidade de notícias de VALORANT"
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
          description: "Enable League of Legends news feature",
          descriptionLocalizations: {
            "pt-BR": "Habilita a funcionalidade de notícias de League of Legends"
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
      description: "Disable news feature",
      descriptionLocalizations: {
        "pt-BR": "Desabilitar a funcionalidade de notícias"
      },
      options: [
        {
          type: 1,
          name: "valorant",
          description: "Disable VALORANT news feature",
          descriptionLocalizations: {
            "pt-BR": "Desabilita a funcionalidade de notícias de VALORANT"
          }
        },
        {
          type: 1,
          name: "lol",
          description: "Disable League of Legends news feature",
          descriptionLocalizations: {
            "pt-BR": "Desabilita a funcionalidade de notícias de League of Legends"
          }
        }
      ]
    }
  ],
  async run({ ctx }) {
    if(ctx.args[0] === "enable") {
      const games = {
        valorant: async() => {
          if(!ctx.guild || !ctx.db.guild) return
          const channel = ctx.guild.channels.get(ctx.args[2].toString())!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.news.invalid_channel")
          ctx.db.guild.valorant_news_channel = channel.id
          await ctx.db.guild.save()
          await ctx.reply("commands.news.news_enabled", { ch: channel.mention })
        },
        lol: async() => {
          if(!ctx.guild || !ctx.db.guild) return
          const channel = ctx.guild.channels.get(ctx.args[2].toString())!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.news.invalid_channel")
          ctx.db.guild.lol_news_channel = channel.id
          await ctx.db.guild.save()
          await ctx.reply("commands.news.news_enabled", { ch: channel.mention })
        }
      }
      await games[ctx.args[1] as "valorant" | "lol"]()
    }
    else {
      const games = {
        valorant: async() => {
          if(!ctx.db.guild) return
          ctx.db.guild.valorant_news_channel = null
          await ctx.db.guild.save()
          await ctx.reply("commands.news.news_disabled")
        },
        lol: async() => {
          if(!ctx.db.guild) return
          ctx.db.guild.lol_news_channel = null
          await ctx.db.guild.save()
          await ctx.reply("commands.news.news_disabled")
        }
      }
      await games[ctx.args[1] as "valorant" | "lol"]()
    }
  }
})