import { Constants, SelectMenuOptions } from 'eris'

export default class SelectMenuBuilder {
  type: 3
  custom_id!: string
  placeholder?: string
  options!: SelectMenuOptions[]
  min_values?: number
  max_values?: number
  disabled?: boolean
  constructor() {
    this.type = Constants.ComponentTypes.SELECT_MENU
  }
  setPlaceholder(text: string) {
    this.placeholder = text
    return this
  }
  setCustomId(id: string) {
    this.custom_id = id
    return this
  }
  addOption(label: string, description: string, value: string, emoji: string) {
    if(emoji) {
      if(isNaN(Number(emoji))) this.options?.push(
        {
          label,
          description,
          value,
          emoji: {
            name: emoji
          }
        }
      )
      else this.options?.push(
        {
          label,
          description,
          value,
          emoji: {
            id: emoji
          }
        }
      )
    }
    else {
      this.options?.push(
        {
          label,
          description,
          value
        }
      )
    }
    return this
  }
  setMinValues(number: number) {
    this.min_values = number
    return this
  }
  setMaxValues(number: number) {
    this.max_values = number
    return this
  }
  setDisabled() {
    this.disabled = true
    return this
  }
  build(content = '') {
    return {
      content,
      components: [
        {
          type: 1,
          components: [this]
        }
      ]
    }
  }
}