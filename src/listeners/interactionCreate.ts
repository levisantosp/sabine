import locales, { Args } from "../locales/index.js"
import { Blacklist, BlacklistSchemaInterface, Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../database/index.js"
import Service from "../api/index.js"
import createListener from "../structures/client/createListener.js"
import CommandRunner from "../structures/command/CommandRunner.js"
import Logger from "../structures/util/Logger.js"
import CommandContext from "../structures/command/CommandContext.js"
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
                        for (const option of i.data.options.getOptions()) {
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
                                        valorant: async () => {
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
                                        lol: async () => {
                                                if(user.lol_predictions.find(p => p.match === args[2])) {
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
                        command.createInteraction({ client, ctx, locale })
                                .catch(e => new Logger(client).error(e))
                }
                else if(i.isModalSubmitInteraction()) {
                        const args = i.data.customID.split(";")
                        if(args[0] === "prediction") {
                                const user = (await User.findById(i.user.id) || new User({ _id: i.user.id })) as UserSchemaInterface
                                const guild = await Guild.findById(i.guildID) as GuildSchemaInterface
                                const games = {
                                        valorant: async () => {
                                                if(user.valorant_predictions.find(p => p.match === args[2])) {
                                                        return await i.createMessage({
                                                                content: locales(user.lang ?? guild.lang, "helper.replied"),
                                                                flags: 64
                                                        })
                                                }
                                                const res = await service.getMatches("valorant")
                                                const data = res.find(d => d.id === args[2])!
                                                await user.add_prediction("valorant", {
                                                        match: data.id!,
                                                        teams: [
                                                                {
                                                                        name: data.teams[0].name,
                                                                        score: i.data.components.getComponents()[0].value
                                                                },
                                                                {
                                                                        name: data.teams[1].name,
                                                                        score: i.data.components.getComponents()[1].value
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
                                        lol: async () => {
                                                if(user.lol_predictions.find(p => p.match === args[2])) {
                                                        return await i.createMessage({
                                                                content: locales(user.lang ?? guild.lang, "helper.replied"),
                                                                flags: 64
                                                        })
                                                }
                                                const res = await service.getMatches("lol")
                                                const data = res.find(d => d.id === args[2])!
                                                await user.add_prediction("lol", {
                                                        match: data.id!,
                                                        teams: [
                                                                {
                                                                        name: data.teams[0].name,
                                                                        score: i.data.components.getComponents()[0].value
                                                                },
                                                                {
                                                                        name: data.teams[1].name,
                                                                        score: i.data.components.getComponents()[1].value
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
                                games[args[1] as "valorant" | "lol"]().catch(e => new Logger(client).error(e))
                        }
                }
        }
})