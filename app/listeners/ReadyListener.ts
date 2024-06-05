import ms from 'enhanced-ms'
import { App, ButtonBuilder, EmbedBuilder, Listener, Logger } from '../structures'
import { Client, Guild, Matches, User } from '../../database'
import locales from '../../locales'
import { TextChannel } from 'eris'

export default class ReadyListener extends Listener {
  constructor(client: App) {
    super({
      client,
      name: 'ready'
    })
  }
  async on() {
    Logger.send(`${this.client.user.username}#${this.client.user.discriminator} online!`)

    const editClientStatus = async() => {
      const client = await Client.findById('1235576817683922954')
      const activity = client?.status[Math.floor(Math.random() * client?.status.length)]
      this.client.editStatus('online', activity)
    }
    const sendVCTResults = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      let data = res.data.filter((d: any) => d.tournament.startsWith('Champions Tour 2024'))
      if(!data || !data[0]) return

      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      const Match = await Matches.findById('matches')
      let matches

      for(const guild of guilds) {
        if (Match!.lastVCTResult! && Match!.lastVCTResult! !== data[0].id) {
          let match = data.find((e: any) => e.id == Match!.lastVCTResult!)
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
          for(const d of data) {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)
  
            let channelId = guild.events.filter((e: any) => e.name === 'Valorant Champions Tour 2024')[0]?.channel2
            if(!channelId) continue
            this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                    .setLabel('Match page')
                    .setStyle('link')
                    .setURL(`https://vlr.gg/${d.id}`)
                  ]
                }
              ]
            })
          }
          data.reverse()
        }
      }
      Match!.lastVCTResult! = data[0].id
      Match!.save()

      const users = await User.find({
        guesses: {
          $exists: true
        }
      })
      if (!matches) return
      for(const match of matches) {
        for(const user of users) {
          let guesses = user.guesses
          let guess = guesses.filter(g => g.match === match.id)[0]
          if(guess?.match === match.id) {
            if(guess && guess.score1 === match.teams[0].score && guess.score2 === match.teams[1].score) {
              user.guessesRight += 1
              let _guess = user.guesses.find(g => g.match === match.id)
              let index = user.guesses.indexOf(_guess)
              user.guesses.splice(index, 1)
              user.save()
            }
            else {
              user.guessesWrong += 1
              let _guess = user.guesses.find(g => g.match === match.id)
              let index = user.guesses.indexOf(_guess)
              user.guesses.splice(index, 1)
              user.save()
            }
          }
        }
      }
    }
    const sendVCTMatches = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      let data = res.data.filter((d: any) => d.tournament.startsWith('Champions Tour 2024'))
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      const Match = await Matches.findById('matches')
      if(Match!.verificationTimeVCT! > Date.now()) return
      const results = (await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json()).data.filter((d: any) => d.id === Match!.VCTMatches.at(-1))
      if(!res) return
      if(!guilds.length) return
      if(!results.length && Match!.VCTMatches.length) return
      
      Match!.VCTMatches = []
      for(const guild of guilds) {
        let channelId = guild.events.filter((e: any) => e.name === 'Valorant Champions Tour 2024')[0]?.channel1
        if(!channelId) continue
        let messages = await this.client.getMessages(channelId, 100)
        await this.client.deleteMessages(channelId, messages.map(m => m.id)).catch(() => {})

        for(const d of data) {
          let index = Match!.VCTMatches.findIndex(m => m === d.id)
          if(index > -1) Match!.VCTMatches.splice(index, 1)
          Match!.VCTMatches.push(d.id)

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
          .setLabel('Match page')
          .setStyle('link')
          .setURL(`https://vlr.gg/${d.id}`)

          if(d.teams[0].name !== 'TBD' || d.teams[1].name !== 'TBD') this.client.createMessage(channelId, {
            embed,
            components: [
              {
                type: 1,
                components: [button, urlButton]
              }
            ]
          })
          else Match!.tbdMatches.push({
            id: d.id,
            channel: channelId,
            guild: guild.lang
          })
        }
      }
      Match!.verificationTimeVCT = new Date().setHours(24, 0, 0, 0)
      Match!.save()
    }
    const sendVCBMatches = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      let data = res.data.filter((d: any) => d.tournament.includes('Challengers League 2024 Brazil'))
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      const Match = await Matches.findById('matches')
      if(Match!.verificationTimeVCB > Date.now()) return
      const results = (await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json()).data.filter((d: any) => d.id === Match!.VCBMatches.at(-1))
      if(!res) return
      if(!guilds.length) return
      if(!results.length && Match!.VCBMatches.length) return
      
      Match!.VCBMatches = []
      for(const guild of guilds) {
        let channelId = guild.events.filter((e: any) => e.name === 'Valorant Challengers Brazil')[0]?.channel1
        if(!channelId) continue
        let messages = await this.client.getMessages(channelId, 100)
        await this.client.deleteMessages(channelId, messages.map(m => m.id)).catch(() => {})

        for(const d of data) {
          let index = Match!.VCBMatches.findIndex(m => m === d.id)
          if(index > -1) Match!.VCBMatches.splice(index, 1)
          Match!.VCBMatches.push(d.id)

          const embed = new EmbedBuilder()
          .setTitle(d.tournament)
          .setDescription(`<t:${((Date.now() + Number(ms(d.in))) / 1000).toFixed(0)}:F> | <t:${((Date.now() + Number(ms(d.in))) / 1000).toFixed(0)}:R>`)
          .setThumbnail(d.img)
          .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
          .setFooter(d.event)

          const button = new ButtonBuilder()
          .setLabel(locales(guild.lang, 'helper.palpitate'))
          .setCustomId(`guess-${d.id}`)
          .setStyle('green')

          const urlButton = new ButtonBuilder()
          .setLabel('Match page')
          .setStyle('link')
          .setURL(`https://vlr.gg/${d.id}`)

          if(d.teams[0].name !== 'TBD' || d.teams[1].name !== 'TBD') this.client.createMessage(channelId, {
            embed,
            components: [
              {
                type: 1,
                components: [button, urlButton]
              }
            ]
          })
          else Match!.tbdMatches.push({
            id: d.id,
            channel: channelId,
            guild: guild.lang
          })
        }
      }
      Match!.verificationTimeVCB = new Date().setHours(24, 0, 0, 0)
      Match!.save()
    }
    const sendVCBResults = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      let data = res.data.filter((d: any) => d.tournament.includes('Challengers League 2024 Brazil'))
      if(!data || !data[0]) return
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      const Match = await Matches.findById('matches')
      let matches

      for(const guild of guilds) {
        if (Match!.lastVCBResult! && Match!.lastVCBResult! !== data[0].id) {
          let match = data.find((e: any) => e.id == Match!.lastVCBResult!)
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
          for(const d of data) {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)
  
            let channelId = guild.events.filter((e: any) => e.name === 'Valorant Challengers Brazil')[0]?.channel2
            if(!channelId) continue
            this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                    .setLabel('Match page')
                    .setStyle('link')
                    .setURL(`https://vlr.gg/${d.id}`)
                  ]
                }
              ]
            })
          }
          data.reverse()
        }
      }
      Match!.lastVCBResult! = data[0].id
      Match!.save()

      const users = await User.find({
        guesses: {
          $exists: true
        }
      })
      if (!matches?.length) return
      for(const match of matches) {
        for(const user of users) {
          let guesses = user.guesses
          let guess = guesses.filter(g => g.match === match.id)[0]
          if(guess?.match === match.id) {
            if(guess && guess.score1 === match.teams[0].score && guess.score2 === match.teams[1].score) {
              let _guess = user.guesses.find(g => g.match === match.id)
              let index = user.guesses.indexOf(_guess)
              user.guesses.splice(index, 1)
              user.guessesRight += 1
              user.save()
            }
            else {
              let _guess = user.guesses.find(g => g.match === match.id)
              let index = user.guesses.indexOf(_guess)
              user.guesses.splice(index, 1)
              user.guessesWrong += 1
              user.save()
            }
          }
        }
      }
    }
    const sendVCNMatches = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      let data = res.data.filter((d: any) => d.tournament.includes('Challengers League 2024 North America'))
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      const Match = await Matches.findById('matches')
      if(Match!.verificationTimeVCN > Date.now()) return
      const results = (await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json()).data.filter((d: any) => d.id === Match!.VCNMatches.at(-1))
      if(!res) return
      if(!guilds.length) return
      if(!results.length && Match!.VCNMatches.length) return
      
      Match!.VCNMatches = []
      for(const guild of guilds) {
        let channelId = guild.events.filter((e: any) => e.name === 'Valorant Challengers NA')[0]?.channel1
        if(!channelId) continue
        let messages = await this.client.getMessages(channelId, 100)
        await this.client.deleteMessages(channelId, messages.map(m => m.id)).catch(() => {})

        for(const d of data) {
          let index = Match!.VCNMatches.findIndex(m => m === d.id)
          if(index > -1) Match!.VCNMatches.splice(index, 1)
          Match!.VCNMatches.push(d.id)

          const embed = new EmbedBuilder()
          .setTitle(d.tournament)
          .setDescription(`<t:${((Date.now() + Number(ms(d.in))) / 1000).toFixed(0)}:F> | <t:${((Date.now() + Number(ms(d.in))) / 1000).toFixed(0)}:R>`)
          .setThumbnail(d.img)
          .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
          .setFooter(d.event)

          const button = new ButtonBuilder()
          .setLabel(locales(guild.lang, 'helper.palpitate'))
          .setCustomId(`guess-${d.id}`)
          .setStyle('green')

          const urlButton = new ButtonBuilder()
          .setLabel('Match page')
          .setStyle('link')
          .setURL(`https://vlr.gg/${d.id}`)

          if(d.teams[0].name !== 'TBD' || d.teams[1].name !== 'TBD') this.client.createMessage(channelId, {
            embed,
            components: [
              {
                type: 1,
                components: [button, urlButton]
              }
            ]
          })
          else Match!.tbdMatches.push({
            id: d.id,
            channel: channelId,
            guild: guild.lang
          })
        }
      }
      Match!.verificationTimeVCN = new Date().setHours(24, 0, 0, 0)
      Match!.save()
    }
    const sendVCNResults = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      let data = res.data.filter((d: any) => d.tournament.includes('Challengers League 2024 North America'))
      if(!data || !data[0]) return
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      const Match = await Matches.findById('matches')
      let matches

      for(const guild of guilds) {
        if (Match!.lastVCNResult! && Match!.lastVCNResult! !== data[0].id) {
          let match = data.find((e: any) => e.id == Match!.lastVCNResult!)
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
          for(const d of data) {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)
  
            let channelId = guild.events.filter((e: any) => e.name === 'Valorant Challengers NA')[0]?.channel2
            if(!channelId) continue
            this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                    .setLabel('Match page')
                    .setStyle('link')
                    .setURL(`https://vlr.gg/${d.id}`)
                  ]
                }
              ]
            })
          }
          data.reverse()
        }
      }
      Match!.lastVCNResult! = data[0].id
      Match!.save()

      const users = await User.find({
        guesses: {
          $exists: true
        }
      })
      if(!matches?.length) return
      for(const match of matches) {
        for(const user of users) {
          let guesses = user.guesses
          let guess = guesses.filter(g => g.match === match.id)[0]
          if(guess && guess.score1 === match.teams[0].score && guess.score2 === match.teams[1].score) {
            let _guess = user.guesses.find(g => g.match === match.id)
            let index = user.guesses.indexOf(_guess)
            user.guesses.splice(index, 1)
            user.guessesRight += 1
            user.save()
          }
          else {
            let _guess = user.guesses.find(g => g.match === match.id)
            let index = user.guesses.indexOf(_guess)
            user.guesses.splice(index, 1)
            user.guessesWrong += 1
            user.save()
          }
        }
      }
    }
    const verifyIfMatchAlreadyHasTeams = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json().catch(() => Logger.warn('API is down'))
      if(!res) return
      const Match = await Matches.findById('matches')
      if(!Match!.tbdMatches.length) return

      for(const match of Match!.tbdMatches) {
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
                  .setLabel(locales(match.guild, 'helper.palpitate'))
                  .setCustomId(`guess-${match.id}`)
                  .setStyle('green'),
                  new ButtonBuilder()
                  .setLabel('Match page')
                  .setStyle('link')
                  .setURL(`https://vlr.gg/${data.id}`)
                ]
              }
            ]
          })
          let index = Match!.tbdMatches.findIndex(m => m.id === match.id)
          Match!.tbdMatches.splice(index, 1)
          Match!.save()
        }
      }
    }
    setInterval(editClientStatus, 20000)
    setInterval(async() => {
      await sendVCTMatches().catch(e => new Logger(this.client).error(e))
      await sendVCBMatches().catch(e => new Logger(this.client).error(e))
      await sendVCNMatches().catch(e => new Logger(this.client).error(e))
      await sendVCTResults().catch(e => new Logger(this.client).error(e))
      await sendVCBResults().catch(e => new Logger(this.client).error(e))
      await sendVCNResults().catch(e => new Logger(this.client).error(e))
      await verifyIfMatchAlreadyHasTeams().catch(e => new Logger(this.client).error(e))
    }, process.env.INTERVAL ?? 20000)
  }
}