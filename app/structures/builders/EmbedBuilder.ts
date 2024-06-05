import { EmbedAuthorOptions, EmbedField, EmbedFooterOptions, EmbedImageOptions } from 'eris'

export default class EmbedBuilder {
  author?: EmbedAuthorOptions
  title?: string
  description?: string
  fields?: EmbedField[]
  image?: EmbedImageOptions
  thumbnail?: EmbedImageOptions
  timestamp?: Date
  footer?: EmbedFooterOptions
  color?: number
  constructor() {
    this.color = 0x7289DA
    this.fields = []
  }
  setAuthor(name: string, icon_url?: string, url?: string) {
    this.author = {
      name,
      icon_url,
      url
    }
    return this
  }
  setTitle(title: string) {
    this.title = title
    return this
  }
  setDescription(desc: string) {
    this.description = desc
    return this
  }
  addField(name: string, value: string, inline?: boolean) {
    this.fields?.push(
      {
        name,
        value,
        inline
      }
    )
    return this
  }
  setImage(url: string) {
    this.image = {
      url
    }
    return this
  }
  setThumbnail(url: string) {
    this.thumbnail = {
      url
    }
    return this
  }
  setFooter(text: string, icon_url?: string) {
    this.footer = {
      text,
      icon_url
    }
    return this
  }
  setTimestamp(timestamp?: Date) {
    this.timestamp = timestamp ?? new Date()
    return this
  }
  build(content = '') {
    return {
      content,
      embed: this
    }
  }
}