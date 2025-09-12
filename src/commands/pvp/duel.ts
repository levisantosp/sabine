import { ApplicationCommandOptionTypes } from "oceanic.js"
import createCommand from "../../structures/command/createCommand.ts"
import ButtonBuilder from "../../structures/builders/ButtonBuilder.ts"
import { SabineUser } from "../../database/index.ts"
import { valorant_maps } from "../../config.ts"

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
    },
    {
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
      name: "tournament",
      nameLocalizations: {
        "pt-BR": "torneio"
      },
      description: "Start a tournament duel",
      descriptionLocalizations: {
        "pt-BR": "Inicia um confronto em torneio"
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
        },
        {
          type: ApplicationCommandOptionTypes.STRING,
          name: "map",
          nameLocalizations: {
            "pt-BR": "mapa"
          },
          description: "Select the map",
          descriptionLocalizations: {
            "pt-BR": "Selecione o mapa"
          },
          choices: valorant_maps.filter(m => m.current_map_pool).map(m => ({
            name: m.name,
            value: m.name
          })),
          required: true
        }
      ]
    }
  ],
  async run({ ctx, t, client }) {
    let id: string
    if(ctx.args.length === 2) {
      id = ctx.args[1].toString()
    }
    else if(ctx.args.length === 3 && ctx.args[0] === "tournament") {
      id = ctx.args[1].toString()
    }
    else id = ctx.args[2].toString()
    const user = await SabineUser.fetch(id)
    const authorCounts: {[key: string]: number} = {}
    const userCounts: {[key: string]: number} = {}
    for(const p of ctx.db.user.roster.active ?? []) {
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
      return await ctx.reply("commands.duel.already_in_match_2")
    }
    if(ctx.args.at(-1) === ctx.interaction.user.id) {
      return await ctx.reply("commands.duel.cannot_duel")
    }
    for(const p of user.roster.active ?? []) {
      userCounts[p] = (userCounts[p] || 0) + 1
    }
    const userDuplicates = Object.values(userCounts).filter(count => count > 1).length
    if(userDuplicates) {
      return await ctx.reply("commands.duel.duplicated_cards2")
    }
    let mode: string
    let map = ""
    if(ctx.args.length === 2) {
      mode = ctx.args.slice(0, 1).join(";")
      id = ctx.args[1].toString()
    }
    else if(ctx.args.length === 3 && ctx.args[0] === "tournament") {
      mode = ctx.args.slice(0, 1).join(";")
      id = ctx.args[1].toString()
      map = `;${ctx.args[2].toString()}`
    }
    else {
      mode = ctx.args.slice(0, 2).join(";")
      id = ctx.args[2].toString()
    }
    const button = new ButtonBuilder()
    .setStyle("green")
    .setLabel(t("commands.duel.button"))
    .setCustomId(`accept;${id};${ctx.interaction.user.id};${mode}${map}`)
    await ctx.reply(button.build(t("commands.duel.request", {
      author: ctx.interaction.user.mention,
      opponent: `<@${id}>`,
      mode: t(`commands.duel.mode.${mode}`)
    })))
  }
})