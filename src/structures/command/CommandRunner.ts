import type { CommandInteraction, Guild, TextChannel } from 'oceanic.js'
import App from '../client/App.ts'
import CommandContext from './CommandContext.ts'
import locales from '../../locales/index.ts'
import ButtonBuilder from '../builders/ButtonBuilder.ts'
import EmbedBuilder from '../builders/EmbedBuilder.ts'
import { SabineGuild, SabineUser } from '../../database/index.ts'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import Logger from '../../util/Logger.ts'
import type { Blacklist } from '@prisma/client'

const locale: {
  [key: string]: string
} = {
  pt: 'br',
  en: 'us'
}

const raw: {
  [key: string]: any
} = {
  pt: JSON.parse(readFileSync(path.resolve('src/locales/pt.json'), 'utf-8')),
  en: JSON.parse(readFileSync(path.resolve('src/locales/en.json'), 'utf-8'))
}

export default class CommandRunner {
  public async run(
    client: App, interaction: CommandInteraction
  ): Promise<unknown> {
    const command = client.commands.get(interaction.data.name)

    if(!command) return

    let guild: SabineGuild | undefined
    let g: Guild | undefined

    if(interaction.guildID) {
      guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
      g = client.guilds.get(interaction.guildID)
    }

    const rawBlacklist = await client.redis.get('blacklist')
    const value: Blacklist[] = rawBlacklist ? JSON.parse(rawBlacklist) : []
    const blacklist = new Map<string | null, Blacklist>(value.map(b => [b.id, b]))

    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)

    const ban = blacklist.get(interaction.user.id)

    if(blacklist.get(interaction.guildID)) {
      return await interaction.guild?.leave()
    }

    if(ban) {
      return await interaction.createMessage({
        content: locales(guild?.lang ?? 'en', 'helper.banned', {
          reason: ban.reason,
          ends: !ban.ends_at ? Infinity : `<t:${(new Date(ban.ends_at).getTime() / 1000).toFixed(0)}:F> | <t:${(new Date(ban.ends_at).getTime() / 1000).toFixed(0)}:R>`,
          when: `<t:${(new Date(ban.when).getTime() / 1000).toFixed(0)}:F> | <t:${(new Date(ban.when).getTime() / 1000).toFixed(0)}:R>`
        }),
        flags: 64,
        components: [
          {
            type: 1,
            components: [
              new ButtonBuilder()
                .setStyle('link')
                .setLabel(locales(guild?.lang ?? 'en', 'commands.help.community'))
                .setURL('https://discord.gg/g5nmc376yh')
            ]
          }
        ]
      })
    }

    const args: (string | number | boolean)[] = interaction.data.options.getSubCommand() ?? []

    for(const option of interaction.data.options.getOptions()) {
      args.push(option.value.valueOf())
    }

    const ctx = new CommandContext({
      client,
      interaction,
      locale: user.lang ?? guild?.lang ?? 'en',
      guild: g,
      args,
      db: {
        user,
        guild
      }
    })

    const { permissions } = raw[ctx.locale]

    if(command.permissions) {
      const perms: string[] = []

      for(const perm of command.permissions) {
        if(!interaction.member?.permissions.has(perm)) perms.push(perm)
      }

      if(perms[0]) return await ctx.reply('helper.permissions.user', {
        permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
      })
    }
    if(command.botPermissions && guild) {
      const perms = []

      const member = client.guilds.get(guild.id)?.members.get(client.user.id)

      for(const perm of command.botPermissions) {
        if(!member?.permissions.has(perm as any)) perms.push(perm)
      }

      if(perms[0]) return await ctx.reply('helper.permissions.bot', {
        permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
      })
    }

    if(command.ephemeral) {
      await interaction.defer(64)
    }

    else if(command.isThinking) {
      await interaction.defer()
    }

    const t = ctx.t.bind(ctx)

    if(user.warn) {
      const update = await client.prisma.update.findFirst({
        orderBy: {
          published_at: 'desc'
        }
      })

      if(update) {
        const button = new ButtonBuilder()
          .setLabel(t('helper.dont_show_again'))
          .setStyle('red')
          .setCustomId('dontshowagain')
          .build(t('helper.warn', {
            link: `https://sabinebot.xyz/${locale[ctx.locale]}/changelog/v${update.id}`
          }))

        await ctx.reply(button)
      }
    }
    if(command.cooldown) {
      const cooldown = await client.redis.get(`cooldown:${interaction.user.id}`)

      if(cooldown) {
        return await ctx.reply('helper.cooldown', {
          cooldown: `<t:${(Number(cooldown) / 1000).toFixed(0)}:R>`
        })
      }

      await client.redis.set(`cooldown:${interaction.user.id}`, Date.now() + 5000, {
        expiration: {
          type: 'EX',
          value: 5
        }
      })
    }
    command.run({ ctx, client, t, id: interaction.data.id })
      .then(async() => {
        if(process.env.DEVS.includes(interaction.user.id)) return

        const cmd = (ctx.interaction as CommandInteraction).data.options.getSubCommand() ? `${command.name} ${(ctx.interaction as CommandInteraction).data.options.getSubCommand()?.join(' ')}` : command.name

        const embed = new EmbedBuilder()
          .setAuthor({
            name: ctx.interaction.user.username,
            iconURL: ctx.interaction.user.avatarURL()
          })
          .setTitle('New slash command executed')
          .setDesc(`The command \`${cmd}\` has been executed in \`${ctx.guild?.name}\``)
          .addField('Server ID', `\`${ctx.guild?.id}\``)
          .addField('Owner', `\`${ctx.guild?.owner?.username}\` (\`${ctx.guild?.ownerID}\`)`)
          .addField('Command author', `\`${ctx.interaction.user.username}\` (\`${ctx.interaction.user.id}\`)`)

        if(ctx.guild) {
          embed.setThumb(ctx.guild.iconURL()!)
        }

        const channel = await client.rest.channels.get(process.env.COMMAND_LOG!) as TextChannel
        const webhooks = await channel.getWebhooks()

        let webhook = webhooks.find(w => w.name === `${client.user.username} Logger`)

        if(!webhook) webhook = await channel.createWebhook({ name: `${client.user.username} Logger` })

        await webhook.execute({
          embeds: [embed],
          avatarURL: client.user.avatarURL()
        }, webhook.token!)
      })
      .catch(async e => {
        await new Logger(client).error(e)
        
        await ctx.reply('helper.error', { e })
      })
  }
}