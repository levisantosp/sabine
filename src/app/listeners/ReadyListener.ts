import ms from 'enhanced-ms'
import { App, ButtonBuilder, EmbedBuilder, Listener, Logger } from '../structures'
import { Client, Guild, User } from '../../database'
import locales from '../../locales'
import { ActionRowComponents, TextChannel } from 'eris'
import { CommandStructure } from '../../../types'

export default class ReadyListener extends Listener {
  constructor(client: App) {
    super({
      client,
      name: 'ready'
    })
  }
  async on() {
    Logger.send(`${this.client.user.username}#${this.client.user.discriminator} online!`)

    const commands: CommandStructure[] = []
    this.client.commands.forEach(command => {
      commands.push({
        name: command.name,
        name_localizations: command.name_localizations,
        description: command.description,
        description_localizations: command.description_localizations,
        options: command.options,
        type: 1
      })
    })
    this.client.bulkEditCommands(commands)
    const sendResults = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      let matches: any[] = []
      for(const guild of guilds) {
        let data = res.data.filter((d: any) => guild.events.some((e: any) => e.name === d.tournament))
        if(!data || !data[0]) return
        if(guild.lastResult && guild.lastResult !== data[0].id) {
          let match = data.find((e: any) => e.id == guild.lastResult)
          let index = data.indexOf(match)
          if(index > -1) {
            data = data.slice(0, index)
            matches = data
          }
          else {
            data = data.slice(0, 1)
            matches = data
          }
          data.reverse()
          for(const e of guild.events) {
            for(const d of data) {
              if(e.name === d.tournament) {
                const embed = new EmbedBuilder()
                .setTitle(d.tournament)
                .setThumbnail(d.img)
                .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
                .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
                .setFooter(d.event)
                this.client.createMessage(e.channel2, {
                  embed,
                  components: [
                    {
                      type: 1,
                      components: [
                        new ButtonBuilder()
                        .setLabel(locales(guild.lang, 'helper.stats'))
                        .setStyle('link')
                        .setURL(`https://vlr.gg/${d.id}`)
                      ] as ActionRowComponents[]
                    }
                  ]
                })
              }
            }
          }
          data.reverse()
        }
        guild.lastResult = data[0].id
        guild.save()
      }
      const users = await User.find({
        guesses: {
          $exists: true
        }
      })
      if(!matches.length) return
      for(const user of users) {
        for(const match of matches) {
          let guess = user.history.find((h: any) => h.match === match.id)
          if(!guess) continue
          if(guess.score1 === match.teams[0].score && guess.score2 === match.teams[1].score) {
            user.guessesRight += 1
          }
          else {
            user.guessesWrong += 1
          }
        }
        user.save()
      }
    }
    const sendMatches = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      const res2 = (await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json())
      if(!res) return
      if(!guilds.length) return
      for(const guild of guilds) {
        if(guild.verificationTime > Date.now()) continue
        const results = res2.data.filter((d: any) => d.id === guild.matches.at(-1))
        if(!results.length && guild.matches.length) {
          guild.verificationTime = new Date().setHours(24, 0, 0, 0)
          await guild.save()
          continue
        }
        guild.matches = []
        let data = res.data.filter((d: any) => guild.events.some((e: any) => e.name === d.tournament))
        for(const e of guild.events) {
          let messages = await this.client.getMessages(e.channel1)
          await this.client.deleteMessages(e.channel1, messages.map(m => m.id))
          for(const d of data) {
            if(e.name === d.tournament) {
              let index = guild.matches.findIndex((m: string) => m === d.id)
              if(index > -1) guild.matches.splice(index, 1)
              guild.matches.push(d.id)
    
              const embed = new EmbedBuilder()
              .setTitle(d.tournament)
              .setDescription(`<t:${((Date.now() + Number(Number(ms(d.in)))) / 1000).toFixed(0)}:F> | <t:${((Date.now() + Number(Number(ms(d.in)))) / 1000).toFixed(0)}:R>`)
              .setThumbnail(d.img)
              .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
              .setFooter(d.event)
    
              const button = new ButtonBuilder()
              .setLabel(locales(guild.lang, 'helper.palpitate'))
              .setCustomId(`guess-${d.id}`)
              .setStyle('green')
    
              const urlButton = new ButtonBuilder()
              .setLabel(locales(guild.lang, 'helper.stats'))
              .setStyle('link')
              .setURL(`https://vlr.gg/${d.id}`)
    
              if(d.teams[0].name !== 'TBD' || d.teams[1].name !== 'TBD') this.client.createMessage(e.channel1, {
                embed,
                components: [
                  {
                    type: 1,
                    components: [button, urlButton] as ActionRowComponents[]
                  }
                ]
              })
              else guild.tbdMatches.push({
                id: d.id,
                channel: e.channel1
              })     
            }
          }
        }
        guild.verificationTime = new Date().setHours(24, 0, 0, 0)
        guild.save()
      }
    }
    const verifyIfMatchAlreadyHasTeams = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      const guilds = await Guild.find()
      for(const guild of guilds) {
        if(!guild.tbdMatches.length) continue
        for(const match of guild.tbdMatches) {
          const data = res.data.find((d: any) => d.id === match.id)
          if(data.teams[0].name !== 'TBD' && data.teams[1].name !== 'TBD') {
            const channel = await this.client.getRESTChannel(match.channel) as TextChannel
            const embed = new EmbedBuilder()
            .setTitle(data.tournament)
            .setDescription(`<t:${((Date.now() + Number(ms(data.in))) / 1000).toFixed(0)}:F> | <t:${((Date.now() + Number(ms(data.in))) / 1000).toFixed(0)}:R>`)
            .setThumbnail(data.img)
            .addField(`:flag_${data.teams[0].country}: ${data.teams[0].name}\n:flag_${data.teams[1].country}: ${data.teams[1].name}`, '', true)
            .setFooter(data.event)
            channel.createMessage({
              embed,
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                    .setLabel(locales(guild.lang, 'helper.palpitate'))
                    .setCustomId(`guess-${match.id}`)
                    .setStyle('green'),
                    new ButtonBuilder()
                    .setLabel(locales(guild.lang, 'helper.stats'))
                    .setStyle('link')
                    .setURL(`https://vlr.gg/${data.id}`)
                  ] as ActionRowComponents[]
                }
              ]
            })
            let index = guild.tbdMatches.findIndex((m: any) => m.id === match.id)
            guild.tbdMatches.splice(index, 1)
            guild.save()
          }
        }
      }
    }
    setInterval(async() => {
      await sendMatches().catch(e => new Logger(this.client).error(e))
      await sendResults().catch(e => new Logger(this.client).error(e))
      await verifyIfMatchAlreadyHasTeams().catch(e => new Logger(this.client).error(e))
    }, process.env.INTERVAL || 20000)
  }
}