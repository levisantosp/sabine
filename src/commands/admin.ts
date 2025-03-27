import { CommandInteraction, ComponentInteraction } from "oceanic.js"
import { MatchesData } from "../../types/index.js"
import Service from "../api/index.js"
import { Guild, GuildSchemaInterface } from "../database/index.js"
import locales from "../locales/index.js"
import createCommand from "../structures/command/createCommand.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"
import Logger from "../structures/util/Logger.js"
import { emojis } from "../structures/util/emojis.js"
const service = new Service(process.env.AUTH);

export default createCommand({
  name: "admin",
  description: "See the dashboard and change the bot language",
  descriptionLocalizations: {
    "pt-BR": "Veja o painel de controle e mude o idioma do bot"
  },
  options: [
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
      type: 1,
      name: "premium",
      description: "Shows information about server premium",
      descriptionLocalizations: {
        "pt-BR": "Mostra informações sobre o premium do servidor"
      }
    }
  ],
  permissions: ["MANAGE_GUILD", "MANAGE_CHANNELS"],
  botPermissions: ["MANAGE_MESSAGES", "EMBED_LINKS", "SEND_MESSAGES"],
  syntaxes: [
    "admin dashboard",
    "adming language [lang]",
  ],
  examples: [
    "admin dashboard",
    "admin language pt-BR",
    "admin language en-US"
  ],
  async run({ ctx, locale, id }) {
    if(ctx.args[0] === "dashboard") {
      const embed = new EmbedBuilder()
      .setTitle(locale("commands.admin.dashboard"))
      .setDesc(locale("commands.admin.desc", {
        lang: ctx.db.guild.lang.replace("en", "English").replace("pt", "Português"),
        limit: ctx.db.guild.tournamentsLength === Infinity ? "`Infinity`" : `${ctx.db.guild.valorant_events.length}/${ctx.db.guild.tournamentsLength}`,
        id,
        valorant_news_channel: !ctx.db.guild.valorant_news_channel ? "`undefined`" : `<#${ctx.db.guild.valorant_news_channel}>`,
        live: !ctx.db.guild.valorant_livefeed_channel ? "`undefined`" : `<#${ctx.db.guild.valorant_livefeed_channel}>`
      }));
      for(const event of ctx.db.guild.valorant_events) {
        embed.addField(event.name, locale("commands.admin.event_channels", {
          ch1: `<#${event.channel1}>`,
          ch2: `<#${event.channel2}>`
        }), true);
      }
      const button = new ButtonBuilder()
      .setLabel(locale("commands.admin.resend"))
      .setStyle("red")
      .setCustomId(`admin;${ctx.interaction.user.id};resend`);
      if(!ctx.db.guild.valorant_events.length || ctx.db.guild.resendTime >= Date.now()) button.setDisabled();
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
    else if(ctx.args[0] === "premium") {
      if(!ctx.db.guild.key) {
        ctx.reply("commands.admin.no_premium");
        return;
      }
      const embed = new EmbedBuilder()
      .setTitle("Premium")
      .setDesc(locale("commands.admin.premium", {
        key: ctx.db.guild.key.type,
        expiresAt: `<t:${(ctx.db.guild.key.expiresAt! / 1000).toFixed(0)}:R>`
      }));
      ctx.reply(embed.build());
    }
  },
  async createAutocompleteInteraction({ i, client, locale }) {
    const res = await service.getEvents();
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
        const events = guild.valorant_events.map(e => e.name)
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
      guild.valorant_matches = [];
      guild.valorant_tbd_matches = [];
      guild.resendTime = Date.now() + 3600000;
      await ctx.edit("commands.admin.resending");
      const res = await service.getMatches();
      if(!res || !res.length) return;
      const res2 = await service.getResults();
      if(guild.valorant_matches.length && !res2.some(d => d.id === guild.valorant_matches[guild.valorant_matches.length - 1])) return;
      guild.valorant_matches = [];
      let data: MatchesData[];
      if(guild.valorant_events.length > 5 && !guild.key) {
        data = res.filter(d => guild.valorant_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name));
      }
      else data = res.filter(d => guild.valorant_events.some(e => e.name === d.tournament.name));
      for(const e of guild.valorant_events) {
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
            for(const e of guild.valorant_events) {
              if(e.name === d.tournament.name) {
                const emoji1 = (emojis as any[]).find((e: any) => e.name === d.teams[0].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0];
                const emoji2 = (emojis as any[]).find((e: any) => e.name === d.teams[1].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0];
                let index = guild.valorant_matches.findIndex((m) => m === d.id);
                if(index > -1) guild.valorant_matches.splice(index, 1);
                guild.valorant_matches.push(d.id!);
      
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
                      components: [
                        button, urlButton,
                        new ButtonBuilder()
                        .setLabel(locales(guild.lang, "helper.pickem.label"))
                        .setStyle("blue")
                        .setCustomId("pickem")
                      ]
                    }
                  ]
                }).catch(() => {});
                else {
                  guild.valorant_tbd_matches.push({
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