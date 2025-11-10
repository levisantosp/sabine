import { ApplicationCommandOptionType } from 'discord.js'
import createCommand from '../../structures/command/createCommand.ts'
import ButtonBuilder from '../../structures/builders/ButtonBuilder.ts'

export default createCommand({
  name: 'arena',
  description: 'Join the Arena queue, see the leaderboard, and more',
  descriptionLocalizations: {
    'pt-BR': 'Entre na fila da Arena, veja a tabela, e mais'
  },
  category: 'pvp',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'join',
      nameLocalizations: {
        'pt-BR': 'entrar'
      },
      description: 'Join the Arena queue',
      descriptionLocalizations: {
        'pt-BR': 'Entre na fila da Arena'
      },
      options: [
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'notify',
          nameLocalizations: {
            'pt-BR': 'notificar'
          },
          description: 'Notify when finished',
          descriptionLocalizations: {
            'pt-BR': 'Notificar quando acabar'
          }
        }
      ]
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'leave',
      nameLocalizations: {
        'pt-BR': 'sair'
      },
      description: 'Leave the Arena queue',
      descriptionLocalizations: {
        'pt-BR': 'Saia da fila da Arena'
      }
    }
  ],
  async run({ ctx }) {
    const actions: {[key: string]: () => Promise<unknown>} = {
      join: async() => {
        if(!ctx.db.user.team_name || ctx.db.user.active_players.length < 5) {
          return await ctx.reply('commands.duel.team_not_completed_1')
        }

        const isAlreadyInQueue = await ctx.app.redis.get(`arena:in_queue:${ctx.db.user.id}`)

        if(isAlreadyInQueue) {
          return await ctx.reply('commands.arena.is_already_in_queue')
        }

        const payload: {
          userId: string
          channelId?: string
        } = {
          userId: ctx.db.user.id
        }

        if(ctx.args[1]) {
          payload.channelId = ctx.interaction.channelId
        }

        await Promise.all([
          ctx.app.redis.set(`arena:in_queue:${ctx.db.user.id}`, 1, {
            expiration: {
              type: 'EX',
              value: 1800
            }
          }),
          ctx.app.redis.lPush('arena:queue', JSON.stringify(payload))
        ])

        await ctx.reply('commands.arena.joined')
      },
      leave: async() => {
        const isAlreadyInQueue = await ctx.app.redis.get(`arena:in_queue:${ctx.db.user.id}`)

        if(!isAlreadyInQueue) {
          return await ctx.reply('commands.arena.is_not_in_queue')
        }
        
        await ctx.app.redis.del(`arena:in_queue:${ctx.db.user.id}`)

        await ctx.reply('commands.arena.left')
      }
    }

    await actions[ctx.args[0].toString()]()
  }
})