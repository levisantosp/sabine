import { CommandInteraction, ComponentInteraction, EditInteractionContent, File, Guild, InitialInteractionContent, ModalSubmitInteraction } from "oceanic.js"
import App from "../client/App"
import locales, { Args } from "../../locales"
import { GuildSchemaInterface, UserSchemaInterface } from "../../database"

type Database = {
  guild: GuildSchemaInterface
  user: UserSchemaInterface
}
type CommandContextOptions = {
  client: App;
  guild: Guild;
  interaction: CommandInteraction | ComponentInteraction | ModalSubmitInteraction;
  locale: string;
  db: Database;
  args: string[];
}
export default class CommandContext {
  public client: App;
  public guild: Guild;
  public interaction: CommandInteraction | ComponentInteraction | ModalSubmitInteraction;
  public locale: string;
  public db: Database;
  public args: string[];
  public constructor(options: CommandContextOptions) {
    this.client = options.client;
    this.guild = options.guild;
    this.interaction = options.interaction;
    this.locale = options.locale;
    this.db = options.db;
    this.args = options.args;
  }
  public async reply(content: string | InitialInteractionContent, options?: Args) {
    switch(typeof content) {
      case "string": {
        if(options?.files) {
          if(this.interaction.acknowledged) return this.interaction.createFollowup(
            {
              content: locales(this.locale, content, options),
              files: options.files as File[]
            }
          );
          else return this.interaction.createMessage(
            {
              content: locales(this.locale, content, options)
            }
          );
        }
        else {
          if(this.interaction.acknowledged) return this.interaction.createFollowup(
            {
              content: locales(this.locale, content, options)
            }
          );
          else return this.interaction.createMessage(
            {
              content: locales(this.locale, content, options)
            }
          );
        }
      }
      case "object": {
        if(options?.files) {
          if(this.interaction.acknowledged) return this.interaction.createFollowup(Object.assign(content, { files: options.files as File[] }));
          else return this.interaction.createMessage(Object.assign(content, { files: options.files as File[] }));
        }
        else {
          if(this.interaction.acknowledged) return this.interaction.createFollowup(content);
          else return this.interaction.createMessage(content);
        }
      }
    }
  }
  public async edit(content: string | EditInteractionContent, options?: Args) {
    if(this.interaction instanceof CommandInteraction) {
      switch(typeof content) {
        case "string": {
          if(options?.files) {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                files: options.files as File[]
              }
            );
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
          else {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options)
              }
            );
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
        }
        case "object": {
          if(options?.files) {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(Object.assign(content, { files: options.files as File[] }));
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
          else {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(content);
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
        }
      }
    }
    else if(this.interaction instanceof ComponentInteraction) {
      switch(typeof content) {
        case "string": {
          if(options?.files) {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                files: options.files as File[],
                components: []
              }
            );
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
          else {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(
              {
                content: locales(this.locale, content, options),
                components: []
              }
            );
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
        }
        case "object": {
          if(options?.files) {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(Object.assign(content, { files: options.files as File[] }));
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
          else {
            if(this.interaction.acknowledged) return this.interaction.editOriginal(content);
            else return this.interaction.createMessage({
              content: locales(this.locale, "helper.interaction_failed"),
              flags: 64
            });
          }
        }
      }
    }
  }
}