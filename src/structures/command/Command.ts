import { ApplicationCommandOptions, ApplicationCommandOptionsChoice, AutocompleteInteraction, ComponentInteraction, Constants, User } from 'oceanic.js'
import App from '../client/App'
import CommandContext from './CommandContext'

type ChoiceOptions = {
  name: string
  nameLocalizations?: {
    'pt-BR': string
  }
  value: string
}
type SubCommandGroupOptions = {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  name: string
  nameLocalizations?: {
    'pt-BR': string
  }
  description: string,
  descriptionLocalizations: {
    'pt-BR': string
  },
  choices?: ApplicationCommandOptionsChoice[]
  required?: boolean
  autocomplete?: boolean
}
type SubCommandOptions = {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  name: string
  nameLocalizations?: {
    'pt-BR': string
  }
  description: string,
  descriptionLocalizations: {
    'pt-BR': string
  },
  choices?: ChoiceOptions[]
  required?: boolean
  options?: SubCommandGroupOptions[]
  autocomplete?: boolean
}
type SlashOptions = {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  name: string
  nameLocalizations?: {
    'pt-BR': string
  }
  description: string
  descriptionLocalizations: {
    'pt-BR': string
  }
  choices?: ChoiceOptions[]
  required?: boolean
  options?: SubCommandOptions[]
  autocomplete?: boolean
}
type CommandOptions = {
  name: string
  nameLocalizations?: {
    'pt-BR': string
  }
  description: string
  descriptionLocalizations?: {
    'pt-BR': string
  }
  options?: ApplicationCommandOptions[]
  syntax?: string
  syntaxes?: string[]
  examples?: string[]
  client: App
  permissions?: Constants.PermissionName[]
  botPermissions?: Constants.PermissionName[]
  onlyDev?: boolean
  ephemeral?: boolean
  autocomplete?: boolean
}
export default class Command {
  name: string
  nameLocalizations?: {
    'pt-BR': string
  }
  description: string
  descriptionLocalizations?: {
    'pt-BR': string
  }
  options?: ApplicationCommandOptions[]
  syntax?: string
  syntaxes?: string[]
  examples?: string[]
  client: App
  permissions?: Constants.PermissionName[]
  botPermissions?: Constants.PermissionName[]
  onlyDev?: boolean
  ephemeral?: boolean
  id!: string
  locale!: (content: string, args?: any) => string
  getUser!: (user: string) => Promise<User | undefined>
  constructor(options: CommandOptions) {
    this.name = options.name
    this.nameLocalizations = options.nameLocalizations
    this.description = options.description
    this.descriptionLocalizations = options.descriptionLocalizations
    this.options = options.options
    this.syntax = options.syntax
    this.syntaxes = options.syntaxes
    this.examples = options.examples
    this.client = options.client
    this.permissions = options.permissions
    this.botPermissions = options.botPermissions
    this.onlyDev = options.onlyDev
  }
  async run(ctx: CommandContext): Promise<any> {}
  async execAutocomplete(i: AutocompleteInteraction) {}
  async execInteraction(i: ComponentInteraction, args: string[]): Promise<any> {}
}