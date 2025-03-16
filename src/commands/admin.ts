import { CommandInteraction, ComponentInteraction } from "oceanic.js"
import { ButtonBuilder, createCommand, EmbedBuilder, emojis, Logger } from "../structures"
import { EventsData, MatchesData } from "../../types"
import MainController from "../scraper"
import { Guild, GuildSchemaInterface } from "../database"
const cache = new Map<string, EventsData[]>();

export default createCommand({
  name: "admin",
  description: "Add or remove tournaments, manage it, and more",
  descriptionLocalizations: {
    "pt-BR": "Adicione ou remove campeonatos, gerencie-os, e mais"
  },
  options: [
    {
      type: 2,
      name: "tournament",
      nameLocalizations: {
        "pt-BR": "campeonato"
      },
      description: "Add a tournament to announce",
      descriptionLocalizations: {
        "pt-BR": "Adicione um torneio para anunciar"
      },
      options: [
        {
          type: 1,
          name: "add",
          nameLocalizations: {
            "pt-BR": "adicionar"
          },
          description: "Add a tournament to announce",
          descriptionLocalizations: {
            "pt-BR": "Adicione um camepenato para anunciar"
          },
          options: [
            {
              type: 3,
              name: "tournament",
              nameLocalizations: {
                "pt-BR": "campeonato"
              },
              description: "Enter a tournament",
              descriptionLocalizations: {
                "pt-BR": "Informe o campeonato"
              },
              autocomplete: true,
              required: true
            },
            {
              type: 7,
              name: "matches_channel",
              nameLocalizations: {
                "pt-BR": "canal_de_partidas"
              },
              description: "Enter a channel",
              descriptionLocalizations: {
                "pt-BR": "Informe o canal"
              },
              required: true
            },
            {
              type: 7,
              name: "results_channel",
              nameLocalizations: {
                "pt-BR": "canal_de_resultados"
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
          name: "remove",
          nameLocalizations: {
            "pt-BR": "remover"
          },
          description: "Remove a tournament",
          descriptionLocalizations: {
            "pt-BR": "Remove um torneio"
          },
          options: [
            {
              type: 3,
              name: "tournament",
              nameLocalizations: {
                "pt-BR": "campeonato"
              },
              description: "Enter a tournament",
              descriptionLocalizations: {
                "pt-BR": "Informe um torneio"
              },
              autocomplete: true,
              required: true
            }
          ]
        }
      ]
    },
    {
      type: 1,
      name: "dashboard",
      nameLocalizations: {
        "pt-BR": "painel"
      },
      description: "Shows the dashboard",
      descriptionLocalizations: {
        "pt-BR": "Mostra o painel de controle"
      }
    },
    {
      type: 1,
      name: "language",
      nameLocalizations: {
        "pt-BR": "idioma"
      },
      description: "Change the languague that I interact on this server",
      descriptionLocalizations: {
        "pt-BR": "Altera o idioma que eu interajo neste servidor"
      },
      options: [
        {
          type: 3,
          name: "lang",
          description: "Choose the language",
          descriptionLocalizations: {
            "pt-BR": "Escolha o idioma"
          },
          choices: [
            {
              name: "pt-BR",
              value: "pt"
            },
            {
              name: "en-US",
              value: "en"
            }
          ],
          required: true
        }
      ]
    },
    {
      type: 2,
      name: "news",
      nameLocalizations: {
        "pt-BR": "noticias"
      },
      description: "Add or remove the news feature",
      descriptionLocalizations: {
        "pt-BR": "Adiciona ou remove a funcionalidade de notícias"
      },
      options: [
        {
          type: 1,
          name: "enable",
          nameLocalizations: {
            "pt-BR": "habilitar"
          },
          description: "Enable the news feature to the server",
          descriptionLocalizations: {
            "pt-BR": "Habilita a funcionalidade de notícias ao servidor"
          },
          options: [
            {
              type: 7,
              name: "channel",
              nameLocalizations: {
                "pt-BR": "canal"
              },
              description: "The channel were the news will be sent",
              descriptionLocalizations: {
                "pt-BR": "Canal onde as notícias serão enviadas"
              },
              required: true
            }
          ]
        },
        {
          type: 1,
          name: "disable",
          nameLocalizations: {
            "pt-BR": "desabilitar"
          },
          description: "Disable the news feature for this server",
          descriptionLocalizations: {
            "pt-BR": "Desabilita a funcionalidade de notícias para este servidor"
          }
        }
      ]
    },
    {
      type: 2,
      name: "live",
      description: "Enable or disable live feed feature for this server",
      descriptionLocalizations: {
        "pt-BR": "Habilita ou desabilita a funcionalidade live feed para este servidor"
      },
      options: [
        {
          type: 1,
          name: "enable",
          nameLocalizations: {
            "pt-BR": "habilitar"
          },
          description: "Enable live feed feature for this server",
          descriptionLocalizations: {
            "pt-BR": "Habilita a funcionalidade live feed para este servidor"
          },
          options: [
            {
              type: 7,
              name: "channel",
              nameLocalizations: {
                "pt-BR": "canal"
              },
              description: "Select the channel",
              descriptionLocalizations: {
                "pt-BR": "Selecione o canal"
              },
              required: true
            }
          ]
        },
        {
          type: 1,
          name: "disable",
          nameLocalizations: {
            "pt-BR": "desabilitar"
          },
          description: "Disable live feed feature for this server",
          descriptionLocalizations: {
            "pt-BR": "Desabilita a funcionalidade live feed para este servidor"
          }
        }
      ]
    }
  ],
  permissions: ["MANAGE_GUILD", "MANAGE_CHANNELS"],
  botPermissions: ["MANAGE_MESSAGES", "EMBED_LINKS", "SEND_MESSAGES"],
  syntaxes: [
    "admin dashboard",
    "admin tournament add [tournament]",
    "admin tournament remove [tournament]",
    "adming language [lang]",
    "admin news enable [channel]",
    "admin news disable",
    "admin live enable [channel]",
    "admin live disable"
  ],
  examples: [
    "admin dashboard",
    "admin tournament add VCT Americas",
    "admin tournament add VCT EMEA",
    "admin tournament remove VCT AMERICAS",
    "admin language pt-BR",
    "admin language en-US",
    "admin news enable #valorant-news",
    "admin news disable",
    "admin live enable #live-feed",
    "admin live disable"
  ],
  async run({ ctx, locale, id }) {
    if(ctx.args[0] === "dashboard") {
      const embed = new EmbedBuilder()
      .setTitle(locale("commands.admin.dashboard"))
      .setDesc(locale("commands.admin.desc", {
        lang: ctx.db.guild.lang.replace("en", "English").replace("pt", "Português"),
        limit: ctx.db.guild.tournamentsLength === Infinity ? "`Infinity`" : `${ctx.db.guild.events.length}/${ctx.db.guild.tournamentsLength}`,
        id,
        newsChannel: !ctx.db.guild.newsChannel ? "`undefined`" : `<#${ctx.db.guild.newsChannel}>`,
        live: !ctx.db.guild.liveFeedChannel ? "`undefined`" : `<#${ctx.db.guild.liveFeedChannel}>`
      }));
      for(const event of ctx.db.guild.events) {
        embed.addField(event.name, locale("commands.admin.event_channels", {
          ch1: `<#${event.channel1}>`,
          ch2: `<#${event.channel2}>`
        }), true);
      }
      const button = new ButtonBuilder()
      .setLabel(locale("commands.admin.resend"))
      .setStyle("red")
      .setCustomId(`admin;${ctx.interaction.user.id};resend`);
      if(!ctx.db.guild.events.length || ctx.db.guild.resendTime >= Date.now()) button.setDisabled();
      ctx.reply(embed.build(button.build()));
    }
    else if(ctx.args[0] === "language") {
      const options = {
        en: async() => {
          ctx.db.guild.lang = "en"
          await ctx.db.guild.save();
          ctx.reply("Now I will interact in English on this server!");
        },
        pt: async() => {
          ctx.db.guild.lang = "pt"
          await ctx.db.guild.save();
          ctx.reply("Agora eu irei interagir em português neste servidor!");
        }
      }
      options[(ctx.interaction as CommandInteraction).data.options.getStringOption("lang")?.value as "pt" | "en"]();
    }
    else if(ctx.args[0] === "tournament") {
      const options = {
        add: async() => {
          if(ctx.db.guild.events.length >= ctx.db.guild.tournamentsLength) return ctx.reply("commands.admin.limit_reached", { cmd: `</admin tournament remove:${id}>` });
          if(ctx.db.guild.events.some(e => e.channel2 === ctx.args[3])) return ctx.reply("commands.admin.channel_being_used", {
            ch: `<#${ctx.args[3]}>`,
            cmd: `</admin panel:${id}>`
          });
          if(ctx.db.guild.events.filter(e => e.name === ctx.args[0]).length) return ctx.reply("commands.admin.tournament_has_been_added");
          if(ctx.args[3] === ctx.args[4]) return ctx.reply("commands.admin.channels_must_be_different");
          if(ctx.guild.channels.get(ctx.args[3])?.type !== 0 || ctx.guild.channels.get(ctx.args[4])?.type !== 0) return ctx.reply("commands.admin.invalid_channel");
          ctx.db.guild.events.push({
            name: ctx.args[2],
            channel1: ctx.args[3],
            channel2: ctx.args[4]
          });
          await ctx.db.guild.save();
          ctx.reply("commands.admin.tournament_added", {
            t: ctx.args[2]
          });
        },
        remove: async() => {
          if(ctx.args[2] == locale("commands.admin.remove_all")) {
            ctx.db.guild.events = [];
            await ctx.db.guild.save();
            return ctx.reply("commands.admin.removed_all_tournaments");
          }
          ctx.db.guild.events.splice(ctx.db.guild.events.findIndex(e => e.name === ctx.args[2]), 1);
          await ctx.db.guild.save();
          ctx.reply("commands.admin.tournament_removed", {
            t: ctx.args[2]
          });
        }
      }
      options[ctx.args[1] as "remove" | "add"]();
    }
    else if(ctx.args[0] === "news") {
      const options = {
        enable: async() => {
          if(!["PREMIUM"].some(s => ctx.db.guild.key?.type === s)) {
            const button = new ButtonBuilder()
            .setLabel(locale("commands.admin.buy_premium"))
            .setStyle("link")
            .setURL("https://discord.com/invite/FaqYcpA84r");
            ctx.reply({
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
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(![0, 5].some(t => channel.type === t)) return ctx.reply("commands.admin.invalid_channel2");
          ctx.db.guild.newsChannel = channel.id;
          await ctx.db.guild.save();
          ctx.reply("commands.admin.news_enabled", { ch: channel.mention });
        },
        disable: async() => {
          await Guild.findOneAndUpdate(
            {
              _id: ctx.db.guild.id
            },
            {
              $unset: { newsChannel: "" }
            }
          );
          ctx.reply("commands.admin.news_disabled");
        }
      }
      options[ctx.args[1] as "enable" | "disable"]();
    }
    else if(ctx.args[0] === "live") {
      const options = {
        enable: async() => {
          if(!["PREMIUM"].some(s => ctx.db.guild.key?.type === s)) {
            const button = new ButtonBuilder()
            .setLabel(locale("commands.admin.buy_premium"))
            .setStyle("link")
            .setURL("https://discord.com/invite/FaqYcpA84r");
            ctx.reply({
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
          let channel = ctx.guild.channels.get(ctx.args[2])!
          if(channel.type !== 0) return ctx.reply("commands.admin.invalid_channel");
          ctx.db.guild.liveFeedChannel = channel.id;
          await ctx.db.guild.save();
          ctx.reply("commands.admin.live_feed_enabled", { ch: channel.mention });
        },
        disable: async() => {
          await Guild.findOneAndUpdate(
            {
              _id: ctx.db.guild.id
            },
            {
              $unset: { liveFeedChannel: "" }
            }
          );
          ctx.reply("commands.admin.live_feed_disabled");
        }
      }
      options[ctx.args[1] as "enable" | "disable"]();
    }
  },
  async createAutocompleteInteraction({ i, client, locale }) {
    if(!cache.has("events")) {
      const res = await MainController.getEvents();
      cache.set("events", res);
    }
    const res = cache.get("events")!;
    const events = res.filter(e => e.status !== "completed")
    .map(e => e.name)
    .filter(e => {
      if(e.toLowerCase().includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return e;
    })
    .slice(0, 25);
    const args = {
      add: async() => {
        i.result(events.map(e => ({ name: e, value: e })))
        .catch(e => new Logger(client).error(e));
      },
      remove: async() => {
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface;
        const events = guild.events.map(e => e.name)
        .filter(e => {
          if(e.toLowerCase().includes((i.data.options.getOptions()[0].value as string).toLowerCase())) return e;
        });
        events.unshift(locale("commands.admin.remove_all"));
        i.result(events.map(e => ({ name: e, value: e })))
        .catch(e => new Logger(client).error(e));
      }
    }
    args[i.data.options.getSubCommand()![1] as "add" | "remove"]().catch(e => new Logger(client).error(e));
  },
  async createInteraction({ ctx, locale, client }) {
    if(ctx.args[2] === "resend") {
      await ctx.interaction.defer(64);
      const guild = await Guild.findById(ctx.interaction.guild!.id) as GuildSchemaInterface;
      if(guild.resendTime > Date.now()) {
        ctx.reply("commands.admin.resend_time", { t: `<t:${(guild.resendTime / 1000).toFixed(0)}:R>` });
        return;
      }
      const button = new ButtonBuilder()
      .setLabel(locale("commands.admin.continue"))
      .setStyle("red")
      .setCustomId(`admin;${ctx.interaction.user.id};continue`);
      ctx.reply(button.build(locale("commands.admin.confirm")));
    }
    else if(ctx.args[2] === "continue") {
      await (ctx.interaction as ComponentInteraction).deferUpdate();
      const guild = (await Guild.findById(ctx.interaction.guildID!))!;
      if(guild.resendTime > Date.now()) {
        ctx.edit("commands.admin.resend_time");
        return;
      }
      guild.matches = [];
      guild.tbdMatches = [];
      guild.resendTime = Date.now() + 3600000;
      await ctx.edit("commands.admin.resending");
      const res = await MainController.getMatches();
      if(!res || !res.length) return;
      const res2 = await MainController.getResults();
      if(guild.matches.length && !res2.some(d => d.id === guild.matches[guild.matches.length - 1])) return;
      guild.matches = [];
      let data: MatchesData[];
      if(guild.events.length > 5 && !guild.key) {
        data = res.filter(d => guild.events.reverse().slice(0, 5).some(e => e.name === d.tournament.name));
      }
      else data = res.filter(d => guild.events.some(e => e.name === d.tournament.name));
      for(const e of guild.events) {
        if(!client.getChannel(e.channel1)) continue;
        try {
          let messages = await client.rest.channels.getMessages(e.channel1, { limit: 100 });
          let messagesIds = messages.filter(m => m.author.id === client.user.id).map(m => m.id);
          if(messagesIds.length) {
            client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => {});
          }
        }
        catch {}
      }
        try {
          for(const d of data) {
            if(new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue;
            for(const e of guild.events) {
              if(e.name === d.tournament.name) {
                const emoji1 = (emojis as any[]).find((e: any) => e.name === d.teams[0].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0];
                const emoji2 = (emojis as any[]).find((e: any) => e.name === d.teams[1].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0];
                let index = guild.matches.findIndex((m) => m === d.id);
                if(index > -1) guild.matches.splice(index, 1);
                guild.matches.push(d.id!);
      
                const embed = new EmbedBuilder()
                .setAuthor({
                  iconURL: d.tournament.image,
                  name: d.tournament.name
                })
                .setField(`${emoji1} **${d.teams[0].name}** <:versus:1349105624180330516> **${d.teams[1].name}** ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
                .setFooter({
                  text: d.stage
                });
      
                const button = new ButtonBuilder()
                .setLabel(locale("helper.palpitate"))
                .setCustomId(`guess-${d.id}`)
                .setStyle("green");
      
                const urlButton = new ButtonBuilder()
                .setLabel(locale("helper.stats"))
                .setStyle("link")
                .setURL(`https://vlr.gg/${d.id}`);
                
                if(d.stage.toLowerCase().includes("showmatch")) continue;
                if(d.teams[0].name !== "TBD" && d.teams[1].name !== "TBD") await client.rest.channels.createMessage(e.channel1, {
                  embeds: [embed],
                  components: [
                    {
                      type: 1,
                      components: [button, urlButton]
                    },
                    // {
                    //   type: 1,
                    //   components: [
                    //     new ButtonBuilder()
                    //     .setLabel(locales(guild.lang, "helper.pickem.label"))
                    //     .setStyle("blue")
                    //     .setCustomId("pickem")
                    //   ]
                    // }
                  ]
                }).catch(() => {});
                else {
                  guild.tbdMatches.push({
                  id: d.id!,
                  channel: e.channel1
                });
              }    
            }
          }
        }
      }
      catch {}
      await guild.save();
      ctx.edit("commands.admin.resent");
    }
  }
});