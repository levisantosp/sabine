import { ChannelType, type ChatInputCommandInteraction, type CommandInteraction, type Guild, type PermissionResolvable, type TextChannel } from 'discord.js'
import App from '../app/App.ts'
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
    app: App, interaction: ChatInputCommandInteraction
  ): Promise<unknown> {
    if (!interaction.command) return

    const command = app.commands.get(interaction.command.name)

    if (!command) return

    let guild: SabineGuild | undefined
    let g: Guild | undefined

    if (interaction.guildId) {
      guild = await SabineGuild.fetch(interaction.guildId) ?? new SabineGuild(interaction.guildId)
      g = app.guilds.cache.get(interaction.guildId)
    }

    const rawBlacklist = await app.redis.get('blacklist')
    const value: Blacklist[] = rawBlacklist ? JSON.parse(rawBlacklist) : []
    const blacklist = new Map<string | null, Blacklist>(value.map(b => [b.id, b]))

    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)

    const ban = blacklist.get(interaction.user.id)

    if (blacklist.get(interaction.guildId)) {
      return await interaction.guild?.leave()
    }

    if (ban) {
      return await interaction.reply({
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
                .defineStyle('link')
                .setLabel(locales(guild?.lang ?? 'en', 'commands.help.community'))
                .setURL('https://discord.gg/g5nmc376yh')
            ]
          }
        ]
      })
    }

    const args: (string | number | boolean)[] = []

    const sub = interaction.options.getSubcommand(false)
    const group = interaction.options.getSubcommandGroup(false)

    if (sub) args.push(sub)
    if (group) args.push(group)

    const ctx = new CommandContext({
      app,
      interaction,
      locale: user.lang,
      guild: g,
      args,
      db: {
        user,
        guild
      }
    })

    const { permissions } = raw[ctx.locale]

    if (command.permissions) {
      const perms: PermissionResolvable[] = []

      for (const perm of command.permissions) {
        if (!interaction.memberPermissions?.has(perm)) perms.push(perm)
      }

      if (perms[0]) return await ctx.reply('helper.permissions.user', {
        permissions: perms.map(p => `\`${permissions[p.toString()]}\``).join(', ')
      })
    }
    if (command.botPermissions && guild) {
      const perms: PermissionResolvable[] = []

      const member = app.guilds.cache.get(guild.id)?.members.cache.get(app.user!.id)

      for (const perm of command.botPermissions) {
        if (!member?.permissions.has(perm)) perms.push(perm)
      }

      if (perms[0]) return await ctx.reply('helper.permissions.bot', {
        permissions: perms.map(p => `\`${permissions[p.toString()]}\``).join(', ')
      })
    }

    if (command.ephemeral) {
      await interaction.deferReply({ flags: 64, withResponse: true })
    }

    else if (command.isThinking) {
      await interaction.deferReply({ withResponse: true })
    }

    const t = ctx.t.bind(ctx)

    if (user.warn) {
      const update = await app.prisma.update.findFirst({
        orderBy: {
          published_at: 'desc'
        }
      })

      if (update) {
        const button = new ButtonBuilder()
          .setLabel(t('helper.dont_show_again'))
          .defineStyle('red')
          .setCustomId('dontshowagain')
          .build(t('helper.warn', {
            link: `https://sabinebot.xyz/${locale[ctx.locale]}/changelog/v${update.id}`
          }))

        await ctx.reply(button)
      }
    }
    if (command.cooldown) {
      const cooldown = await app.redis.get(`cooldown:${interaction.user.id}`)

      if (cooldown) {
        return await ctx.reply('helper.cooldown', {
          cooldown: `<t:${(Number(cooldown) / 1000).toFixed(0)}:R>`
        })
      }

      await app.redis.set(`cooldown:${interaction.user.id}`, Date.now() + 5000, {
        expiration: {
          type: 'EX',
          value: 5
        }
      })
    }
    command.run({ ctx, app, t, id: interaction.id })
      .then(async () => {
        if (process.env.DEVS.includes(interaction.user.id)) return

        const cmd = [group, sub].filter(Boolean).join(' ')

        const embed = new EmbedBuilder()

        if (ctx.guild) {
          const owner = app.users.cache.get(ctx.guild.ownerId)

          embed
            .setAuthor({
              name: ctx.interaction.user.username,
              iconURL: ctx.interaction.user.displayAvatarURL({ size: 2048 })
            })
            .setTitle('New slash command executed')
            .setDesc(`The command \`${cmd}\` has been executed in \`${ctx.guild?.name}\``)
            .addField('Server ID', `\`${ctx.guild?.id}\``)
            .addField('Owner', `\`${owner?.username}\` (\`${owner?.id}\`)`)
            .addField('Command author', `\`${ctx.interaction.user.username}\` (\`${ctx.interaction.user.id}\`)`)
        }

        else {
          embed
            .setAuthor({
              name: ctx.interaction.user.username,
              iconURL: ctx.interaction.user.displayAvatarURL({ size: 2048 })
            })
            .setTitle('New slash command executed')
            .setDesc(`The command \`${cmd}\` has been executed in DM`)
            .addField('Command author', `\`${ctx.interaction.user.username}\` (\`${ctx.interaction.user.id}\`)`)
        }

        if (ctx.guild) {
          embed.setThumb(ctx.guild.iconURL()!)
        }

        const channel = await app.channels.fetch(process.env.COMMAND_LOG!)

        if (!channel || channel.type !== ChannelType.GuildText) return

        const webhooks = await channel.fetchWebhooks()

        let webhook = webhooks.find(w => w.name === `${app.user?.username} Logger`)

        if (!webhook) webhook = await channel.createWebhook({ name: `${app.user?.username} Logger` })

        await webhook.send({
          embeds: [embed],
          avatarURL: app.user?.displayAvatarURL({ size: 2048 })
        })
      })
      .catch(async e => {
        await new Logger(app).error(e)

        await ctx.reply('helper.error', { e })
      })
  }
}