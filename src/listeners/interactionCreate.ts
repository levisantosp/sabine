import locales, { Args } from "../locales/index.js"
import { Blacklist, BlacklistSchemaInterface, Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../database/index.js"
import Service from "../api/index.js"
import createListener from "../structures/client/createListener.js"
import CommandRunner from "../structures/command/CommandRunner.js"
import Logger from "../structures/util/Logger.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"
import CommandContext from "../structures/command/CommandContext.js"
const service = new Service(process.env.AUTH);

export default createListener({
  name: "interactionCreate",
  async run(client, i) {
    if(i.isCommandInteraction()) {
      new CommandRunner().run(client, i).catch(e => new Logger(client).error(e));
    }
    else if(i.isAutocompleteInteraction()) {
      const command = client.commands.get(i.data.name);
      if(!command) return;
      if(!command.createAutocompleteInteraction) return;
      const user = await User.findById(i.user.id) as UserSchemaInterface;
      const guild = await Guild.findById(i.guildID) as GuildSchemaInterface;
      const locale = (content: string, args?: Args) => {
        return locales(user.lang ?? guild.lang, content, args);
      }
      command.createAutocompleteInteraction({ i, locale, client })
      .catch(e => new Logger(client).error(e));
    }
    else if(i.isComponentInteraction()) {
      if(i.data.customID === "pickem") {
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface;
        const user = (await User.findById(i.member!.id) || new User({ _id: i.member!.id })) as UserSchemaInterface;
        i.createMessage({
          content: locales(user.lang ?? guild.lang, "helper.pickem.res"),
          flags: 64
        });
        return;
      }
      if(i.data.customID.startsWith("guess-")) {
        await i.defer(64);
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface;
        const user = (await User.findById(i.member!.id) || new User({ _id: i.member!.id })) as UserSchemaInterface;
        if(user.history.filter((g) => g.match === i.data.customID.slice(6))[0]?.match === i.data.customID.slice(6)) {
          i.editOriginal({
            content: locales(user.lang ?? guild?.lang!, "helper.replied")
          });
          return;
        }
        const res = await service.getMatches();
        const data = res.find(d => d.id == i.data.customID.slice(6));
        if(data?.status === "LIVE" || !data) {
          i.editOriginal({
            content: locales(user.lang ?? guild?.lang!, "helper.started")
          });
          return;
        }
        i.editOriginal({
          content: locales(user.lang ?? guild?.lang!, "helper.verified"),
          components: [
            {
              type: 1,
              components: [
                new ButtonBuilder()
                .setStyle("green")
                .setLabel(locales(user.lang ?? guild?.lang!, "helper.palpitate"))
                .setCustomId(`predict-${i.data.customID.slice(6)}`)
              ]
            }
          ]
        })
        return;
      }
      if(i.data.customID.startsWith("predict-")) {
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface;
        const user = (await User.findById(i.member!.id) || new User({ _id: i.member!.id })) as UserSchemaInterface;
        if(user.history.filter((g) => g.match === i.data.customID.slice(8))[0]?.match === i.data.customID.slice(8)) {
          i.editParent({
            content: locales(user.lang ?? guild?.lang!, "helper.replied"),
            components: []
          });
          return;
        }
        const res = await service.getMatches();
        const data = res.find(d => d.id == i.data.customID.slice(8));
        if(data?.status === "LIVE" || !data) {
          i.editOriginal({
            content: locales(user.lang ?? guild?.lang!, "helper.started"),
            components: []
          });
          return;
        }
        i.createModal({
          customID: `modal-${i.data.customID.slice(8)}`,
          title: locales(user.lang ?? guild?.lang!, "helper.palpitate_modal.title"),
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  customID: "response-modal-1",
                  label: data?.teams[0].name,
                  style: 1,
                  minLength: 1,
                  maxLength: 2,
                  required: true,
                  placeholder: "0"
                },
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  customID: "response-modal-2",
                  label: data?.teams[1].name,
                  style: 1,
                  minLength: 1,
                  maxLength: 2,
                  required: true,
                  placeholder: "0"
                }
              ]
            }
          ]
        });
        return;
      }
      const args = i.data.customID.split(";");
      const command = client.commands.get(args[0]);
      const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface;
      if(blacklist.users.find(user => user.id === i.user.id)) return;
      if(!command) return;
      if(!command.createInteraction) return;
      if(!i.guild) return;
      if(args[1] !== i.user.id) return;
      const guild = await Guild.findById(i.guild.id) as GuildSchemaInterface;
      const user = await User.findById(i.user.id) as UserSchemaInterface;
      const ctx = new CommandContext({
        args,
        client,
        guild: i.guild,
        interaction: i,
        locale: user.lang ?? guild.lang,
        db: {
          user,
          guild
        }
      })
      const locale = (content: string, args?: Args) => {
        return locales(user.lang ?? guild.lang, content, args);
      }
      command.createInteraction({ client, ctx, locale })
      .catch(e => new Logger(client).error(e));
    }
    else if(i.isModalSubmitInteraction() && i.data.customID.startsWith("modal-")) {
      const user = (await User.findById(i.user.id) || new User({ _id: i.user.id })) as UserSchemaInterface;
      const guild = await Guild.findById(i.guildID) as GuildSchemaInterface;
      const res = await service.getMatches();
      const data = res.find(d => d.id == i.data.customID.slice(6))!;
      await user.addPrediction({
        match: data.id!,
        teams: [
          {
            name: data.teams[0].name,
            score: i.data.components.getComponents()[0].value
          },
          {
            name: data.teams[1].name,
            score: i.data.components.getComponents()[1].value
          }
        ]
      });
      i.editParent({
        content: locales(user.lang ?? guild?.lang!, "helper.palpitate_response", {
          t1: data.teams[0].name,
          t2: data.teams[1].name,
          s1: i.data.components.getComponents()[0].value,
          s2: i.data.components.getComponents()[1].value
        }),
        components: []
      });
    }
  }
});
