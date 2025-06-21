import locales, { Args } from "../locales/index.js"
import { Blacklist, BlacklistSchemaInterface, Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../database/index.js"
import Service from "../api/index.js"
import createListener from "../structures/client/createListener.js"
import CommandRunner from "../structures/command/CommandRunner.js"
import Logger from "../structures/util/Logger.js"
import CommandContext from "../structures/command/CommandContext.js"
import calcOdd from "../structures/util/calcOdd.js"

const service = new Service(process.env.AUTH)

export default createListener({
  name: "interactionCreate",
  async run(client, i) {
    if(i.isCommandInteraction()) {
      new CommandRunner().run(client, i).catch(e => new Logger(client).error(e))
    }
    else if(i.isAutocompleteInteraction()) {
      const command = client.commands.get(i.data.name)
      if(!command) return
      if(!command.createAutocompleteInteraction) return
      const user = await User.findById(i.user.id) as UserSchemaInterface
      const guild = (await Guild.findById(i.guildID) ?? new Guild({ _id: i.guildID })) as GuildSchemaInterface
      const locale = (content: string, args?: Args) => {
        return locales(user.lang ?? guild.lang, content, args)
      }
      let args: string[] = i.data.options.getSubCommand() ?? []
      for(const option of i.data.options.getOptions()) {
        args.push(option.value.toString())
      }
      command.createAutocompleteInteraction({ i, locale, client, args })
        .catch(e => new Logger(client).error(e))
    }
    else if(i.isComponentInteraction()) {
      if(i.data.customID === "pickem") {
        const guild = (await Guild.findById(i.guildID) ?? new Guild({ _id: i.guildID })) as GuildSchemaInterface
        const user = (await User.findById(i.member!.id) || new User({ _id: i.member!.id })) as UserSchemaInterface
        await i.createMessage({
          content: locales(user.lang ?? guild.lang, "helper.pickem.res"),
          flags: 64
        })
        return
      }
      const args = i.data.customID.split(";")
      if(args[0] === "predict") {
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface
        const user = (await User.findById(i.user.id) || new User({ _id: i.user.id })) as UserSchemaInterface
        const games = {
          valorant: async() => {
            if(user.valorant_predictions.find(p => p.match === args[2])) {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.replied"),
                flags: 64
              })
            }
            const res = await service.getMatches("valorant")
            const data = res.find(d => d.id === args[2])
            if(data?.status === "LIVE" || !data) {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.started"),
                flags: 64
              })
            }
            await i.createModal({
              customID: `prediction;valorant;${args[2]}`,
              title: locales(user.lang ?? guild.lang, "helper.prediction_modal.title"),
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      customID: "response-modal-1",
                      label: data.teams[0].name,
                      style: 1,
                      minLength: 1,
                      maxLength: 2,
                      required: true,
                      placeholder: "0"
                    },
                  ]
                },
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      customID: "response-modal-2",
                      label: data.teams[1].name,
                      style: 1,
                      minLength: 1,
                      maxLength: 2,
                      required: true,
                      placeholder: "0"
                    }
                  ]
                }
              ]
            })
          },
          lol: async() => {
            if(user.lol_predictions.find(p => p.match.toString() === args[2])) {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.replied"),
                flags: 64
              })
            }
            const res = await service.getMatches("lol")
            const data = res.find(d => d.id?.toString() === args[2])

            if(!data || data.status !== "not_started") {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.started"),
                flags: 64
              })
            }
            await i.createModal({
              customID: `prediction;lol;${args[2]}`,
              title: locales(user.lang ?? guild.lang, "helper.prediction_modal.title"),
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      customID: "response-modal-1",
                      label: data.teams[0].name,
                      style: 1,
                      minLength: 1,
                      maxLength: 2,
                      required: true,
                      placeholder: "0"
                    },
                  ]
                },
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      customID: "response-modal-2",
                      label: data.teams[1].name,
                      style: 1,
                      minLength: 1,
                      maxLength: 2,
                      required: true,
                      placeholder: "0"
                    }
                  ]
                }
              ]
            })
          }
        }
        games[args[1] as "valorant" | "lol"]().catch(e => new Logger(client).error(e))
        return
      }
      if(args[0] === "stream") {
        const res = await service.getLiveMatches()
        const match = res.filter(r => r.id.toString() === args[2])[0]

        if(!match || !match.streams) return console.log(res)

        let content = ""
        for(const stream of match.streams) {
          content += `- ${stream.raw_url}\n`
        }

        await i.createMessage({
          content,
          flags: 64
        })

        return
      }
      if(args[0] === "bet") {
        const user = await User.findById(i.user.id) as UserSchemaInterface | null
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface
        if(!user || user.coins < 500) return await i.createMessage({
          content: locales(user?.lang ?? guild.lang, "helper.coins_needed"),
          flags: 64
        })
        const options = {
          valorant: async() => {
            const matches = await service.getMatches("valorant")
            const data = matches.find(m => m.id === args[2])
            let index = user.valorant_predictions.findIndex(p => p.match === args[2])
            if(!data || data.status === "LIVE") {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.started"),
                flags: 64
              })
            }
            if(index === -1) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.prediction_needed"),
              flags: 64
            })
            await i.createModal({
              customID: `betting;valorant;${args[2]}`,
              title: locales(
                user.lang ?? guild.lang, "helper.bet_modal.title",
                { 
                  teams: `${user.valorant_predictions[index].teams[0].name} vs ${user.valorant_predictions[index].teams[1].name}`
                }
              ),
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      customID: "response-1",
                      label: locales(user.lang ?? guild.lang, "helper.bet_modal.label"),
                      style: 1,
                      minLength: 3,
                      required: true,
                      placeholder: "Ex.: " + (Math.floor(Math.random() * (1000 - 500 + 1)) + 500).toString()
                    }
                  ]
                }
              ]
            })
          },
          lol: async() => {
            const matches = await service.getMatches("lol")
            const data = matches.find(m => m.id === args[2])
            let index = user.lol_predictions.findIndex(p => p.match === args[2])
            if(!data || data.status === "LIVE") {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.started"),
                flags: 64
              })
            }
            if(index === -1) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.prediction_needed"),
              flags: 64
            })
            await i.createModal({
              customID: `betting;valorant;${args[2]}`,
              title: locales(
                user.lang ?? guild.lang, "helper.bet_modal.title",
                { 
                  teams: `${user.lol_predictions[index].teams[0].name} vs ${user.lol_predictions[index].teams[1].name}`
                }
              ),
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      customID: "response-1",
                      label: locales(user.lang ?? guild.lang, "helper.bet_modal.label"),
                      style: 1,
                      minLength: 3,
                      required: true,
                      placeholder: "Ex.: " + (Math.floor(Math.random() * (1000 - 500 + 1)) + 500).toString()
                    }
                  ]
                }
              ]
            })
          }
        }
        await options[args[1] as keyof typeof options]()
      }
      const command = client.commands.get(args[0])
      const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface
      if(blacklist.users.find(user => user.id === i.user.id)) return
      if(!command) return
      if(!command.createInteraction) return
      if(!i.guild) return
      if(args[1] !== i.user.id) return
      const guild = (await Guild.findById(i.guildID) ?? new Guild({ _id: i.guildID })) as GuildSchemaInterface
      const user = (await User.findById(i.user.id) ?? new User({ _id: i.user.id })) as UserSchemaInterface
      const ctx = new CommandContext({
        args,
        client,
        guild: i.guild,
        interaction: i,
        locale: user?.lang ?? guild.lang,
        db: {
          user,
          guild
        }
      })
      const locale = (content: string, args?: Args) => {
        return locales(user.lang ?? guild.lang, content, args)
      }
      await command.createInteraction({ client, ctx, locale, i })
    }
    else if(i.isModalSubmitInteraction()) {
      const args = i.data.customID.split(";")
      if(args[0] === "prediction") {
        const user = (await User.findById(i.user.id) || new User({ _id: i.user.id })) as UserSchemaInterface
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface
        const games = {
          valorant: async() => {
            if(user.valorant_predictions.find(p => p.match === args[2])) {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.replied"),
                flags: 64
              })
            }
            const res = await service.getMatches("valorant")
            const data = res.find(d => d.id === args[2])!
            const components = i.data.components.getComponents()
            const winnerScore = Math.max(
              Number(components[0].value),
              Number(components[1].value)
            )
            await user.addPrediction("valorant", {
              match: data.id!,
              teams: [
                {
                  name: data.teams[0].name,
                  score: components[0].value,
                  winner: Number(components[0].value) !== winnerScore ? false : true
                },
                {
                  name: data.teams[1].name,
                  score: components[1].value,
                  winner: Number(components[1].value) !== winnerScore ? false : true
                }
              ],
              status: "pending"
            })
            await i.createMessage({
              content: locales(user.lang ?? guild?.lang!, "helper.palpitate_response", {
                t1: data.teams[0].name,
                t2: data.teams[1].name,
                s1: i.data.components.getComponents()[0].value,
                s2: i.data.components.getComponents()[1].value
              }),
              flags: 64
            })
          },
          lol: async() => {
            if(user.lol_predictions.find(p => p.match.toString() === args[2])) {
              return await i.createMessage({
                content: locales(user.lang ?? guild.lang, "helper.replied"),
                flags: 64
              })
            }
            const res = await service.getMatches("lol")
            const data = res.find(d => d.id?.toString() === args[2])!
            const components = i.data.components.getComponents()
            const winnerScore = Math.max(
              Number(components[0].value),
              Number(components[1].value)
            )
            await user.addPrediction("lol", {
              match: data.id!,
              teams: [
                {
                  name: data.teams[0].name,
                  score: components[0].value,
                  winner: Number(components[0].value) !== winnerScore ? false : true
                },
                {
                  name: data.teams[1].name,
                  score: components[1].value,
                  winner: Number(components[1].value) !== winnerScore ? false : true
                }
              ],
              status: "pending"
            })
            await i.createMessage({
              content: locales(user.lang ?? guild.lang!, "helper.palpitate_response", {
                t1: data.teams[0].name,
                t2: data.teams[1].name,
                s1: i.data.components.getComponents()[0].value,
                s2: i.data.components.getComponents()[1].value
              }),
              flags: 64
            })
          }
        }
        await games[args[1] as "valorant" | "lol"]().catch(e => new Logger(client).error(e))
      }
      else if(args[0] === "betting") {
        const user = await User.findById(i.user.id) as UserSchemaInterface
        const guild = await Guild.findById(i.guildID) as GuildSchemaInterface
        const users = await User.find({
          valorant_predictions: {
            $ne: []
          }
        }) as UserSchemaInterface[]
        const games = {
          valorant: async() => {
            const value = BigInt(i.data.components.getComponents()[0].value)
            if(isNaN(Number(value))) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.invalid_coins"),
              flags: 64
            })
            if(value < 500) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.min_value"),
              flags: 64
            })
            if(value > user.coins) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.too_much"),
              flags: 64
            })
            let oddA = 0
            let oddB = 0
            for(const u of users) {
              let index = u.valorant_predictions.findIndex(p => p.match === args[2])
              if(!u.valorant_predictions[index]) continue
              if(u.valorant_predictions[index].teams[0].winner && u.valorant_predictions[index].bet) {
                oddA += 1
              }
              else if(u.valorant_predictions[index].teams[1].winner && u.valorant_predictions[index].bet) {
                oddB += 1
              }
            }
            let index = user.valorant_predictions.findIndex(p => p.match === args[2])
            let odd: number
            if(user.valorant_predictions[index].teams[0].winner) {
              odd = calcOdd(oddA)
            }
            else {
              odd = calcOdd(oddB)
            }
            user.valorant_predictions[index].bet = value + BigInt(user.valorant_predictions[index].bet ?? 0)
            await user.updateOne({
              $set: { valorant_predictions: user.valorant_predictions },
              $inc: { coins: -value }
            })
            let winnerIndex = user.valorant_predictions[index].teams.findIndex(t => t.winner)
            await i.createMessage({
              content: locales(
                user.lang ?? guild.lang,
                "helper.bet_res",
                {
                  team: user.valorant_predictions[index].teams[winnerIndex].name,
                  coins: value.toLocaleString("en-US"),
                  odd
                }
              ),
              flags: 64
            })
          },
          lol: async() => {
            const value = BigInt(i.data.components.getComponents()[0].value)
            if(isNaN(Number(value))) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.invalid_coins"),
              flags: 64
            })
            if(value < 500) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.min_value")
            })
            if(value > user.coins) return await i.createMessage({
              content: locales(user.lang ?? guild.lang, "helper.too_much"),
              flags: 64
            })
            let oddA = 0
            let oddB = 0
            for(const u of users) {
              let index = u.lol_predictions.findIndex(p => p.match === args[2])
              if(!u.lol_predictions[index]) continue
              if(u.lol_predictions[index].teams[0].winner) {
                oddA += 1
              }
              else {
                oddB += 1
              }
            }
            let index = user.lol_predictions.findIndex(p => p.match === args[2])
            let odd: number
            if(user.lol_predictions[index].teams[0].winner) {
              odd = calcOdd(oddA)
            }
            else {
              odd = calcOdd(oddB)
            }
            user.lol_predictions[index].bet = value + BigInt(user.lol_predictions[index].bet ?? 0)
            await user.updateOne({
              $set: { lol_predictions: user.lol_predictions },
              $inc: { coins: -value }
            })
            let winnerIndex = user.lol_predictions.map(p => p.teams.findIndex(t => t.winner)).join()
            await i.createMessage({
              content: locales(
                user.lang ?? guild.lang,
                "helper.bet_res",
                {
                  team: user.lol_predictions[index].teams[Number(winnerIndex)].name,
                  coins: value.toLocaleString("en-US"),
                  odd
                }
              ),
              flags: 64
            })
          }
        }
        await games[args[1] as keyof typeof games]()
      }
      else {
        const command = client.commands.get(args[0])
        if(!command) return
        if(!command.createModalSubmitInteraction) return
        if(!i.guild) return
        const user = await User.findById(i.user.id) as UserSchemaInterface
        const guild = (await Guild.findById(i.guildID) ?? new Guild({ _id: i.guildID })) as GuildSchemaInterface
        const locale = (content: string, args?: Args) => {
          return locales(user.lang ?? guild.lang, content, args)
        }
        const ctx = new CommandContext({
          args,
          client,
          guild: i.guild,
          interaction: i,
          locale: user.lang ?? guild.lang,
          db: {
            user,
            guild
          }
        })
        await command.createModalSubmitInteraction({ ctx, client, locale, i })
      }
    }
  }
})