import { EmbedAuthorOptions, EmbedField, EmbedFooterOptions, EmbedImageOptions, InteractionContent } from "oceanic.js"

export default class EmbedBuilder {
  public author?: EmbedAuthorOptions
  public title?: string
  public description?: string
  public fields?: EmbedField[] = [];
  public image?: EmbedImageOptions
  public thumbnail?: EmbedImageOptions
  public timestamp?: string
  public footer?: EmbedFooterOptions
  public color?: number = 10086557
  public setAuthor(options: EmbedAuthorOptions) {
    this.author = options
    return this
  }
  public setTitle(title: string) {
    this.title = title
    return this
  }
  public setDesc(desc: string) {
    this.description = desc
    return this
  }
  public addField(name: string, value: string, inline = false) {
    this.fields?.push({ name, value, inline })
    return this
  }
  public addFields(fields: EmbedField[]) {
    fields.forEach(field => {
      this.fields?.push({
        name: field.name,
        value: field.value,
        inline: field.inline
      })
    })
    return this
  }
  public setField(name: string, value: string, inline = false) {
    this.fields = [
      {
        name, value, inline
      }
    ]
    return this
  }
  public setFields(...fields: EmbedField[]) {
    this.fields = fields
    return this
  }
  public setImage(url: string) {
    this.image = { url }
    return this
  }
  public setThumb(url: string) {
    this.thumbnail = { url }
    return this
  }
  public setTimestamp(timestamp = new Date()) {
    this.timestamp = timestamp.toISOString()
    return this
  }
  public setFooter(footer: EmbedFooterOptions) {
    this.footer = footer
    return this
  }
  public build(content?: string | InteractionContent) {
    if(typeof content === "string") {
      return {
        content: content ?? "",
        embeds: [this]
      }
    }
    else {
      return {
        embeds: [this],
        ...content
      }
    }
  }
}