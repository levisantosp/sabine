import { Constants } from 'eris'

export default class SelectMenuBuilder {
  constructor() {
    this.type = Constants.ComponentTypes.SELECT_MENU
    this.custom_id = null
    this.placeholder = null
    this.options = []
    this.min_values = null
    this.max_values = null
    this.disabled = null
  }
  setPlaceholder(text) {
    this.placeholder = text
    return this
  }
  setCustomId(id) {
    this.custom_id = id
    return this
  }
  addOption(label, description, value, emoji) {
    if(emoji) {
      if(isNaN(emoji)) this.options.push(
        {
          label,
          description,
          value,
          emoji: {
            name: emoji
          }
        }
      )
      else this.options.push(
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
      this.options.push(
        {
          label,
          description,
          value
        }
      )
    }
    return this
  }
  setMinValues(number) {
    this.min_values = number
    return this
  }
  setMaxValues(number) {
    this.max_values = number
    return this
  }
  setDisabled(disabled = true) {
    this.disabled = disabled
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