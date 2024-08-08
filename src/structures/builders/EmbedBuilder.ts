import { EmbedAuthorOptions, EmbedField, EmbedFooterOptions, EmbedImageOptions } from 'oceanic.js'

export default class EmbedBuilder {
  public author?: EmbedAuthorOptions
  public title?: string
  public description?: string
  public fields?: EmbedField[] = []
  public image?: EmbedImageOptions
  public thumbnail?: EmbedImageOptions
  public timestamp?: string
  public footer?: EmbedFooterOptions
  public color?: number = 0x7289DA
  public setAuthor(name: string, iconURL?: string, url?: string) {
    this.author = {
      name,
      iconURL,
      url
    }
    return this
  }
  public setTitle(title: string) {
    this.title = title
    return this
  }
  public setDescription(desc: string) {
    this.description = desc
    return this
  }
  public addField(name: string, value: string, inline?: boolean) {
    this.fields?.push(
      {
        name,
        value,
        inline
      }
    )
    return this
  }
  public setImage(url: string) {
    this.image = {
      url
    }
    return this
  }
  public setThumbnail(url: string) {
    this.thumbnail = {
      url
    }
    return this
  }
  public setFooter(text: string, iconURL?: string) {
    this.footer = {
      text,
      iconURL
    }
    return this
  }
  public setTimestamp(timestamp = new Date()) {
    this.timestamp = timestamp.toISOString()
    return this
  }
  public build(content = '') {
    return {
      content,
      embeds: [this]
    }
  }
}