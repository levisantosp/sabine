import { CreateApplicationCommandOptions, TextChannel } from "oceanic.js"
import { ButtonBuilder, createListener, EmbedBuilder, Logger } from "../structures"
import { Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../database"
import MainController from "../scraper"
import locales from "../locales"
import { ResultsData } from "../../types"

export default createListener({
  name: "ready",
  async run(client) {
    Logger.send(`${client.user.tag} online!`);
    if(client.user.id !== "1235576817683922954") {
      client.editStatus("dnd");
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
    client.application.bulkEditGlobalCommands(commands);
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
        let data = res.filter(d => guild.events.some(e => e.name === d.tournament.name));
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
                let index = guild.matches.findIndex((m) => m === d.id);
                if(index > -1) guild.matches.splice(index, 1);
                guild.matches.push(d.id!);
      
                const embed = new EmbedBuilder()
                .setAuthor({
                  iconURL: d.tournament.image,
                  name: d.tournament.name
                })
                .setDesc(`<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
                .setField(`:flag_${d.teams[0].country}: ${d.teams[0].name} \`vs\` ${d.teams[1].name} :flag_${d.teams[1].country}:`.replaceAll(":flag_un:", ":united_nations:"), "", true)
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
      });
      console.log("a");
      if(!guilds.length) return;
      let matches: ResultsData[] = [];
      for(const guild of guilds) {
        console.log(guild.id);
        let data = res.filter(d => guild.events.some(e => e.name === d.tournament.name));
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
            for(const e of guild.events) {
              if(e.name === d.tournament.name) {
                const embed = new EmbedBuilder()
                  .setAuthor({
                    name: d.tournament.name,
                    iconURL: d.tournament.image
                  })
                  .setDesc(`<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
                  .addField(
                    `:flag_${d.teams[0].country}: ${d.teams[0].name} \`${d.teams[0].score}-${d.teams[1].score}\` ${d.teams[1].name} :flag_${d.teams[1].country}:`.replaceAll(':flag_un:', ':united_nations:'),
                    "",
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
        await Guild.updateOne(
          {
            _id: guild.id
          },
          {
            $set: {
              lastResult: data[0].id
            }
          }
        );
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
            user.guessesRight += 1;
          }
          else {
            user.guessesWrong += 1;
          }
        }
        user.save();
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
            const channel = client.getChannel(match.channel) as TextChannel;
            const embed = new EmbedBuilder()
            .setAuthor({
              name: data.tournament.name,
              iconURL: data.tournament.image
            })
            .setDesc(`<t:${data.when / 1000}:F> | <t:${data.when / 1000}:R>`)
            .setThumb(data.tournament.image)
            .setField(`:flag_${data.teams[0].country}: ${data.teams[0].name} \`vs\` ${data.teams[1].name} :flag_${data.teams[1].country}:`.replaceAll(":flag_un:", ":united_nations:"), "", true)
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
      const guild = await Guild.findById("1233965003850125433") as GuildSchemaInterface;
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
          .setLabel("Source")
          .setURL(d.url);
          client.rest.channels.createMessage(process.env.NEWS_CHANNEL ?? "1312978543759851661", embed.build({
            components: [
              {
                type: 1,
                components: [button]
              }
            ]
          }));
        }
      }
      await Guild.updateOne(
        {
          _id: guild.id
        },
        {
          $set: {
            lastNews: data[0].id
          }
        }
      );
    }
    const execTasks = async() => {
      try {
        await sendNews();
        await deleteGuild();
        await sendMatches();
        await sendResults();
        await sendTBDMatches();
      }
      catch(e) {
        new Logger(client).error(e as Error);
      }
      finally {
        setTimeout(execTasks, process.env.INTERVAL ?? 20000);
      }
    }
    execTasks();
  }
});