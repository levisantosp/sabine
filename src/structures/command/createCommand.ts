import * as Oceanic from "oceanic.js"
import App from "../client/App.ts"
import CommandContext from "./CommandContext.ts"
import type { Args } from "../../locales/index.ts"
import ComponentInteractionContext from "../interactions/ComponentInteractionContext.ts"
import ModalSubmitInteractionContext from "../interactions/ModalSubmitInteractionContext.ts"

type CommandOptions = {
  ctx: CommandContext
  client: App
  t: (content: string, args?: Args) => string
  id: string
}
type CreateAutocompleteInteractionOptions = {
  i: Oceanic.AutocompleteInteraction
  t: (content: string, args?: Args) => string
  client: App
  args?: string[]
}
type CreateComponentInteractionOptions = {
  ctx: ComponentInteractionContext
  t: (content: string, args?: Args) => string
  i: Oceanic.ComponentInteraction
  client: App
}
type CreateModalSubmitInteractionOptions = {
  ctx: ModalSubmitInteractionContext
  client: App
  t: (content: string, args?: Args) => string
  i: Oceanic.ModalSubmitInteraction
}
export type Command = {
  name: string
  nameLocalizations?: Partial<Record<Oceanic.Locale, string>>
  description: string
  category: "economy" | "admin" | "esports" | "misc" | "premium"
  descriptionLocalizations?: Partial<Record<Oceanic.Locale, string>>
  options?: Oceanic.ApplicationCommandOptions[]
  syntax?: string
  syntaxes?: string[]
  examples?: string[]
  client?: App
  permissions?: Oceanic.Constants.PermissionName[]
  botPermissions?: Oceanic.Constants.PermissionName[]
  onlyDev?: boolean
  ephemeral?: boolean
  userInstall?: boolean
  isThiking?: boolean
  messageComponentInteractionTime?: number
  modalSubmitInteractionTime?: number
  cooldown?: boolean
  run: (options: CommandOptions) => Promise<any>
  createAutocompleteInteraction?: (options: CreateAutocompleteInteractionOptions) => Promise<any>
  createMessageComponentInteraction?: (options: CreateComponentInteractionOptions) => Promise<any>
  createModalSubmitInteraction?: (options: CreateModalSubmitInteractionOptions) => Promise<any>
}
export default function(
  command: Command
): Command {
  return command
}