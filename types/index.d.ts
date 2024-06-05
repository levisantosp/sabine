import { ComponentInteractionSelectMenuData, Constants, FileContent, Interaction, InteractionContent, InteractionContentEdit, Member, Message, Permission, PossiblyUncachedTextable, TextableChannel, User } from 'eris'

interface ComponentInteractionButtonData {
  component_type: Constants["ComponentTypes"]["BUTTON"]
  custom_id: string
  components: Array<{
    components: Array<{
      value: string
    }>
  }>
}
export class SelectMenuInteraction<T extends PossiblyUncachedTextable = TextableChannel> extends Interaction {
  appPermissions?: Permission
  channel: T
  data: ComponentInteractionSelectMenuData
  guildID?: string
  member?: Member
  message: Message
  type: Constants["InteractionTypes"]["MESSAGE_COMPONENT"]
  user?: User
  acknowledge(): Promise<void>
  createFollowup(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<Message>
  createMessage(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<void>
  defer(flags?: number): Promise<void>
  deferUpdate(): Promise<void>
  deleteMessage(messageID: string): Promise<void>
  deleteOriginalMessage(): Promise<void>
  editMessage(messageID: string, content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message>
  editOriginalMessage(content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message>
  editParent(content: InteractionContentEdit, file?: FileContent | FileContent[]): Promise<void>
  getOriginalMessage(): Promise<Message>
}
export class ButtonInteraction<T extends PossiblyUncachedTextable = TextableChannel> extends Interaction {
  appPermissions?: Permission
  channel: T
  data: ComponentInteractionButtonData
  guildID?: string
  member?: Member
  message: Message
  type: Constants["InteractionTypes"]["MESSAGE_COMPONENT"]
  user?: User
  acknowledge(): Promise<void>
  createFollowup(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<Message>
  createMessage(content: string | InteractionContent, file?: FileContent | FileContent[]): Promise<void>
  defer(flags?: number): Promise<void>
  deferUpdate(): Promise<void>
  deleteMessage(messageID: string): Promise<void>
  deleteOriginalMessage(): Promise<void>
  editMessage(messageID: string, content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message>
  editOriginalMessage(content: string | InteractionContentEdit, file?: FileContent | FileContent[]): Promise<Message>
  editParent(content: InteractionContentEdit, file?: FileContent | FileContent[]): Promise<void>
  getOriginalMessage(): Promise<Message>
}