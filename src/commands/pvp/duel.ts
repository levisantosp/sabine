import { ApplicationCommandOptionTypes } from "oceanic.js"
import createCommand from "../../structures/command/createCommand.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import { SabineUser } from "../../database/index.ts"

export default createCommand({
  name: "duel",
  nameLocalizations: {
    "pt-BR": "confronto"
  },
  category: "economy",
  description: "Start a duel with someone",
  descriptionLocalizations: {
    "pt-BR": "Inicia um confronto com alguém"
  },
  options: [
    {
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
      name: "unranked",
      description: "Start a unranked duel",
      descriptionLocalizations: {
        "pt-BR": "Inicia um confronto sem classificação"
      },
      options: [
        {
          type: ApplicationCommandOptionTypes.USER,
          name: "user",
          nameLocalizations: {
            "pt-BR": "usuário"
          },
          description: "Provide a user",
          descriptionLocalizations: {
            "pt-BR": "Informe o usuário"
          },
          required: true
        }
      ]
    },
    {
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
      name: "ranked",
      description: "Start a ranked duel",
      descriptionLocalizations: {
        "pt-BR": "Inicia um confronto ranqueado"
      },
      options: [
        {
          type: ApplicationCommandOptionTypes.USER,
          name: "user",
          nameLocalizations: {
            "pt-BR": "usuário"
          },
          description: "Provide a user",
          descriptionLocalizations: {
            "pt-BR": "Informe o usuário"
          },
          required: true
        }
      ]
    },
    {
      type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
      name: "swiftplay",
      nameLocalizations: {
        "pt-BR": "frenético"
      },
      description: "Start a swiftplay duel",
      descriptionLocalizations: {
        "pt-BR": "Inicia um confronto frenético"
      },
      options: [
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: "unranked",
          description: "Start a unranked swiftplay duel",
          descriptionLocalizations: {
            "pt-BR": "Inicia um confronto frenético sem classificação"
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.USER,
              name: "user",
              nameLocalizations: {
                "pt-BR": "usuário"
              },
              description: "Provide a user",
              descriptionLocalizations: {
                "pt-BR": "Informe o usuário"
              },
              required: true
            }
          ]
        },
        {
          type: ApplicationCommandOptionTypes.SUB_COMMAND,
          name: "ranked",
          description: "Start a ranked swiftplay duel",
          descriptionLocalizations: {
            "pt-BR": "Inicia um confronto frenético ranqueado"
          },
          options: [
            {
              type: ApplicationCommandOptionTypes.USER,
              name: "user",
              nameLocalizations: {
                "pt-BR": "usuário"
              },
              description: "Provide a user",
              descriptionLocalizations: {
                "pt-BR": "Informe o usuário"
              },
              required: true
            }
          ]
        }
      ]
    }
  ],
  async run({ ctx, t, client }) {
    const user = await SabineUser.fetch(
      typeof ctx.args.at(-1) === "boolean" ? ctx.args[ctx.args.length - 2].toString() : ctx.args.at(-1)!.toString()
    )
    const authorCounts: {[key: string]: number} = {}
    const userCounts: {[key: string]: number} = {}
    for(const p of ctx.db.user.roster?.active ?? []) {
      authorCounts[p] = (authorCounts[p] || 0) + 1
    }
    const authorDuplicates = Object.values(authorCounts).filter(count => count > 1).length
    const keys = await client.redis.keys("agent_selection*")
    if(!ctx.db.user.team?.name || !ctx.db.user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name")
    }
    if(!ctx.db.user.roster || ctx.db.user.roster.active.length < 5) {
      return await ctx.reply("commands.duel.team_not_completed_1")
    }
    if(authorDuplicates) {
      return await ctx.reply("commands.duel.duplicated_cards")
    }
    if(!user || !user.roster || user.roster.active.length < 5) {
      return await ctx.reply("commands.duel.team_not_completed_2")
    }
    if(!user.team?.name || !user.team.tag) {
      return await ctx.reply("commands.duel.needed_team_name_2")
    }
    if(await client.redis.get(`match:${ctx.interaction.user.id}`) || keys.some(key => key.includes(ctx.interaction.user.id))) {
      return await ctx.reply("commands.duel.already_in_match")
    }
    if(await client.redis.get(`match:${user.id}`) || keys.some(key => key.includes(user.id))) {
      return await ctx.reply("commands.already_in_match_2")
    }
    if(ctx.args.at(-1) === ctx.interaction.user.id) {
      return await ctx.reply("commands.duel.cannot_duel")
    }
    for(const p of user.roster?.active ?? []) {
      userCounts[p] = (userCounts[p] || 0) + 1
    }
    const userDuplicates = Object.values(userCounts).filter(count => count > 1).length
    if(userDuplicates) {
      return await ctx.reply("commands.duel.duplicated_cards2")
    }
    let mode: string
    if(ctx.args.length === 2) {
      mode = ctx.args.slice(0, 1).join(";")
    }
    else mode = ctx.args.slice(0, 2).join(";")
    const button = new ButtonBuilder()
    .setStyle("green")
    .setLabel(t("commands.duel.button"))
    .setCustomId(`accept;${ctx.args.at(-1)};${ctx.interaction.user.id};${mode}`)
    await ctx.reply(button.build(t("commands.duel.request", {
      author: ctx.interaction.user.mention,
      opponent: `<@${ctx.args.at(-1)}>`,
      mode: t(`commands.duel.mode.${mode}`)
    })))
  }
})