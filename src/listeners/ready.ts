import { AnnouncementChannel, CreateApplicationCommandOptions, TextChannel } from "oceanic.js"
import { ButtonBuilder, createListener, EmbedBuilder, emojis, Logger } from "../structures"
import { Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../database"
import MainController from "../scraper"
import locales from "../locales"
import { MatchesData, ResultsData } from "../../types"

export default createListener({
  name: "ready",
  async run(client) {
    Logger.send(`${client.user.tag} online!`);
    if(client.user.id !== "1235576817683922954") {
      client.editStatus("dnd", [
        {
          name: "status",
          state: "Join support server! Link on about me",
          type: 4
        }
      ]);
    }
    else {
      client.editStatus("online", [
        {
          name: "status",
          state: "Join support server! Link on about me",
          type: 4
        }
      ])
    }
    const commands: CreateApplicationCommandOptions[] = [];
    client.commands.forEach(cmd => {
      commands.push({
        name: cmd.name,
        nameLocalizations: cmd.nameLocalizations,
        description: cmd.description,
        descriptionLocalizations: cmd.descriptionLocalizations,
        options: cmd.options,
        type: 1
      });
    });
    await client.application.bulkEditGlobalCommands(commands);
    const deleteGuild = async() => {
      const guilds = await Guild.find();
      for(const guild of guilds) {
        if(!client.guilds.get(guild.id)) {
          await guild.deleteOne();
        }
      }
    }
    const sendMatches = async() => {
      const res = await MainController.getMatches();
      if(!res || !res.length) return;
      const guilds = await Guild.find({
        events: {
          $ne: []
        }
      }) as GuildSchemaInterface[];
      if(!guilds.length) return;
      const res2 = await MainController.getResults();
      for(const guild of guilds) {
        if(guild.matches.length && !res2.some(d => d.id === guild.matches[guild.matches.length - 1])) continue;
        guild.matches = [];
        let data: MatchesData[];
        if(guild.events.length > 5 && (!guild.keys || !guild.keys.length)) {
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
                if(!d.stage.toLowerCase().includes("showmatch")) guild.matches.push(d.id!);
      
                const embed = new EmbedBuilder()
                .setAuthor({
                  iconURL: d.tournament.image,
                  name: d.tournament.name
                })
                .setField(`${emoji1} ${d.teams[0].name} <:versus:1349105624180330516> ${d.teams[1].name} ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`, true)
                .setFooter({
                  text: d.stage
                });
      
                const button = new ButtonBuilder()
                .setLabel(locales(guild.lang, "helper.palpitate"))
                .setCustomId(`guess-${d.id}`)
                .setStyle("green");
      
                const urlButton = new ButtonBuilder()
                .setLabel(locales(guild.lang, "helper.stats"))
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
        guild.save();
      }
    }
    const sendResults = async() => {
      const res = await MainController.getResults();
      if(!res || !res.length) return;
      const guilds = await Guild.find({
        events: {
          $ne: []
        }
      }) as GuildSchemaInterface[];
      if(!guilds.length) return;
      let matches: ResultsData[] = [];
      for(const guild of guilds) {
        let data: ResultsData[];
        if(guild.events.length > 5 && (!guild.keys || !guild.keys.length)) {
          data = res.filter(d => guild.events.reverse().slice(0, 5).some(e => e.name === d.tournament.name));
        }
        else data = res.filter(d => guild.events.some(e => e.name === d.tournament.name));
        if(!data || !data[0]) continue;
        if(guild.lastResult && guild.lastResult !== data[0].id) {
          let match = data.find(e => e.id == guild.lastResult);
          let index = data.indexOf(match!);
          if(index > -1) {
            data = data.slice(0, index);
            matches = data;
          }
          else {
            data = data.slice(0, 1);
            matches = data;
          }
          data.reverse();
          for(const d of data) {
            index = guild.liveMatches.findIndex(m => m.id === d.id);
            if(index > -1) {
              guild.liveMatches.splice(index, 1);
            }
            for(const e of guild.events) {
              if(e.name === d.tournament.name) {
                const emoji1 = (emojis as any[]).find((e: any) => e.name === d.teams[0].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0];
                const emoji2 = (emojis as any[]).find((e: any) => e.name === d.teams[1].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0];
                const embed = new EmbedBuilder()
                  .setAuthor({
                    name: d.tournament.name,
                    iconURL: d.tournament.image
                  })
                  .addField(
                    `${emoji1} ${d.teams[0].name} \`${d.teams[0].score}\` <:versus:1349105624180330516> \`${d.teams[1].score}\` ${d.teams[1].name} ${emoji2}`,
                    `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`,
                    true
                  )
                  .setFooter({
                    text: d.stage
                  })
                
                client.rest.channels.createMessage(e.channel2, {
                  embeds: [embed],
                  components: [
                    {
                      type: 1,
                      components: [
                        new ButtonBuilder()
                          .setLabel(locales(guild.lang, "helper.stats"))
                          .setStyle("link")
                          .setURL(`https://vlr.gg/${d.id}`)
                        // new ButtonBuilder()
                        // .setLabel(locales(guild.lang, "helper.pickem.label"))
                        // .setStyle("blue")
                        // .setCustomId("pickem")
                      ]
                    }
                  ]
                }).catch(() => {});
              }
            }
          }
          data.reverse();
        }
        guild.lastResult = data[0].id;
        await guild.save();
      }
      const users = await User.find({
        history: {
          $ne: []
        }
      }) as UserSchemaInterface[];
      if(!matches.length) return;
      for(const user of users) {
        for(const match of matches) {
          let guess = user.history.find((h) => h.match === match.id);
          if(!guess) continue;
          if(guess.teams[0].score === match.teams[0].score && guess.teams[1].score === match.teams[1].score) {
            await user.addCorrectPrediction(1, match.id);
          }
          else {
            await user.addWrongPrediction(1, match.id);
          }
        }
      }
    }
    const sendTBDMatches = async() => {
      const res = await MainController.getMatches();
      if(!res || !res.length) return;
      const guilds = await Guild.find({
        tbdMatches: {
          $ne: []
        }
      }) as GuildSchemaInterface[];
      for(const guild of guilds) {
        if(!guild.tbdMatches.length) continue;
        for(const match of guild.tbdMatches) {
          const data = res.find(d => d.id === match.id);
          if(!data) continue;
          if(data.teams[0].name !== "TBD" && data.teams[1].name !== "TBD") {
            const emoji1 = (emojis as any[]).find((e: any) => e.name === data.teams[0].name.toLowerCase() || e.aliases?.find((alias: string) => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[0];
            const emoji2 = (emojis as any[]).find((e: any) => e.name === data.teams[1].name.toLowerCase() || e.aliases?.find((alias: string) => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[0];
            const channel = client.getChannel(match.channel) as TextChannel;
            const embed = new EmbedBuilder()
            .setAuthor({
              name: data.tournament.name,
              iconURL: data.tournament.image
            })
            .setField(`${emoji1} ${data.teams[0].name} <:versus:1349105624180330516> ${data.teams[1].name} ${emoji2}`, `<t:${data.when / 1000}:F> | <t:${data.when / 1000}:R>`, true)
            .setFooter({ text: data.stage })
            channel.createMessage({
              embeds: [embed],
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                    .setLabel(locales(guild.lang, "helper.palpitate"))
                    .setCustomId(`guess-${match.id}`)
                    .setStyle("green"),
                    new ButtonBuilder()
                    .setLabel(locales(guild.lang, "helper.stats"))
                    .setStyle("link")
                    .setURL(`https://vlr.gg/${data.id}`)
                  ]
                }
              ]
            })
            .catch(() => {});
            let index = guild.tbdMatches.findIndex((m) => m.id === match.id);
            guild.tbdMatches.splice(index, 1);
            guild.save();
          }
        }
      }
    }
    const sendNews = async() => {
      let data = await MainController.getAllNews();
      const guilds = await Guild.find(
        {
          newsChannel: { $exists: true },
          keys: { $ne: [] }
        }
      ) as GuildSchemaInterface[];
      if(!guilds.length) return;
      let ids: string[] = [];
      for(const guild of guilds) {
        if(!["PREMIUM"].includes(guild.keys![0].type)) continue;
        if(guild.lastNews && guild.lastNews !== data[0].id) {
          let news = data.find(e => e.id === guild.lastNews)!;
          let index = data.indexOf(news);
          if(index > -1) {
            data = data.slice(0, index);
          }
          else {
            data = data.slice(0, 1);
          }
          for(const d of data) {
            const embed = new EmbedBuilder()
            .setAuthor({ name: d.title });
            if(d.description) embed.setDesc(d.description);
            const button = new ButtonBuilder()
            .setStyle("link")
            .setLabel(locales(guild.lang, "helper.source"))
            .setURL(d.url);
            const channel = client.getChannel(guild.newsChannel!) as TextChannel | AnnouncementChannel;
            if(!channel) continue;
            await channel.createMessage(embed.build({
              components: [
                {
                  type: 1,
                  components: [button]
                }
              ]
            }));
          }
        }
        ids.push(guild.id);
      }
      await Guild.updateMany(
        {
          _id: { $in: ids }
        },
        {
          $set: { lastNews: data[0].id }
        }
      );
    }
    const sendLiveFeedMatches = async() => {
      const guilds = await Guild.find(
        {
          liveFeedChannel: { $exists: true },
          keys: { $ne: [] }
        }
      ) as GuildSchemaInterface[];
      if(!guilds.length) return;
      const res = await MainController.getMatches();
      let data = res.filter(r => r.status === "LIVE");
      if(!data.length) return;
      for(const guild of guilds) {
        if(!["PREMIUM"].includes(guild.keys![0].type)) continue;
        const channel = client.getChannel(guild.liveFeedChannel!) as TextChannel;
        if(!channel) continue;
        if (guild.events.length > 5 && (!guild.keys || !guild.keys.length)) {
          data = data.filter(d => guild.events.reverse().slice(0, 5).some(e => d.tournament.name === e.name));
        }
        else data = data.filter(d => guild.events.some(e => d.tournament.name === e.name));
        if(!data.length) continue;
        for(const d of data) {
          const emoji1 = (emojis as any[]).find((e: any) => e.name === d.teams[0].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0];
          const emoji2 = (emojis as any[]).find((e: any) => e.name === d.teams[1].name.toLowerCase() || e.aliases?.find((alias: string) => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0];
          const match = await MainController.getLiveMatch(d.id!);
          const liveMatch = guild.liveMatches.find(m => m.id === match.id);
          if(!match.score1 || !match.currentMap) continue;
          if(!liveMatch) {
            const embed = new EmbedBuilder()
            .setAuthor({
              name: d.tournament.name,
              iconURL: d.tournament.image
            })
            .setTitle("LIVE FEED")
            .setDesc(`<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
            .setFields(
              {
                name: `${emoji1} ${d.teams[0].name} \`${match.teams[0].score}\` <:versus:1349105624180330516> \`${match.teams[1].score}\` ${d.teams[1].name} ${emoji2}`,
                value: locales(guild.lang, "helper.live_feed_value", {
                  map: match.currentMap,
                  score: `${match.score1}-${match.score2}`
                })
              }
            )
            channel.createMessage(embed.build());
            await Guild.updateOne(
              {
                _id: guild.id
              },
              {
                $addToSet: { liveMatches: match }
              }
            );
          }
          else if(JSON.stringify(match) !== JSON.stringify(liveMatch)) {
            const embed = new EmbedBuilder()
            .setAuthor({
              name: d.tournament.name,
              iconURL: d.tournament.image
            })
            .setTitle("LIVE FEED")
            .setDesc(`<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
            .setFields(
              {
                name: `${emoji1} ${d.teams[0].name} \`${match.teams[0].score}\` <:versus:1349105624180330516> \`${match.teams[1].score}\` ${d.teams[1].name} ${emoji2}`,
                value: locales(guild.lang, "helper.live_feed_value", {
                  map: match.currentMap,
                  score: `${match.score1}-${match.score2}`
                })
              }
            )
            channel.createMessage(embed.build());
            let index = guild.liveMatches.findIndex(m => m.id === match.id);
            guild.liveMatches.splice(index, 1);
            guild.liveMatches.push(match);
            await guild.save();
          }
        }
      }
    }
    const deleteLiveFeedMatches = async() => {
      const guilds = await Guild.find(
        {
          liveMatches: { $ne: [] }
        }
      ) as GuildSchemaInterface[];
      if(!guilds.length) return;
      for(const guild of guilds) {
        for(const match of guild.liveMatches) {
          const res = await MainController.getLiveMatch(match.id);
          if(!res.currentMap) {
            let index = guild.liveMatches.findIndex(m => m.id === match.id);
            guild.liveMatches.splice(index, 1);
          }
        }
        await guild.save();
      }
    }
    setInterval(async() => {
      await sendNews().catch(e => new Logger(client).error(e));
      await deleteGuild().catch(e => new Logger(client).error(e));
      await sendLiveFeedMatches().catch(e => new Logger(client).error(e));
      await sendMatches().catch(e => new Logger(client).error(e));
      await sendResults().catch(e => new Logger(client).error(e));
      await sendTBDMatches().catch(e => new Logger(client).error(e));
      await deleteLiveFeedMatches().catch(e => new Logger(client).error(e));
    }, process.env.INTERVAL ?? 20000);
  }
});