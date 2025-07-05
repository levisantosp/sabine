import type { EventsData } from '../../../types.ts'

export default class EventsService {
  public static async get(auth: string) {
    const data = await (await fetch(process.env.API_URL + '/events/lol', {
      headers: {
        authorization: auth
      }
    })).json()
    return data as EventsData[]
  }
}