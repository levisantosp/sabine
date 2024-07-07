import { AutocompleteInteraction, ComponentInteraction, User } from 'eris'
import App from '../client/App'
import CommandContext from './CommandContext'

type ChoiceOptions = {
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  value: string
}
type SubCommandGroupOptions = {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  description: string,
  description_localizations: {
    'pt-BR': string
  },
  choices?: ChoiceOptions[]
  required?: boolean
  autocomplete?: boolean
}
type SubCommandOptions = {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  description: string,
  description_localizations: {
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
  name_localizations?: {
    'pt-BR': string
  }
  description: string
  description_localizations: {
    'pt-BR': string
  }
  choices?: ChoiceOptions[]
  required?: boolean
  options?: SubCommandOptions[]
  autocomplete?: boolean
}
type CommandOptions = {
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  description: string
  description_localizations?: {
    'pt-BR': string
  }
  options?: SlashOptions[]
  syntax?: string
  examples?: string[]
  client: App
  permissions?: Array<'createInstantInvite' | 'kickMembers' | 'banMembers' | 'administrator' | 'manageChannels' | 'manageGuild' | 'addReactions' | 'sendMessages' | 'sendTTSMessages' | 'manageMessages' | 'embedLinks' | 'attachFiles' | 'readMessageHistory' | 'mentionEveryone' | 'voiceUseVAD' | 'changeNickname' | 'manageNicknames' | 'manageRoles' | 'manageEmojisAndStickers' | 'useExternalEmojis' | 'viewAuditLog' | 'voicePrioritySpeaker' | 'voiceStream' | 'viewChannel' | 'viewGuildInsights' | 'voiceConnect' | 'voiceSpeak' | 'voiceMuteMembers' | 'voiceRequestToSpeak' | 'voiceDeafenMembers' | 'voiceMoveMembers' | 'manageWebhooks' | 'useApplicationCommands' | 'createPrivateThreads' | 'createPublicThreads' | 'useExternalStickers' | 'manageThreads' | 'sendMessagesInThreads' | 'useEmbeddedActivities' | 'moderateMembers' | 'manageEvents'>
  botPermissions?: Array<'createInstantInvite' | 'kickMembers' | 'banMembers' | 'administrator' | 'manageChannels' | 'manageGuild' | 'addReactions' | 'sendMessages' | 'sendTTSMessages' | 'manageMessages' | 'embedLinks' | 'attachFiles' | 'readMessageHistory' | 'mentionEveryone' | 'voiceUseVAD' | 'changeNickname' | 'manageNicknames' | 'manageRoles' | 'manageEmojisAndStickers' | 'useExternalEmojis' | 'viewAuditLog' | 'voicePrioritySpeaker' | 'voiceStream' | 'viewChannel' | 'viewGuildInsights' | 'voiceConnect' | 'voiceSpeak' | 'voiceMuteMembers' | 'voiceRequestToSpeak' | 'voiceDeafenMembers' | 'voiceMoveMembers' | 'manageWebhooks' | 'useApplicationCommands' | 'createPrivateThreads' | 'createPublicThreads' | 'useExternalStickers' | 'manageThreads' | 'sendMessagesInThreads' | 'useEmbeddedActivities' | 'moderateMembers' | 'manageEvents'>
  onlyDev?: boolean
  ephemeral?: boolean
  autocomplete?: boolean
}
export default class Command {
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  description: string
  description_localizations?: {
    'pt-BR': string
  }
  options?: SlashOptions[]
  syntax?: string
  examples?: string[]
  client: App
  permissions?: Array<'createInstantInvite' | 'kickMembers' | 'banMembers' | 'administrator' | 'manageChannels' | 'manageGuild' | 'addReactions' | 'sendMessages' | 'sendTTSMessages' | 'manageMessages' | 'embedLinks' | 'attachFiles' | 'readMessageHistory' | 'mentionEveryone' | 'voiceUseVAD' | 'changeNickname' | 'manageNicknames' | 'manageRoles' | 'manageEmojisAndStickers' | 'useExternalEmojis' | 'viewAuditLog' | 'voicePrioritySpeaker' | 'voiceStream' | 'viewChannel' | 'viewGuildInsights' | 'voiceConnect' | 'voiceSpeak' | 'voiceMuteMembers' | 'voiceRequestToSpeak' | 'voiceDeafenMembers' | 'voiceMoveMembers' | 'manageWebhooks' | 'useApplicationCommands' | 'createPrivateThreads' | 'createPublicThreads' | 'useExternalStickers' | 'manageThreads' | 'sendMessagesInThreads' | 'useEmbeddedActivities' | 'moderateMembers' | 'manageEvents'>
  botPermissions?: Array<'createInstantInvite' | 'kickMembers' | 'banMembers' | 'administrator' | 'manageChannels' | 'manageGuild' | 'addReactions' | 'sendMessages' | 'sendTTSMessages' | 'manageMessages' | 'embedLinks' | 'attachFiles' | 'readMessageHistory' | 'mentionEveryone' | 'voiceUseVAD' | 'changeNickname' | 'manageNicknames' | 'manageRoles' | 'manageEmojisAndStickers' | 'useExternalEmojis' | 'viewAuditLog' | 'voicePrioritySpeaker' | 'voiceStream' | 'viewChannel' | 'viewGuildInsights' | 'voiceConnect' | 'voiceSpeak' | 'voiceMuteMembers' | 'voiceRequestToSpeak' | 'voiceDeafenMembers' | 'voiceMoveMembers' | 'manageWebhooks' | 'useApplicationCommands' | 'createPrivateThreads' | 'createPublicThreads' | 'useExternalStickers' | 'manageThreads' | 'sendMessagesInThreads' | 'useEmbeddedActivities' | 'moderateMembers' | 'manageEvents'>
  onlyDev?: boolean
  ephemeral?: boolean
  autocomplete?: boolean
  id!: string
  locale!: (content: string, args?: any) => string
  getUser!: (user: string) => Promise<User | undefined>
  constructor(options: CommandOptions) {
    this.name = options.name
    this.name_localizations = options.name_localizations
    this.description = options.description
    this.description_localizations = options.description_localizations
    this.options = options.options
    this.syntax = options.syntax
    this.examples = options.examples
    this.client = options.client
    this.permissions = options.permissions
    this.botPermissions = options.botPermissions
    this.onlyDev = options.onlyDev
    this.autocomplete = options.autocomplete
  }
  async run(ctx: CommandContext) {}
  async execAutocomplete(i: AutocompleteInteraction) {}
  async execInteraction(i: ComponentInteraction, args: string[]) {}
}