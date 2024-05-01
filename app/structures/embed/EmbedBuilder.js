export default class EmbedBuilder {
  constructor() {
    this.author = {
      name: '',
      icon_url: '',
      url: ''
    }
    this.title = ''
    this.description = ''
    this.fields = []
    this.image = {
      url: ''
    }
    this.thumbnail = {
      url: ''
    }
    this.timestamp = new Date()
    this.footer = {
      text: '',
      icon_url: ''
    }
    this.color = 0x7289DA
  }

  setAuthor(name, icon_url, url) {
    this.author = {
      name,
      icon_url,
      url
    }
    return this
  }
  setTitle(title) {
    this.title = title
    return this
  }
  setDescription(desc) {
    this.description = desc
    return this
  }
  addField(name, value = '', inline) {
    this.fields.push(
      {
        name,
        value,
        inline
      }
    )
    return this
  }
  setImage(url) {
    this.image = {
      url
    }
    return this
  }
  setThumbnail(url) {
    this.thumbnail = {
      url
    }
    return this
  }
  setFooter(text, icon_url) {
    this.footer = {
      text,
      icon_url
    }
    return this
  }
  setTimestamp(timestamp) {
    this.timestamp = timestamp
    return this
  }
  build(content = '') {
    return {
      content,
      embed: this
    }
  }
}