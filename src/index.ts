import "dotenv/config"
import App from "./structures/client/App.js"
import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox"
import fastify from "fastify"
import { Guild, GuildSchemaInterface, User, UserSchemaInterface } from "./database/index.js"
import { ResultsData } from "../types/index.js"
import { emojis } from "./structures/util/emojis.js"
import EmbedBuilder from "./structures/builders/EmbedBuilder.js"
import ButtonBuilder from "./structures/builders/ButtonBuilder.js"
import locales from "./locales/index.js"
import { TextChannel } from "oceanic.js"
import { readdirSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const client = new App({
  auth: "Bot " + process.env.BOT_TOKEN,
  gateway: {
    intents: ["ALL"],
    autoReconnect: true,
    maxShards: "auto"
  },
  allowedMentions: {
    everyone: false,
    users: true,
    repliedUser: true,
    roles: false
  },
  defaultImageFormat: "png",
  defaultImageSize: 2048
})

client.start()

const routes: FastifyPluginAsyncTypebox = async(fastify) => {
  fastify.post("/webhooks/results/valorant", {
    schema: {
      body: Type.Array(
        Type.Object(
          {
            id: Type.String(),
            teams: Type.Array(
              Type.Object(
                {
                  name: Type.String(),
                  score: Type.String(),
                  country: Type.String(),
                  winner: Type.Boolean()
                }
              )
            ),
            status: Type.String(),
            tournament: Type.Object(
              {
                name: Type.String(),
                image: Type.String()
              }
            ),
            stage: Type.String(),
            when: Type.Number()
          }
        )
      )
    }
  }, async(req) => {
    if(!client.ready) {
      await client.restMode(true)
    }
    const guilds = await Guild.find({
      events: { $ne: [] }
    }) as GuildSchemaInterface[]
    const users = await User.find({
      valorant_predictions: {
        $ne: []
      }
    }) as UserSchemaInterface[]
    if(!guilds.length) return
    for(const guild of guilds) {
      let data: ResultsData[]
      if(guild.valorant_events.length > 5 && !guild.key) {
        req.body
        data = req.body.filter(d => guild.valorant_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }
      else data = req.body.filter(d => guild.valorant_events.some(e => e.name === d.tournament.name))
      if(!data || !data[0]) continue
      data.reverse()
      for(const d of data) {
        for(const e of guild.valorant_events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
            const embed = new EmbedBuilder()
              .setAuthor({
                name: d.tournament.name,
                iconURL: d.tournament.image
              })
              .setField(
                `${emoji1} ${d.teams[0].name} \`${d.teams[0].score}\` <:versus:1349105624180330516> \`${d.teams[1].score}\` ${d.teams[1].name} ${emoji2}`,
                `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`,
                true
              )
              .setFooter({ text: d.stage })
            client.rest.channels.createMessage(e.channel2, embed.build({
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, "helper.stats"))
                      .setStyle("link")
                      .setURL(`https://vlr.gg/${d.id}`),
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }))
          }
        }
      }
      data.reverse()
      guild.valorant_last_result = data[0].id
      await guild.save()
    }
    if(!users.length) return
    for(const user of users) {
      for(const data of req.body) {
        const pred = user.valorant_predictions.find(p => p.match === data.id)
        if(!pred) continue
        if(pred.teams[0].score === data.teams[0].score && pred.teams[1].score === data.teams[1].score) {
          await user.add_correct_prediction("valorant", data.id)
        }
        else {
          await user.add_wrong_prediction("valorant", data.id)
        }
      }
    }
  })

  fastify.post("/webhooks/live/valorant", {
    schema: {
      body: Type.Array(
        Type.Object({
          teams: Type.Array(
            Type.Object({
              name: Type.String(),
              score: Type.String()
            })
          ),
          currentMap: Type.String(),
          score1: Type.String(),
          score2: Type.String(),
          id: Type.String(),
          url: Type.String(),
          stage: Type.String(),
          tournament: Type.Object({
            name: Type.String(),
            image: Type.String()
          })
        })
      )
    }
  }, async(req) => {
    if(!client.ready) {
      await client.restMode(true)
    }
    const guilds = await Guild.find({
      valorant_livefeed_channel: { $exists: true },
      key: { $exists: true }
    }) as GuildSchemaInterface[]
    if(!guilds.length) return
    for(const data of req.body) {
      for(const guild of guilds) {
        if(!guild.partner && !["PREMIUM"].some(x => x === guild.key?.type)) continue
        const channel = client.getChannel(guild.valorant_livefeed_channel!) as TextChannel
        if(!channel) continue
        if(!guild.valorant_events.some(e => e.name === data.tournament.name)) continue
        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.name,
            iconURL: data.tournament.image
          })
          .setTitle(locales(guild.lang, "helper.live_now"))
          .setField(
            `${emoji1} ${data.teams[0].name} \`${data.teams[0].score}\` <:versus:1349105624180330516> \`${data.teams[1].score}\` ${data.teams[1].name} ${emoji2}`,
            locales(guild.lang, "helper.live_feed_value", {
              map: data.currentMap,
              score: `${data.score1}-${data.score2}`
            })
          )
          .setFooter({ text: data.stage })
        const button = new ButtonBuilder()
          .setStyle("link")
          .setLabel(locales(guild.lang, "helper.stats"))
          .setURL(data.url)
        channel.createMessage(embed.build({
          components: [
            {
              type: 1,
              components: [button]
            }
          ]
        }))
      }
    }
  })

  fastify.post("/webhooks/news/valorant", {
    schema: {
      body: Type.Array(
        Type.Object({
          title: Type.String(),
          description: Type.Optional(Type.String()),
          url: Type.String(),
          id: Type.String()
        })
      )
    }
  }, async(req) => {
    if(!client.ready) {
      await client.restMode(true)
    }
    const guilds = await Guild.find({
      valorant_news_channel: { $exists: true },
      key: { $exists: true }
    }) as GuildSchemaInterface[]
    if(!guilds.length) return
    for(const guild of guilds) {
      if(!guild.partner && !["PREMIUM"].some(x => x === guild.key?.type)) continue
      const channel = client.getChannel(guild.valorant_news_channel!) as TextChannel
      if(!channel) continue
      for(const data of req.body) {
        const embed = new EmbedBuilder()
          .setTitle(data.title)
        if(data.description) {
          embed.setDesc(data.description)
        }
        const button = new ButtonBuilder()
          .setStyle("link")
          .setLabel(locales(guild.lang, "helper.source"))
          .setURL(data.url)
        channel.createMessage(embed.build({
          components: [
            {
              type: 1,
              components: [button]
            }
          ]
        }))
      }
    }
  })

  fastify.post("/webhooks/live/lol", {
    schema: {
      body: Type.Array(
        Type.Object({
          id: Type.String(),
          tournament: Type.Object({
            name: Type.String(),
            full_name: Type.String(),
            image: Type.String()
          }),
          teams: Type.Union([
            Type.Array(
              Type.Object({
                name: Type.String(),
                score: Type.String()
              })
            ),
            Type.Array(Type.Never())
          ]),
          stage: Type.Optional(Type.String()),
          streams: Type.Array(
            Type.Object({
              main: Type.Boolean(),
              language: Type.String(),
              embed_url: Type.String(),
              official: Type.Boolean(),
              raw_url: Type.String()
            })
          )
        })
      )
    }
  }, async(req) => {
    if(!client.ready) {
      await client.restMode(true)
    }
    const guilds = await Guild.find({
      lol_livefeed_channel: { $exists: true }
    }) as GuildSchemaInterface[]

    if(!guilds.length) return

    for(const data of req.body) {
      for(const guild of guilds) {
        if(!guild.partner && !["PREMIUM"].some(x => x === guild.key?.type)) continue
        const channel = client.getChannel(guild.lol_livefeed_channel!) as TextChannel
        if(!channel) continue
        if(!guild.lol_events.some(e => e.name === data.tournament.name)) continue
        const emoji1 = emojis.find(e => e?.name === data.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
        const emoji2 = emojis.find(e => e?.name === data.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === data.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.tournament.full_name,
            iconURL: data.tournament.image
          })
          .setTitle(locales(guild.lang, "helper.live_now"))
          .setField(
            `${emoji1} ${data.teams[0].name} \`${data.teams[0].score}\` <:versus:1349105624180330516> \`${data.teams[1].score}\` ${data.teams[1].name} ${emoji2}`,
            ""
          )
        if(data.stage) embed.setFooter({ text: data.stage })

        const button = new ButtonBuilder()
          .setStyle("blue")
          .setLabel(locales(guild.lang, "helper.streams"))
          .setCustomId(`stream;lol;${data.id}`)

        await channel.createMessage(embed.build(button.build()))
      }
    }
  })

  fastify.post("/webhooks/results/lol", {
    schema: {
      body: Type.Array(
        Type.Object({
          id: Type.String(),
          teams: Type.Array(
            Type.Object({
              name: Type.String(),
              score: Type.String()
            })
          ),
          tournament: Type.Object({
            name: Type.String(),
            full_name: Type.String(),
            image: Type.String()
          }),
          stage: Type.String(),
          when: Type.Number()
        })
      )
    }
  }, async(req) => {
    if(!client.ready) {
      await client.restMode(true)
    }
    const guilds = await Guild.find({
      events: { $ne: [] }
    }) as GuildSchemaInterface[]
    const users = await User.find({
      lol_predictions: {
        $ne: []
      }
    }) as UserSchemaInterface[]
    if(!guilds.length) return
    for(const guild of guilds) {
      let data: ResultsData[]
      if(guild.lol_events.length > 5 && !guild.key) {
        req.body
        data = req.body.filter(d => guild.lol_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
      }
      else data = req.body.filter(d => guild.lol_events.some(e => e.name === d.tournament.name))
      if(!data || !data[0]) continue
      data.reverse()
      for(const d of data) {
        if(d.teams[0].score === "0" && d.teams[1].score === "0") continue
        for(const e of guild.lol_events) {
          if(e.name === d.tournament.name) {
            const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
            const embed = new EmbedBuilder()
              .setAuthor({
                name: d.tournament.full_name!,
                iconURL: d.tournament.image
              })
              .setField(
                `${emoji1} ${d.teams[0].name} \`${d.teams[0].score}\` <:versus:1349105624180330516> \`${d.teams[1].score}\` ${d.teams[1].name} ${emoji2}`,
                `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`,
                true
              )
              .setFooter({ text: d.stage })
            client.rest.channels.createMessage(e.channel2, embed.build({
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                      .setLabel(locales(guild.lang, "helper.pickem.label"))
                      .setStyle("blue")
                      .setCustomId("pickem")
                  ]
                }
              ]
            }))
          }
        }
      }
      data.reverse()
      guild.lol_last_result = data[0].id
      await guild.save()
    }
    if(!users.length) return
    for(const user of users) {
      for(const data of req.body) {
        const pred = user.lol_predictions.find(p => p.match === data.id)
        if(!pred) continue
        if(pred.teams[0].score === data.teams[0].score && pred.teams[1].score === data.teams[1].score) {
          await user.add_correct_prediction("lol", data.id)
        }
        else {
          await user.add_wrong_prediction("lol", data.id)
        }
      }
    }
  })

    const commands: any[] = []

    for(const file of readdirSync(path.resolve(__dirname,"./commands"))) {
      const command = (await import(`./commands/${file}`)).default.default ?? (await import(`./commands/${file}`)).default
      
      commands.push({
        name: command.name,
        nameLocalizations: command.nameLocalizations,
        description: command.description,
        descriptionLocalizations: command.descriptionLocalizations,
        syntax: command.syntax,
        syntaxes: command.syntaxes,
        examples: command.examples,
        permissions: command.permissions,
        botPermissions: command.botPermissions
      })
    }

  fastify.get("/commands", async() => {
    return commands
  })
}
const server = fastify()
server.register(routes)
server.listen({ host: "0.0.0.0", port: process.env.PORT ?? 3001 })