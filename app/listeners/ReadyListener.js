import axios from 'axios'
import { Guild, User } from '../../database/index.js'
import Listener from '../structures/client/Listener.js'
import EmbedBuilder from '../structures/embed/EmbedBuilder.js'
import ms from 'enhanced-ms'
import ButtonBuilder from '../structures/components/ButtonBuilder.js'
import { get } from '../../locales/index.js'

export default class ReadyListener extends Listener {
  constructor(client) {
    super({
      client,
      name: 'ready'
    })
  }
  async on() {
    console.log('ready')

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
          await data.forEach(d => {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)
  
            let channelId = guild.events.filter(e => e.name = 'Valorant Champions Tour 2024')[0]?.channel2
            if(!channelId) return
            this.client.createMessage(channelId, embed.build())
          })
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
            if(guess.score1 === match.teams[0].score && guess.score2 === match.teams[1].score) {
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
        await await data.forEach(async d => {
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

            let channelId = guild.events.filter(e => e.name == 'Valorant Champions Tour 2024')[0]?.channel1
            if(!channelId) return
            let messages = await this.client.getMessages(channelId, 100)
            await this.client.deleteMessages(channelId, messages.map(m => m.id))
            this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [button]
                }
              ]
            })
          }
        })
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
        await await data.forEach(async d => {
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

            let channelId = guild.events.filter(e => e.name == 'Valorant Challengers Brazil')[0]?.channel1
            if(!channelId) return
            let messages = await this.client.getMessages(channelId, 100)
            await this.client.deleteMessages(channelId, messages.map(m => m.id))
            this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [button]
                }
              ]
            })
          }
        })
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
          await data.forEach(d => {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)
  
            let channelId = guild.events.filter(e => e.name = 'Valorant Challengers Brazil')[0]?.channel2
            if(!channelId) return
            this.client.createMessage(channelId, embed.build())
          })
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
            if(guess.score1 === match.teams[0].score && guess.score2 === match.teams[1].score) {
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
        await await data.forEach(async d => {
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

            let channelId = guild.events.filter(e => e.name === 'Valorant Challengers NA')[0]?.channel1
            if(!channelId) return
            let messages = await this.client.getMessages(channelId, 100)
            await this.client.deleteMessages(channelId, messages.map(m => m.id))
            this.client.createMessage(channelId, {
              embed,
              components: [
                {
                  type: 1,
                  components: [button]
                }
              ]
            })
          }
          guild.lastVCNMatchSendTime = new Date().setHours(24, 0, 0, 0)
          guild.save()
        })
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
          await data.forEach(d => {
            const embed = new EmbedBuilder()
            .setTitle(d.tournament)
            .setDescription(`[Match page](https://vlr.gg/${d.id})`)
            .setThumbnail(d.img)
            .addField(`:flag_${d.teams[0].country}: ${d.teams[0].name}\n:flag_${d.teams[1].country}: ${d.teams[1].name}`, '', true)
            .addField(`${d.teams[0].score}\n${d.teams[1].score}`, '', true)
            .setFooter(d.event)

            let channelId = guild.events.filter(e => e.name = 'Valorant Challengers NA')[0]?.channel2
            if(!channelId) return
            this.client.createMessage(channelId, embed.build())
          })
          data.reverse()
          guild.lastVCNResultSentId = data[0].id
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
      if(matches?.length) return
      for(const match of matches) {
        for(const user of users) {
          let guesses = user.guesses
          let guess = guesses.filter(g => g.match === match.id)[0]
          if(guess.score1 === match.teams[0].score && guess.score2 === match.teams[1].score) {
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
    setInterval(async() => {
      await sendVCT24Matches()
      await sendVCBMatches()
      await sendVCNMatches()
      await sendVCT24Results()
      await sendVCBResults()
      await sendVCNResults()
    }, 20000)
  }
}