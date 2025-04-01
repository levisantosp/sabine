import ButtonBuilder from "../structures/builders/ButtonBuilder.js"
import createCommand from "../structures/command/createCommand.js"

export default createCommand({
  name: "news",
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
  async run({ ctx, locale }) {
    if(ctx.args[0] === "enable") {
      if(!ctx.db.guild.partner && !["PREMIUM"].some(k => k === ctx.db.guild.key?.type)) {
        const button = new ButtonBuilder()
        .setLabel(locale("commands.news.buy_premium"))
        .setStyle("link")
        .setURL("https://discord.com/invite/FaqYcpA84r");
        await ctx.reply({
          content: locale("helper.premium_feature"),
          components: [
            {
              type: 1,
              components: [button]
            }
          ]
        });
        return;
      }
      const games = {
        valorant: async() => {
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.news.invalid_channel");
          ctx.db.guild.valorant_news_channel = ctx.args[2];
          await ctx.db.guild.save();
          await ctx.reply("commands.news.news_enabled", { ch: channel.mention });
        },
        lol: async() => {
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(![0, 5].some(t => t === channel.type)) return await ctx.reply("commands.news.invalid_channel");
          ctx.db.guild.lol_news_channel = channel.id;
          await ctx.db.guild.save();
          await ctx.reply("commands.news.news_enabled", { ch: channel.mention });
        }
      }
      await games[ctx.args[1] as "valorant" | "lol"]();
    }
    else {
      const games = {
        valorant: async() => {
          await ctx.db.guild.updateOne({
            $unset: { valorant_news_channel: "" }
          });
          await ctx.reply("commands.news.news_disabled");
        },
        lol: async() => {
          await ctx.db.guild.updateOne({
            $unset: { lol_news_channel: "" }
          });
          await ctx.reply("commands.news.news_disabled");
        }
      }
      await games[ctx.args[1] as "valorant" | "lol"]();
    }
  }
});