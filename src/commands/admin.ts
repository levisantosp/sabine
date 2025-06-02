import { CommandInteraction, ComponentInteraction } from "oceanic.js"
import { MatchesData } from "../../types/index.js"
import Service from "../api/index.js"
import { Guild, GuildSchemaInterface } from "../database/index.js"
import locales from "../locales/index.js"
import createCommand from "../structures/command/createCommand.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"
import { emojis } from "../structures/util/emojis.js"
const service = new Service(process.env.AUTH)

export default createCommand({
	name: "admin",
	description: "See the dashboard and change the bot language",
	descriptionLocalizations: {
		"pt-BR": "Veja o painel de controle e mude o idioma do bot"
	},
	options: [
		{
			type: 1,
			name: "dashboard",
			nameLocalizations: {
				"pt-BR": "painel"
			},
			description: "Shows the dashboard",
			descriptionLocalizations: {
				"pt-BR": "Mostra o painel de controle"
			}
		},
		{
			type: 1,
			name: "language",
			nameLocalizations: {
				"pt-BR": "idioma"
			},
			description: "Change the languague that I interact on this server",
			descriptionLocalizations: {
				"pt-BR": "Altera o idioma que eu interajo neste servidor"
			},
			options: [
				{
					type: 3,
					name: "lang",
					description: "Choose the language",
					descriptionLocalizations: {
						"pt-BR": "Escolha o idioma"
					},
					choices: [
						{
							name: "pt-BR",
							value: "pt"
						},
						{
							name: "en-US",
							value: "en"
						}
					],
					required: true
				}
			]
		},
		{
			type: 1,
			name: "premium",
			description: "Shows information about server premium",
			descriptionLocalizations: {
				"pt-BR": "Mostra informações sobre o premium do servidor"
			}
		}
	],
	permissions: ["MANAGE_GUILD", "MANAGE_CHANNELS"],
	botPermissions: ["MANAGE_MESSAGES", "EMBED_LINKS", "SEND_MESSAGES"],
	syntaxes: [
		"admin dashboard",
		"adming language [lang]",
	],
	examples: [
		"admin dashboard",
		"admin language pt-BR",
		"admin language en-US"
	],
	async run({ ctx, locale, id }) {
		if (ctx.args[0] === "dashboard") {
			const embed = new EmbedBuilder()
				.setTitle(locale("commands.admin.dashboard"))
				.setDesc(locale("commands.admin.desc", {
					lang: ctx.db.guild.lang.replace("en", "English").replace("pt", "Português"),
					limit: ctx.db.guild.tournamentsLength === Infinity ? "`Infinity`" : `${ctx.db.guild.lol_events.length + ctx.db.guild.valorant_events.length}/${ctx.db.guild.tournamentsLength}`,
					id,
					vlr_news: !ctx.db.guild.valorant_news_channel ? "`undefined`" : `<#${ctx.db.guild.valorant_news_channel}>`,
					vlr_live: !ctx.db.guild.valorant_livefeed_channel ? "`undefined`" : `<#${ctx.db.guild.valorant_livefeed_channel}>`,
					lol_news: !ctx.db.guild.lol_news_channel ? "`undefined`" : `<#${ctx.db.guild.lol_news_channel}>`,
					lol_live: !ctx.db.guild.lol_livefeed_channel ? "`undefined`" : `<#${ctx.db.guild.lol_livefeed_channel}>`,
				}))
			ctx.reply(embed.build({
				components: [
					{
						type: 1,
						components: [
							new ButtonBuilder()
								.setStyle("blue")
								.setLabel(locale("commands.admin.vlr_esports_coverage"))
								.setCustomId(`admin;${ctx.interaction.user.id};vlr`),
							new ButtonBuilder()
								.setStyle("blue")
								.setLabel(locale("commands.admin.lol_esports_coverage"))
								.setCustomId(`admin;${ctx.interaction.user.id};lol`)
						]
					},
					{
						type: 1,
						components: [
							new ButtonBuilder()
								.setLabel(locale("commands.admin.resend", { game: "VALORANT" }))
								.setStyle("red")
								.setCustomId(`admin;${ctx.interaction.user.id};resend;vlr`),
							new ButtonBuilder()
								.setLabel(locale("commands.admin.resend", { game: "League of Legends" }))
								.setStyle("red")
								.setCustomId(`admin;${ctx.interaction.user.id};resend;lol`)
						]
					}
				]
			}))
		}
		else if (ctx.args[0] === "language") {
			const options = {
				en: async () => {
					ctx.db.guild.lang = "en"
					await ctx.db.guild.save()
					ctx.reply("Now I will interact in English on this server!")
				},
				pt: async () => {
					ctx.db.guild.lang = "pt"
					await ctx.db.guild.save()
					ctx.reply("Agora eu irei interagir em português neste servidor!")
				}
			}
			options[(ctx.interaction as CommandInteraction).data.options.getStringOption("lang")?.value as "pt" | "en"]()
		}
		else if (ctx.args[0] === "premium") {
			if (!ctx.db.guild.key) {
				ctx.reply("commands.admin.no_premium")
				return
			}
			const embed = new EmbedBuilder()
				.setTitle("Premium")
				.setDesc(locale("commands.admin.premium", {
					key: ctx.db.guild.key.type,
					expiresAt: `<t:${(ctx.db.guild.key.expiresAt! / 1000).toFixed(0)}:R>`
				}))
			ctx.reply(embed.build())
		}
	},
	async createInteraction({ ctx, locale, client }) {
		if (ctx.args[2] === "vlr") {
			await ctx.interaction.defer(64)
			const embed = new EmbedBuilder()
				.setDesc(locale("commands.admin.tournaments", { game: "VALORANT" }))
			for (const event of ctx.db.guild.valorant_events) {
				embed.addField(event.name, locale("commands.admin.event_channels", {
					ch1: `<#${event.channel1}>`,
					ch2: `<#${event.channel2}>`
				}), true)
			}
			ctx.reply(embed.build())
		}
		else if (ctx.args[2] === "lol") {
			await ctx.interaction.defer(64)
			const embed = new EmbedBuilder()
				.setDesc(locale("commands.admin.tournaments", { game: "League of Legends" }))
			for (const event of ctx.db.guild.lol_events) {
				embed.addField(event.name, locale("commands.admin.event_channels", {
					ch1: `<#${event.channel1}>`,
					ch2: `<#${event.channel2}>`
				}), true)
			}
			ctx.reply(embed.build())
		}
		else if (ctx.args[2] === "resend" && ctx.args[3] === "vlr") {
			await ctx.interaction.defer(64)
			const guild = await Guild.findById(ctx.interaction.guild!.id) as GuildSchemaInterface
			if (guild.valorant_resend_time > Date.now()) {
				ctx.reply("commands.admin.resend_time", { t: `<t:${(guild.valorant_resend_time / 1000).toFixed(0)}:R>` })
				return
			}
			const button = new ButtonBuilder()
				.setLabel(locale("commands.admin.continue"))
				.setStyle("red")
				.setCustomId(`admin;${ctx.interaction.user.id};continue;vlr`)
			ctx.reply(button.build(locale("commands.admin.confirm")))
		}
		else if (ctx.args[2] === "resend" && ctx.args[3] === "lol") {
			await ctx.interaction.defer(64)
			const guild = await Guild.findById(ctx.interaction.guild!.id) as GuildSchemaInterface
			if (guild.lol_resend_time > Date.now()) {
				ctx.reply("commands.admin.resend_time", { t: `<t:${(guild.lol_resend_time / 1000).toFixed(0)}:R>` })
				return
			}
			const button = new ButtonBuilder()
				.setLabel(locale("commands.admin.continue"))
				.setStyle("red")
				.setCustomId(`admin;${ctx.interaction.user.id};continue;lol`)
			ctx.reply(button.build(locale("commands.admin.confirm")))
		}
		else if (ctx.args[2] === "continue" && ctx.args[3] === "vlr") {
			await (ctx.interaction as ComponentInteraction).deferUpdate()
			const guild = (await Guild.findById(ctx.interaction.guildID!))!
			if (guild.valorant_resend_time > Date.now()) {
				ctx.edit("commands.admin.resend_time", { t: `<t:${(guild.valorant_resend_time / 1000).toFixed(0)}:R>` })
				return
			}
			guild.valorant_matches = []
			guild.valorant_tbd_matches = []
			guild.valorant_resend_time = Date.now() + 3600000
			await ctx.edit("commands.admin.resending")
			const res = await service.getMatches("valorant")
			if (!res || !res.length) return
			const res2 = await service.getResults("valorant")
			if (guild.valorant_matches.length && !res2.some(d => d.id === guild.valorant_matches[guild.valorant_matches.length - 1])) return
			guild.valorant_matches = []
			let data: MatchesData[]
			if (guild.valorant_events.length > 5 && !guild.key) {
				data = res.filter(d => guild.valorant_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
			}
			else data = res.filter(d => guild.valorant_events.some(e => e.name === d.tournament.name))
			for (const e of guild.valorant_events) {
				if (!client.getChannel(e.channel1)) continue
				try {
					let messages = await client.rest.channels.getMessages(e.channel1, { limit: 100 })
					let messagesIds = messages.filter(m => m.author.id === client.user.id).map(m => m.id)
					if (messagesIds.length) {
						client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
					}
				}
				catch { }
			}
			try {
				for (const d of data) {
					if (new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
					for (const e of guild.valorant_events) {
						if (e.name === d.tournament.name) {
							const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
							const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[0]?.emoji
							let index = guild.valorant_matches.findIndex((m) => m === d.id)
							if (index > -1) guild.valorant_matches.splice(index, 1)
							guild.valorant_matches.push(d.id!)

							const embed = new EmbedBuilder()
								.setAuthor({
									iconURL: d.tournament.image,
									name: d.tournament.name
								})
								.setField(`${emoji1} **${d.teams[0].name}** <:versus:1349105624180330516> **${d.teams[1].name}** ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
								.setFooter({
									text: d.stage
								})

							const button = new ButtonBuilder()
								.setLabel(locale("helper.palpitate"))
								.setCustomId(`predict;valorant;${d.id}`)
								.setStyle("green")

							const urlButton = new ButtonBuilder()
								.setLabel(locale("helper.stats"))
								.setStyle("link")
								.setURL(`https://vlr.gg/${d.id}`)

							if (d.stage.toLowerCase().includes("showmatch")) continue
							if (d.teams[0].name !== "TBD" && d.teams[1].name !== "TBD") await client.rest.channels.createMessage(e.channel1, {
								embeds: [embed],
								components: [
									{
										type: 1,
										components: [
											button, urlButton,
											new ButtonBuilder()
												.setLabel(locales(guild.lang, "helper.pickem.label"))
												.setStyle("blue")
												.setCustomId("pickem")
										]
									}
								]
							}).catch(() => { })
							else {
								guild.valorant_tbd_matches.push({
									id: d.id!,
									channel: e.channel1
								})
							}
						}
					}
				}
			}
			catch { }
			await guild.save()
			ctx.edit("commands.admin.resent")
		}
		else if (ctx.args[2] === "continue" && ctx.args[3] === "lol") {
			await (ctx.interaction as ComponentInteraction).deferUpdate()
			const guild = (await Guild.findById(ctx.interaction.guildID!))!
			if (guild.lol_resend_time > Date.now()) {
				ctx.edit("commands.admin.resend_time", { t: `<t:${(guild.lol_resend_time / 1000).toFixed(0)}:R>` })
				return
			}
			guild.lol_matches = []
			guild.lol_tbd_matches = []
			guild.lol_resend_time = Date.now() + 3600000
			await ctx.edit("commands.admin.resending")
			const res = await service.getMatches("lol")
			if (!res || !res.length) return
			const res2 = await service.getResults("lol")
			if (guild.lol_matches.length && !res2.some(d => d.id === guild.lol_matches[guild.lol_matches.length - 1])) return
			let data: MatchesData[]
			if (guild.lol_events.length > 5 && !guild.key) {
				data = res.filter(d => guild.lol_events.reverse().slice(0, 5).some(e => e.name === d.tournament.name))
			}
			else data = res.filter(d => guild.lol_events.some(e => e.name === d.tournament.name))
			for (const e of guild.lol_events) {
				if (!client.getChannel(e.channel1)) continue
				try {
					let messages = await client.rest.channels.getMessages(e.channel1, { limit: 100 })
					let messagesIds = messages.filter(m => m.author.id === client.user.id).map(m => m.id)
					if (messagesIds.length) {
						client.rest.channels.deleteMessages(e.channel1, messagesIds).catch(() => { })
					}
				}
				catch { }
			}
			try {
				for (const d of data) {
					if (new Date(d.when).getDate() !== new Date(data[0].when).getDate()) continue
					for (const e of guild.lol_events) {
						if (e.name === d.tournament.name) {
							const emoji1 = emojis.find(e => e?.name === d.teams[0].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[0].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
							const emoji2 = emojis.find(e => e?.name === d.teams[1].name.toLowerCase() || e?.aliases?.find(alias => alias === d.teams[1].name.toLowerCase()))?.emoji ?? emojis[1]?.emoji
							let index = guild.lol_matches.findIndex((m) => m === d.id)
							if (index > -1) guild.lol_matches.splice(index, 1)
							guild.lol_matches.push(d.id!)

							const embed = new EmbedBuilder()
								.setAuthor({
									iconURL: d.tournament.image,
									name: d.tournament.full_name!
								})
								.setField(`${emoji1} **${d.teams[0].name}** <:versus:1349105624180330516> **${d.teams[1].name}** ${emoji2}`, `<t:${d.when / 1000}:F> | <t:${d.when / 1000}:R>`)
								.setFooter({
									text: d.stage
								})
							const button = new ButtonBuilder()
								.setLabel(locale("helper.palpitate"))
								.setCustomId(`predict;lol;${d.id}`)
								.setStyle("green")

							if (d.stage.toLowerCase().includes("showmatch")) continue
							if (d.teams[0].name !== "TBD" && d.teams[1].name !== "TBD") await client.rest.channels.createMessage(e.channel1, {
								embeds: [embed],
								components: [
									{
										type: 1,
										components: [
											button,
											new ButtonBuilder()
												.setLabel(locales(guild.lang, "helper.pickem.label"))
												.setStyle("blue")
												.setCustomId("pickem")
										]
									}
								]
							}).catch(() => { })
							else {
								guild.lol_tbd_matches.push({
									id: d.id!,
									channel: e.channel1
								})
							}
						}
					}
				}
			}
			catch { }
			await guild.save()
			ctx.edit("commands.admin.resent")
		}
	}
})