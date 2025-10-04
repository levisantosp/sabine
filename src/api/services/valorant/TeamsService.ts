import type { TeamData, TeamsData } from '../../../types.ts'

export default class TeamsService {
  public static async get(auth: string) {
    const data = await (await fetch(process.env.API_URL + '/teams/valorant', {
      headers: {
        authorization: auth
      }
    })).json()

    return data as TeamsData[]
  }
  public static async getById(auth: string, id: string | number) {
    const data = await (await fetch(process.env.API_URL + '/teams/valorant?id=' + id, {
      headers: {
        authorization: auth
      }
    })).json()
    
    return data as TeamData
  }
}