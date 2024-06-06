import { User } from 'eris'
import App from '../client/App'
import CommandContext from './CommandContext'

interface ChoiceOptions {
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  value: string
}
interface SubCommandGroupOptions {
  type: number
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
}
interface SubCommandOptions {
  type: number
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
}
interface SlashOptions {
  type: 1
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
}
interface CommandOptions {
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  aliases?: string[]
  description?: string
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
}
export default class Command {
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  aliases?: string[]
  description?: string
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
  locale!: (content: string, args?: object) => string
  getUser!: (user: string) => Promise<User | undefined>
  constructor(options: CommandOptions) {
    this.name = options.name
    this.aliases = options.aliases
    this.description = options.description
    this.description_localizations = options.description_localizations
    this.options = options.options
    this.syntax = options.syntax
    this.examples = options.examples
    this.client = options.client
    this.permissions = options.permissions
    this.botPermissions = options.botPermissions
    this.onlyDev = options.onlyDev
  }
  async run(ctx: CommandContext): Promise<any> {}
}