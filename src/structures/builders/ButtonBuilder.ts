import { Constants } from 'eris'

export default class ButtonBuilder {
  type: 2
  style!: 1 | 2 | 3 | 4 | 5
  label?: string
  custom_id?: string
  emoji?: {
    name?: string
    id?: string
  }
  url!: string
  disabled?: boolean
  constructor() {
    this.type = Constants.ComponentTypes.BUTTON 
  }
  setStyle(style: 'blue' | 'gray' | 'green' | 'red' | 'link') {
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
  setLabel(label: string) {
    this.label = label
    return this
  }
  setCustomId(id: string) {
    this.custom_id = id
    return this
  }
  setEmoji(emoji: string) {
    if(isNaN(Number(emoji))) this.emoji = {
      name: emoji
    }
    else this.emoji = {
      id: emoji
    }
    return this
  }
  setURL(url: string) {
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