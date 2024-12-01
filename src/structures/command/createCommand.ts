import { ApplicationCommandOptions, AutocompleteInteraction, ComponentInteraction, Constants, Locale, User } from "oceanic.js"
import App from "../client/App"
import CommandContext from "./CommandContext"
import { Args } from "../../locales"

type CommandOptions = {
  ctx: CommandContext;
  client: App;
  locale: (content: string, args?: Args) => string;
}
type CreateAutocompleteInteractionOptions = {
  i: AutocompleteInteraction;
  locale: (content: string, args?: Args) => string;
  client: App;
}
type CreateComponentInteractionOptions = {
  ctx: CommandContext;
  client: App;
}
export type Command = {
  name: string;
  nameLocalizations?: Partial<Record<Locale, string>>;
  description: string;
  descriptionLocalizations?: Partial<Record<Locale, string>>;
  options?: ApplicationCommandOptions[];
  syntax?: string;
  syntaxes?: string[];
  examples?: string[];
  client?: App;
  permissions?: Constants.PermissionName[];
  botPermissions?: Constants.PermissionName[];
  onlyDev?: boolean;
  ephemeral?: boolean;
  isThinking?: boolean;
  run: (options: CommandOptions) => Promise<void>;
  createAutocompleteInteraction?: (options: CreateAutocompleteInteractionOptions) => Promise<void>;
  createInteraction?: (options: CreateComponentInteractionOptions) => Promise<void>;
}
export default function(
  command: Command
): Command {
  return command;
}