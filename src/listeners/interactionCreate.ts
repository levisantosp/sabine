import locales, { Args } from "../locales"
import { CommandContext, CommandRunner, createListener, Logger } from "../structures"
import { Blacklist, BlacklistSchemaInterface, Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../database"

export default createListener({
  name: "interactionCreate",
  async run(client, i) {
    if(i.isCommandInteraction()) {
      new CommandRunner().run(client, i);
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
      const args = i.data.customID.split(";");
      const command = client.commands.get(args[0]);
      const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface;
      if(blacklist.users.find(user => user.id === i.user.id)) return;
      if(!command) return;
      if(!command.createInteraction) return;
      if(!i.guild) return;
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
      command.createInteraction({ client, ctx })
      .catch(e => new Logger(client).error(e));
    }
  }
});