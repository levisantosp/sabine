export default class Command {
  constructor(options) {
    this.name = options.name
    this.aliases = options.aliases
    this.description = options.description
    this.syntax = options.syntax
    this.examples = options.examples
    this.client = options.client
    this.permissions = options.permissions
    this.botPermissions = options.botPermissions
    this.onlyDev = options.onlyDev
  }
}