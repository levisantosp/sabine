import { User } from '../database'
import { Command, CommandContext } from '../structures'

export default class LanguageCommand extends Command {
  public constructor() {
    super({
      name: 'language',
      nameLocalizations: {
        'pt-BR': 'idioma'
      },
      description: 'Change the language that I interact with you',
      descriptionLocalizations: {
        'pt-BR': 'Altera o idioma que eu interajo com você'
      },
      syntax: 'language [lang]',
      examples: [
        'language Português Brasileiro',
        'language American English'
      ],
      options: [
        {
          type: 3,
          name: 'lang',
          nameLocalizations: {
            'pt-BR': 'idioma'
          },
          description: 'Select a language',
          descriptionLocalizations: {
            'pt-BR': 'Selecione um idioma'
          },
          choices: [
            {
              name: 'Português Brasileiro',
              value: 'pt'
            },
            {
              name: 'American English',
              value: 'en'
            }
          ],
          required: true
        }
      ]
    })
  }
  public async run(ctx: CommandContext) {
    const user = await User.findById(ctx.callback.user.id) || new User({ _id: ctx.callback.user.id })
    switch(ctx.args[0]) {
      case 'en': {
        user.lang = ctx.args[0]
        await user.save()
        ctx.reply('Now I will interact in english with you!')
      }
      break
      case 'pt': {
        user.lang = ctx.args[0]
        await user.save()
        ctx.reply('Agora eu irei interagir em português com você.')
      }
    }
  }
}