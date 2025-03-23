import { Constants, InitialInteractionContent, NullablePartialEmoji, URLButton } from "oceanic.js"

export default class ButtonBuilder {
  public type: number = 2;
  public style!: 1 | 2 | 3 | 4 | 5;
  public label?: string;
  public customID!: string;
  public emoji?: NullablePartialEmoji;
  public url!: string;
  public disabled?: boolean;
  public setStyle(style: "blue" | "gray" | "green" | "red" | "link") {
    switch(style.toLowerCase()) {
      case "blue": this.style = Constants.ButtonStyles.PRIMARY;
      break;
      case "gray": this.style = Constants.ButtonStyles.SECONDARY;
      break;
      case "green": this.style = Constants.ButtonStyles.SUCCESS;
      break;
      case "red": this.style = Constants.ButtonStyles.DANGER;
      break;
      case "link": this.style = Constants.ButtonStyles.LINK;
      break;
      default: throw new Error("Invalid style! Please, choose: \"BLUE\", \"GRAY\", \"GREEN\", \"RED\", \"LINK\"");
    }
    return this;
  }
  public setLabel(label: string) {
    this.label = label;
    return this;
  }
  public setCustomId(id: string) {
    this.customID = id;
    return this;
  }
  public setEmoji(emoji: string) {
    if(isNaN(Number(emoji))) this.emoji = {
      name: emoji
    };
    else this.emoji = {
      id: emoji
    };
    return this;
  }
  public setURL(url: string) {
    this.url = url;
    return this as unknown as URLButton;
  }
  public setDisabled() {
    this.disabled = true;
    return this;
  }
  public setEnabled() {
    this.disabled = false;
    return this;
  }
  public build(content?: string | InitialInteractionContent) {
    if(typeof content === "string") {
      return {
        content: content ?? "",
        components: [
          {
            type: 1,
            components: [this]
          }
        ]
      }
    }
    else {
      return {
        components: [
          {
            type: 1,
            components: [this]
          }
        ],
        ...content
      }
    }
  }
}