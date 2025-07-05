import type { MatchesData } from '../../../types.ts'

export default class MatchesService {
  public static async get(auth: string) {
    const data = await (await fetch(process.env.API_URL + '/matches/lol', {
      headers: {
        authorization: auth
      }
    })).json()
    return data as MatchesData[]
  }
}