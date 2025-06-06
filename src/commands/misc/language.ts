import createCommand from "../../structures/command/createCommand.js"

export default createCommand({
  name: "language",
  category: "misc",
  nameLocalizations: {
    "pt-BR": "idioma"
  },
  description: "Change the language that I interact with you",
  descriptionLocalizations: {
    "pt-BR": "Altera o idioma que eu interajo com você"
  },
  options: [
    {
      type: 3,
      name: "lang",
      nameLocalizations: {
        "pt-BR": "idioma"
      },
      description: "Select the language",
      descriptionLocalizations: {
        "pt-BR": "Selecione o idioma"
      },
      choices: [
        {
          name: "pt-BR",
          value: "pt"
        },
        {
          name: "en-US",
          value: "en"
        }
      ],
      required: true
    }
  ],
  syntax: "language [lang]",
  examples: [
    "language en-US",
    "language pt-BR"
  ],
  async run({ ctx }) {
    switch (ctx.args[0]) {
      case "pt": {
        ctx.db.user.lang = "pt"
        await ctx.db.user.save()
        ctx.reply("Agora eu irei interagir em português com você!")
      }
        break
      case "en": {
        ctx.db.user.lang = "en"
        await ctx.db.user.save()
        ctx.reply("Now I will interact in english with you!")
      }
    }
  }
})