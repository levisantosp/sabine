import type { CommandInteraction, TextChannel } from "oceanic.js"
import App from "../client/App.ts"
import CommandContext from "./CommandContext.ts"
import { Blacklist, type BlacklistSchemaInterface, Guild, type GuildSchemaInterface, User, type UserSchemaInterface } from "../../database/index.ts"
import locales, { type Args } from "../../locales/index.ts"
import ButtonBuilder from "../builders/ButtonBuilder.ts"
import EmbedBuilder from "../builders/EmbedBuilder.ts"
import Logger from "../util/Logger.ts"

export default class CommandRunner {
  public async run(
    client: App, interaction: CommandInteraction
  ) {
    const command = client.commands.get(interaction.data.name)
    if(!command) return
    const guild = (await Guild.findById(interaction.guildID) ?? new Guild({ _id: interaction.guildID })) as GuildSchemaInterface
    const user = (await User.findById(interaction.user.id) ?? new User({ _id: interaction.user.id })) as UserSchemaInterface
    const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface
    const ban = blacklist.users.find(user => user.id === interaction.user.id)
    if(blacklist.guilds.find(guild => guild.id === interaction.guildID)) {
      return await interaction.guild?.leave()
    }
    if(ban) {
      return interaction.createMessage({
        content: locales(guild.lang, "helper.banned", {
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
                .setStyle("link")
                .setLabel(locales(guild.lang, "commands.help.community"))
                .setURL("https://discord.gg/g5nmc376yh")
            ]
          }
        ]
      })
    }
    let args: string[] = interaction.data.options.getSubCommand() ?? []
    for(const option of interaction.data.options.getOptions()) {
      args.push(option.value.toString())
    }
    const ctx = new CommandContext({
      client,
      interaction,
      locale: user.lang ?? guild.lang,
      guild: interaction.guild,
      args,
      db: {
        user,
        guild
      }
    })
    const { permissions } = await import(`../../locales/${ctx.locale}.ts`)
    if(command.permissions) {
      let perms: string[] = []
      for(let perm of command.permissions) {
        if(!interaction.member?.permissions.has(perm)) perms.push(perm)
      }
      if(perms[0]) return ctx.reply('helper.permissions.user', {
        permissions: perms.map(p => `\`${permissions[p]}\``).join(', ')
      })
    }
    if(command.botPermissions) {
      let perms = []
      let member = client.guilds.get(guild?.id)?.members.get(client.user.id)
      for(let perm of command.botPermissions) {
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
      return locales(user.lang ?? guild.lang, content, args)
    }
    command.run({ ctx, client, t, id: interaction.data.id })
      .then(async() => {
        if(process.env.DEVS.includes(interaction.user.id)) return
        const cmd = (ctx.interaction as CommandInteraction).data.options.getSubCommand() ? `${command.name} ${(ctx.interaction as CommandInteraction).data.options.getSubCommand()?.join(" ")}` : command.name
        const embed = new EmbedBuilder()
          .setAuthor({
            name: ctx.interaction.user.username,
            iconURL: ctx.interaction.user.avatarURL()
          })
          .setTitle("New slash command executed")
          .setDesc(`The command \`${cmd}\` has been executed in \`${ctx.guild?.name}\``)
          .addField("Server ID", `\`${ctx.guild?.id}\``)
          .addField("Owner", `\`${ctx.guild?.owner?.username}\` (\`${ctx.guild?.ownerID}\`)`)
          .addField("Command author", `\`${ctx.interaction.user.username}\``)
          .setThumb(ctx.guild?.iconURL()!)
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
        ctx.reply("helper.error", { e })
      })
  }
}