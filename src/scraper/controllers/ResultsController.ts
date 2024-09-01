import { load } from 'cheerio'
import { ResultsData } from '../../../types'

export default class ResultsController {
  static async get() {
    const html = await (await fetch('https://www.vlr.gg/matches/results', {
      method: 'get'
    })).text()
    const $ = load(html)
    const results: ResultsData[] = []
    $('.wf-module-item.match-item').each((index, element) => {
      const id = $(element).attr('href')?.split('/')[1]!
      const teams = $(element).find('.match-item-vs-team-name').text().replace(/\t/g, '').trim()
      const [team1, team2] = teams.split('\n').map(item => item).filter(item => item !== '')
      const scores = $(element).find('.match-item-vs-team-score').text().replace(/\t/g, '').trim()
      const [score1, score2] = scores.split('\n')
      const countryElements = $(element).find('.match-item-vs-team .flag')
      const country1 = countryElements.eq(0).attr('class')?.split(' ')[1].replace('mod-', '')
      const country2 = countryElements.eq(1).attr('class')?.split(' ')[1].replace('mod-', '')
      const winnerScore = Math.max(...[Number(score1), Number(score2)])
      const status = $(element).find('.ml-status').text()
      const date = `${$(element.parent!).prev().text().replace('Today', '').replace('Yesterday', '').trim()} ${$(element).find('.match-item-time').text().trim()}`
      const timestamp = new Date(new Date(date).toLocaleString('en-US', { timeZone: process.env.TZ })).getTime()
      const stage = $(element).find('.match-item-event-series').text().trim()
      results.push({
        id,
        teams: [
          {
            name: team1,
            score: score1,
            country: country1!,
            winner: score1 !== winnerScore.toString() ? false : true
          },
          {
            name: team2,
            score: score2,
            country: country2!,
            winner: score2 !== winnerScore.toString() ? false : true
          }
        ],
        status,
        tournament: {
          name: $(element).find('.match-item-event').text().replace(/\t/g, '').replace(stage, '').trim(),
          image: `https:${$(element).find('.match-item-icon img').attr('src')}`
        },
        stage,
        when: timestamp
      })
    })
    return results
  }
}