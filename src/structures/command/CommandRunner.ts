import type { CommandInteraction, Guild, TextChannel } from 'oceanic.js'
import App from '../client/App.ts'
import CommandContext from './CommandContext.ts'
import locales, { type Args } from '../../locales/index.ts'
import ButtonBuilder from '../builders/ButtonBuilder.ts'
import EmbedBuilder from '../builders/EmbedBuilder.ts'
import Logger from '../util/Logger.ts'
import { PrismaClient } from '@prisma/client'
import { SabineGuild, SabineUser } from '../../database/index.ts'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const prisma = new PrismaClient()

export default class CommandRunner {
  public async run(
    client: App, interaction: CommandInteraction
  ) {
    const command = client.commands.get(interaction.data.name)
    if(!command) return
    let guild: SabineGuild | undefined
    let g: Guild | undefined
    if(interaction.guildID) {
      guild = await SabineGuild.fetch(interaction.guildID) ?? new SabineGuild(interaction.guildID)
      g = client.guilds.get(interaction.guildID)
    }
    const user = await SabineUser.fetch(interaction.user.id) ?? new SabineUser(interaction.user.id)
    const blacklist = (await prisma.blacklists.findFirst())!
    const ban = blacklist.users.find(user => user.id === interaction.user.id)
    if(blacklist.guilds.find(guild => guild.id === interaction.guildID)) {
      return await interaction.guild?.leave()
    }
    if(ban) {
      return interaction.createMessage({
        content: locales(guild?.lang ?? 'en', 'helper.banned', {
          reason: ban.reason,
          ends: ban.endsAt === Infinity ? Infinity : `<t:${ban.endsAt}:F> | <t:${ban.endsAt}:R>`,
          when: `<t:${ban.when}:F> | <t:${ban.when}:R>`
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
    const args: string[] = interaction.data.options.getSubCommand() ?? []
    for(const option of interaction.data.options.getOptions()) {
      args.push(option.value.toString())
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
    const path = resolve(`src/locales/${ctx.locale}.json`)
    const raw = readFileSync(path, 'utf-8')
    const { permissions } = JSON.parse(raw)
    if(command.permissions) {
      const perms: string[] = []
      for(const perm of command.permissions) {
        if(!interaction.member?.permissions.has(perm)) perms.push(perm)
      }
      if(perms[0]) return ctx.reply('helper.permissions.user', {
        permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
      })
    }
    if(command.botPermissions && guild) {
      const perms = []
      const member = client.guilds.get(guild.id)?.members.get(client.user.id)
      for(const perm of command.botPermissions) {
        if(!member?.permissions.has(perm as any)) perms.push(perm)
      }
      if(perms[0]) return ctx.reply('helper.permissions.bot', {
        permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
      })
    }
    if(command.ephemeral) {
      await interaction.defer(64)
    }
    else {
      await interaction.defer()
    }
    const t = (content: string, args?: Args) => {
      return locales(user.lang ?? guild?.lang ?? 'en', content, args)
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
          .addField('Command author', `\`${ctx.interaction.user.username}\``)
        if(ctx.guild) {
          embed.setThumb(ctx.guild.iconURL()!)
        }
        const channel = await client.rest.channels.get(process.env.COMMAND_LOG!) as TextChannel
        const webhooks = await channel.getWebhooks()
        let webhook = webhooks.find(w => w.name === `${client.user.username} Logger`)
        if(!webhook) webhook = await channel.createWebhook({ name: `${client.user.username} Logger` })
        webhook.execute({
          embeds: [embed],
          avatarURL: client.user.avatarURL()
        }, webhook.token!)
      })
      .catch(e => {
        new Logger(client).error(e)
        ctx.reply('helper.error', { e })
      })
  }
}