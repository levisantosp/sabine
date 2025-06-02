import { Constants, InteractionContent, NullablePartialEmoji, SelectOption, StringSelectMenu } from "oceanic.js"

export default class SelectMenuBuilder {
  public type: number = Constants.ComponentTypes.STRING_SELECT;
  public customID?: string
  public placeholder?: string
  public options: SelectOption[] = [];
  public minValues?: number
  public maxValues?: number
  public disabled?: boolean
  public setCustomId(id: string) {
    this.customID = id
    return this
  }
  public setPlaceholder(text: string) {
    this.placeholder = text
    return this
  }
  public addOption(label: string, value: string, description?: string, emoji?: NullablePartialEmoji) {
    this.options.push({ label, value, description, emoji })
    return this
  }
  public addOptions(...options: SelectOption[]) {
    this.options.push(...options)
    return this
  }
  public setOption(label: string, value: string, description?: string, emoji?: NullablePartialEmoji) {
    this.options = [{ label, value, description, emoji }]
    return this
  }
  public setOptions(...options: SelectOption[]) {
    this.options = options
    return this
  }
  public setMin(min: number) {
    this.minValues = min
    return this
  }
  public setMax(max: number) {
    this.maxValues = max
    return this
  }
  public setDisabled(disabled = true) {
    this.disabled = disabled
    return this
  }
  public build(content?: string | InteractionContent) {
    const menu: StringSelectMenu = {
      type: this.type,
      customID: this.customID!,
      placeholder: this.placeholder,
      options: this.options,
      minValues: this.minValues,
      maxValues: this.maxValues,
      disabled: this.disabled,
    }
    if (typeof content === "string") {
      return {
        content: content ?? "",
        components: [
          {
            type: 1,
            components: [menu]
          }
        ]
      }
    }
    else {
      return {
        components: [
          {
            type: 1,
            components: [menu]
          }
        ],
        ...content
      }
    }
  }
}