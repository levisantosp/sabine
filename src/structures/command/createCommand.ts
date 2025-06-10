import { ApplicationCommandOptions, AutocompleteInteraction, ComponentInteraction, Constants, Locale, ModalSubmitInteraction } from "oceanic.js"
import App from "../client/App.js"
import CommandContext from "./CommandContext.js"
import { Args } from "../../locales/index.js"

type CommandOptions = {
  ctx: CommandContext
  client: App
  locale: (content: string, args?: Args) => string
  id: string
}
type CreateAutocompleteInteractionOptions = {
  i: AutocompleteInteraction
  locale: (content: string, args?: Args) => string
  client: App
  args?: string[]
}
type CreateComponentInteractionOptions = {
  ctx: CommandContext
  client: App
  locale: (content: string, args?: Args) => string
  i: ComponentInteraction
}
type CreateModalSubmitInteractionOptions = {
  ctx: CommandContext
  client: App
  locale: (content: string, args?: Args) => string
  i: ModalSubmitInteraction
}
export type Command = {
  name: string
  nameLocalizations?: Partial<Record<Locale, string>>
  description: string
  category: "simulator" | "admin" | "esports" | "misc" | "premium"
  descriptionLocalizations?: Partial<Record<Locale, string>>
  options?: ApplicationCommandOptions[]
  syntax?: string
  syntaxes?: string[]
  examples?: string[]
  client?: App
  permissions?: Constants.PermissionName[]
  botPermissions?: Constants.PermissionName[]
  onlyDev?: boolean
  ephemeral?: boolean
  isThinking?: boolean
  run: (options: CommandOptions) => Promise<any>
  createAutocompleteInteraction?: (options: CreateAutocompleteInteractionOptions) => Promise<any>
  createInteraction?: (options: CreateComponentInteractionOptions) => Promise<any>
  createModalSubmitInteraction?: (options: CreateModalSubmitInteractionOptions) => Promise<any>
}
export default function (
  command: Command
): Command {
  return command
}