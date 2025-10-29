import * as Discord from 'discord.js'
import App from '../app/App.ts'
import CommandContext from './CommandContext.ts'
import type { Args } from '../../i18n/index.ts'
import ComponentInteractionContext from '../interaction/ComponentInteractionContext.ts'
import ModalSubmitInteractionContext from '../interaction/ModalSubmitInteractionContext.ts'

type CommandOptions = {
  ctx: CommandContext
  app: App
  t: (content: string, args?: Args) => string
  id: string
}

type CreateAutocompleteInteractionOptions = {
  i: Discord.AutocompleteInteraction
  t: (content: string, args?: Args) => string
  app: App
  args?: string[]
}

type CreateComponentInteractionOptions = {
  ctx: ComponentInteractionContext
  t: (content: string, args?: Args) => string
  i: Discord.MessageComponentInteraction
  app: App
}

type CreateModalSubmitInteractionOptions = {
  ctx: ModalSubmitInteractionContext
  app: App
  t: (content: string, args?: Args) => string
  i: Discord.ModalSubmitInteraction
}

export type Command = {
  name: string
  nameLocalizations?: Partial<Record<Discord.Locale, string>>
  description: string
  category: 'economy' | 'admin' | 'esports' | 'misc' | 'premium'
  descriptionLocalizations?: Partial<Record<Discord.Locale, string>>
  options?: Discord.ApplicationCommandOptionData[]
  syntax?: string
  syntaxes?: string[]
  examples?: string[]
  client?: App
  permissions?: Discord.PermissionResolvable[]
  botPermissions?: Discord.PermissionResolvable[]
  onlyDev?: boolean
  ephemeral?: boolean
  userInstall?: boolean
  isThinking?: boolean
  messageComponentInteractionTime?: number
  modalSubmitInteractionTime?: number
  cooldown?: boolean
  run: (props: CommandOptions) => Promise<unknown>
  createAutocompleteInteraction?: (options: CreateAutocompleteInteractionOptions) => Promise<unknown>
  createMessageComponentInteraction?: (options: CreateComponentInteractionOptions) => Promise<unknown>
  createModalSubmitInteraction?: (options: CreateModalSubmitInteractionOptions) => Promise<unknown>
}

export default function(command: Command) {
  return command
}