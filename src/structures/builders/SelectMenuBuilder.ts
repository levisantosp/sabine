import { 
  StringSelectMenuBuilder,
  ActionRowBuilder,
  type InteractionReplyOptions,
  type ComponentEmojiResolvable
} from 'discord.js'

export default class SelectMenuBuilder extends StringSelectMenuBuilder {
  public setCustomId(id: string) {
    super.setCustomId(id)

    return this
  }

  public setPlaceholder(text: string) {
    super.setPlaceholder(text)

    return this
  }

  public addOption(
    label: string,
    value: string,
    description?: string,
    emoji?: ComponentEmojiResolvable,
    isDefault = false
  ) {
    super.addOptions({ label, value, description, emoji, default: isDefault })

    return this
  }

  public setOption(
    label: string,
    value: string,
    description?: string,
    emoji?: ComponentEmojiResolvable,
    isDefault = false
  ) {
    super.setOptions({ label, value, description, emoji, default: isDefault })

    return this
  }

  public setMin(min: number) {
    super.setMinValues(min)

    return this
  }

  public setMax(max: number) {
    super.setMaxValues(max)

    return this
  }

  public setDisabled(disabled = true) {
    super.setDisabled(disabled)

    return this
  }

  public build(content?: string | InteractionReplyOptions) {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(this)

    if(typeof content === 'string') {
      return {
        content: content ?? '',
        components: [row]
      }
    }
    
    else {
      return {
        components: [row],
        ...content
      }
    }
  }
}