import { Client, Guild, User } from '../../database/index.js'
import Listener from '../structures/client/Listener.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'
import ms from 'enhanced-ms'
import ButtonBuilder from '../structures/components/ButtonBuilder.js'
import { get } from '../../locales/index.js'
import Logger from '../structures/util/Logger.js'

export default class ReadyListener extends Listener {
  constructor(client) {
    super({
      client,
      name: 'ready'
    })
  }
  async on() {
    Logger.send(`${this.client.user.username}#${this.client.user.discriminator} online!`)

    const editClientStatus = async() => {
      const client = await Client.findById('1235576817683922954')
      const activity = client.status[Math.floor(Math.random() * client.status.length)]
      this.client.editStatus('online', activity)
    }
    const sendVCT24Results = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json()
      let data = res.data.filter(d => d.tournament.startsWith('Champions Tour 2024'))
      if(!data || !data[0]) return

      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })

      let matches
      for(const guild of guilds) {
        if (guild.lastResultSentId && guild.lastResultSentId !== data[0].id) {
          let match = data.find(e => e.id == guild.lastResultSentId)
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
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)
  
            let channelId = guild.events.filter(e => e.name === 'Valorant Champions Tour 2024')[0]?.channel2
            if(!channelId) return
            this.client.createMessage(channelId, embed.build())
          }
          data.reverse()
          guild.lastResultSentId = data[0].id
          guild.save()
        }
        else {
          guild.lastResultSentId = data[0].id
          guild.save()
        }
      }

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
    const sendVCT24Matches = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json()
      let data = res.data.filter(d => d.tournament.startsWith('Champions Tour 2024'))

      const guilds = await Guild.find({
        events: {
          $exists: true
        },
        lastMatchSentTime: {
          $lte: Date.now()
        }
      })
      for(const guild of guilds) {
        let channelId = guild.events.filter(e => e.name === 'Valorant Champions Tour 2024')[0]?.channel1
        if(channelId) continue
        let messages = await this.client.getMessages(channelId, 100)
        await this.client.deleteMessages(channelId, messages.map(m => m.id))

        for (const d of data) {
          if(ms(d.in) <= 86400000) {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .setFooter(d.event)
            .setTimestamp(new Date(Date.now() + ms(d.in)))

            const button = new ButtonBuilder()
            .setLabel(await get(guild.lang, 'helper.palpitate'))
            .setCustomId(`guess-${d.id}`)
            .setStyle('green')

            const msg = await this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [button]
                }
              ]
            })

            if(d.teams[0].name === 'TBD' || d.teams[1].name === 'TBD') {
              const g = await Guild.findById(guild.id)
              g.tbdMatches.push({
                id: d.id,
                messageId: msg.id,
                channelId: channelId
              })
              g.save()
            }
          }
        }
        guild.lastMatchSentTime = new Date().setHours(24, 0, 0, 0)
        guild.save()
      }
    }
    const sendVCBMatches = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/matches', {
        method: 'GET'
      })).json()
      let data = res.data.filter(d => d.tournament.includes('Challengers League 2024 Brazil'))
      const guilds = await Guild.find({
        events: {
          $exists: true
        },
        lastVCBMatchSendTime: {
          $lte: Date.now()
        }
      })

      for(const guild of guilds) {
        let channelId = guild.events.filter(e => e.name == 'Valorant Challengers Brazil')[0]?.channel1
        if(channelId) continue
        let messages = await this.client.getMessages(channelId, 100)
        await this.client.deleteMessages(channelId, messages.map(m => m.id))

        for(const d of data) {
          if(ms(d.in) <= 86400000) {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .setFooter(d.event)
            .setTimestamp(new Date(Date.now() + ms(d.in)))

            const button = new ButtonBuilder()
            .setLabel(await get(guild.lang, 'helper.palpitate'))
            .setCustomId(`guess-${d.id}`)
            .setStyle('green')

            const msg = await this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [d.teams[0].name === 'TBD' || d.teams[1].name === 'TBD' ? button.setDisabled() : button]
                }
              ]
            })
            
            if(d.teams[0].name === 'TBD' || d.teams[1].name === 'TBD') {
              const g = await Guild.findById(guild.id)
              g.tbdMatches.push({
                id: d.id,
                messageId: msg.id,
                channelId
              })
              g.save()
            }
          }
        }
        guild.lastVCBMatchSendTime = new Date().setHours(24, 0, 0, 0)
        guild.save()
      }
    }
    const sendVCBResults = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json()
      let data = res.data.filter(d => d.tournament.includes('Challengers League 2024 Brazil'))
      if(!data || !data[0]) return
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      let matches
      for(const guild of guilds) {
        if(guild.lastVCBResultSentId && guild.lastVCBResultSentId !== data[0].id) {
          let match = data.find(e => e.id == guild.lastVCBResultSentId)
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
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)
  
            let channelId = guild.events.filter(e => e.name === 'Valorant Challengers Brazil')[0]?.channel2
            if(!channelId) return
            this.client.createMessage(channelId, embed.build())
          }
          data.reverse()
          guild.lastVCBResultSentId = data[0].id
          guild.save()
        }
        else {
          guild.lastVCBResultSentId = data[0].id
          guild.save()
        }
      }
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
      })).json()
      let data = res.data.filter(d => d.tournament.includes('Challengers League 2024 North America'))
      const guilds = await Guild.find({
        events: {
          $exists: true
        },
        lastVCNMatchSendTime: {
          $lte: Date.now()
        }
      })
      for(const guild of guilds) {
        let channelId = guild.events.filter(e => e.name === 'Valorant Challengers NA')[0]?.channel1
        if(channelId) continue
        let messages = await this.client.getMessages(channelId, 100)
        await this.client.deleteMessages(channelId, messages.map(m => m.id))
        for(const d of data) {
          if(ms(d.in) <= 86400000) {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .setFooter(d.event)
            .setTimestamp(new Date(Date.now() + ms(d.in)))

            const button = new ButtonBuilder()
            .setLabel(await get(guild.lang, 'helper.palpitate'))
            .setCustomId(`guess-${d.id}`)
            .setStyle('green')

            const msg = await this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [d.teams[0].name === 'TBD' || d.teams[1].name === 'TBD' ? button.setDisabled() : button]
                }
              ]
            })
            
            if(d.teams[0].name === 'TBD' || d.teams[1].name === 'TBD') {
              const g = await Guild.findById(guild.id)
              g.tbdMatches.push({
                id: d.id,
                messageId: msg.id,
                channelId
              })
              g.save()
            }
          }
          guild.lastVCNMatchSendTime = new Date().setHours(24, 0, 0, 0)
        }
        guild.save()
      }
    }
    const sendVCNResults = async() => {
      const res = await (await fetch('https://vlr.orlandomm.net/api/v1/results', {
        method: 'GET'
      })).json()
      let data = res.data.filter(d => d.tournament.includes('Challengers League 2024 North America'))
      if(!data || !data[0]) return
      const guilds = await Guild.find({
        events: {
          $exists: true
        }
      })
      let matches
      for(const guild of guilds) {
        if(guild.lastVCNResultSentId && guild.lastVCNResultSentId !== data[0].id) {
          let match = data.find(e => e.id === guild.lastVCNResultSentId)
          let index = data.indexOf(match)
          if(index > -1) {
            data = data.slice(0, index)
            matches = data
          }
          else {
            data.slice(0, 1)
            matches = data
          }
          data.reverse()
          for(const d of data) {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)

            let channelId = guild.events.filter(e => e.name === 'Valorant Challengers NA')[0]?.channel2
            if(!channelId) return
            this.client.createMessage(channelId, embed.build())
          }
          data.reverse()
          guild.lastVCNResultSentId = data[0].id
          guild.save()
        }
        else {
          guild.lastVCNResultSentId = data[0].id
          guild.save()
        }
      }
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
      })).json()
      const guilds = await Guild.find({
        tbdMatches: {
          $ne: []
        }
      })
      for(const guild of guilds) {
        for(const match of guild.tbdMatches) {
          const data = res.data.find(d => d.id === match.id)
          if(data.teams[0].name !== 'TBD' && data.teams[1].name !== 'TBD') {
            const ch = await this.client.getRESTChannel(match.channelId)
            const msg = await ch.getMessage(match.messageId)
            const e = msg.embeds[0]
            const embed = new EmbedBuilder()
            .setTitle(e.title)
            .setDescription(e.description)
            .setThumbnail(e.thumbnail.url)
            .addField(`:flag_${data.teams[0].country}: ${data.teams[0].name}\n:flag_${data.teams[1].country}: ${data.teams[1].name}`, '')
            .setFooter(e.footer.text)
            .setTimestamp(e.timestamp)

            msg.edit({
              embed,
              components: [
                {
                  type: 1,
                  components: [
                    new ButtonBuilder()
                    .setLabel(await get(guild.lang, 'helper.palpitate'))
                    .setCustomId(`guess-${match.id}`)
                    .setStyle('green')
                  ]
                }
              ]
            })
            let index = guild.tbdMatches.findIndex(m => m.id === match.id)
            guild.tbdMatches.splice(index, 1)
            guild.save()
          }
        }
      }
    }
    setInterval(editClientStatus, 20000)
    setInterval(async() => {
      await sendVCT24Matches().catch(e => new Logger(this.client).error(e))
      await sendVCBMatches().catch(e => new Logger(this.client).error(e))
      await sendVCNMatches().catch(e => new Logger(this.client).error(e))
      await sendVCT24Results().catch(e => new Logger(this.client).error(e))
      await sendVCBResults().catch(e => new Logger(this.client).error(e))
      await sendVCNResults().catch(e => new Logger(this.client).error(e))
      await verifyIfMatchAlreadyHasTeams().catch(e => new Logger(this.client).error(e))
    }, process.env.INTERVAL ?? 20000)
  }
}