import { ApplicationCommandOptions, AutocompleteInteraction, ComponentInteraction, Constants, User } from 'oceanic.js'
import App from '../client/App'
import CommandContext from './CommandContext'
import { Args } from '../../locales'

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
  client?: App
  permissions?: Constants.PermissionName[]
  botPermissions?: Constants.PermissionName[]
  onlyDev?: boolean
  ephemeral?: boolean
  autocomplete?: boolean
}
export default class Command {
  public name: string
  public nameLocalizations?: {
    'pt-BR': string
  }
  public description: string
  public descriptionLocalizations?: {
    'pt-BR': string
  }
  public options?: ApplicationCommandOptions[]
  public syntax?: string
  public syntaxes?: string[]
  public examples?: string[]
  public client?: App
  public permissions?: Constants.PermissionName[]
  public botPermissions?: Constants.PermissionName[]
  public onlyDev?: boolean
  public ephemeral?: boolean
  public id!: string
  public locale!: (content: string, args?: Args) => string
  public getUser!: (user: string) => Promise<User | undefined>
  public uptime: number = Date.now()
  public constructor(options: CommandOptions) {
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