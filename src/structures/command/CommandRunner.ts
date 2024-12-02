import { CommandInteraction } from "oceanic.js"
import App from "../client/App"
import CommandContext from "./CommandContext"
import { ButtonBuilder, Logger } from ".."
import { Blacklist, BlacklistSchemaInterface, Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../../database"
import locales, { Args } from "../../locales"

export default class CommandRunnner {
  public async run(
    client: App, interaction: CommandInteraction
  ) {
    const command = client.commands.get(interaction.data.name);
    if(!command) return;
    if(!interaction.guildID || !interaction.member || !interaction.guild) return;
    const guild = (await Guild.findById(interaction.guildID) ?? new Guild({ _id: interaction.guildID })) as GuildSchemaInterface;
    const user = (await User.findById(interaction.user.id) ?? new User({ _id: interaction.user.id })) as UserSchemaInterface;
    const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface;
    const ban = blacklist.users.find(user => user.id === interaction.user.id);
    if(blacklist.guilds.find(guild => guild.id === interaction.guildID)) {
      return await interaction.guild.leave();
    }
    if(ban) {
      return interaction.createMessage({
        content: locales(guild.lang, 'helper.banned', {
          reason: ban.reason,
          ends: ban.endsAt === Infinity ? Infinity : `<t:${ban.endsAt}:F> | <t:${ban.endsAt}:R>`,
          when: `<t:${ban.when}:F> | <t:${ban.when}:R>`
        }),
        flags: 64,
        components: [
          {
            type: 1,
            components: [
              new ButtonBuilder()
              .setStyle('link')
              .setLabel(locales(guild.lang, 'commands.help.community'))
              .setURL('https://discord.gg/g5nmc376yh')
            ]
          }
        ]
      });
    } 
    if(command.ephemeral) {
      await interaction.defer(64);
    }
    else if(command.isThinking) {
      await interaction.defer();
    }
    let args: string[] = interaction.data.options.getSubCommand() ?? [];
    if(args.length > 0) {
      for(const option of interaction.data.options.getOptions()) {
        args.push(option.value.toString());
      }
    }
    else for(const option of interaction.data.options.getOptions()) {
      args.push(option.value.toString());
    }
    const ctx = new CommandContext({
      client,
      interaction,
      locale: user.lang ?? guild.lang,
      guild: interaction.guild,
      args,
      db: {
        user,
        guild
      }
    })
    const locale = (content: string, args?: Args) => {
      return locales(user.lang ?? guild.lang, content, args);
    }
    command.run({ ctx, client, locale, id: interaction.data.id }).catch(e => {
      new Logger(client).error(e);
      ctx.reply("helper.error", { e });
    });
  }
}