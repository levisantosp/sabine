export default class Command {
  constructor(options) {
    this.name = options.name
    this.aliases = options.aliases
    this.description = options.description
    this.usage = options.usage
    this.example = options.example
    this.client = options.client
    this.permissions = options.permissions
  }
}