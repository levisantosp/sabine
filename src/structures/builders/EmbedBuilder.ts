import * as Oceanic from "oceanic.js"

export default class EmbedBuilder {
  public author?: Oceanic.EmbedAuthorOptions
  public title?: string
  public description?: string
  public fields?: Oceanic.EmbedField[] = [];
  public image?: Oceanic.EmbedImageOptions
  public thumbnail?: Oceanic.EmbedImageOptions
  public timestamp?: string
  public footer?: Oceanic.EmbedFooterOptions
  public color?: number = 6719296
  public setAuthor(options: Oceanic.EmbedAuthorOptions) {
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
  public addFields(fields: Oceanic.EmbedField[]) {
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
  public setFields(...fields: Oceanic.EmbedField[]) {
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
  public setFooter(footer: Oceanic.EmbedFooterOptions) {
    this.footer = footer
    return this
  }
  public build(content?: string | Oceanic.InteractionContent): Oceanic.InteractionContent {
    if(typeof content === "string" || !content) {
      return {
        content: content ?? "",
        embeds: [this],
        components: []
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