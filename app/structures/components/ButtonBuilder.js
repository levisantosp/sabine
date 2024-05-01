import { Constants } from 'eris'

export default class ButtonBuilder {
  constructor() {
    this.type = Constants.ComponentTypes.BUTTON
    this.style = null
    this.label = null
    this.custom_id = null
    this.emoji = null
    this.url = null
    this.disabled = null    
  }
  setStyle(style) {
    switch(style.toLowerCase()) {
      case 'blue': this.style = Constants.ButtonStyles.PRIMARY
      break
      case 'gray': this.style = Constants.ButtonStyles.SECONDARY
      break
      case 'green': this.style = Constants.ButtonStyles.SUCCESS
      break
      case 'red': this.style = Constants.ButtonStyles.DANGER
      break
      case 'link': this.style = Constants.ButtonStyles.LINK
      break
      default: throw new Error('Invalid style! Please, choose: \'BLUE\', \'GRAY\', \'GREEN\', \'RED\', \'LINK\'')
    }
    return this
  }
  setLabel(label) {
    this.label = label
    return this
  }
  setCustomId(id) {
    this.custom_id = id
    return this
  }
  setEmoji(emoji) {
    if(isNaN(emoji)) this.emoji = {
      name: emoji
    }
    else this.emoji = {
      id: emoji
    }
    return this
  }
  setURL(url) {
    this.url = url
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