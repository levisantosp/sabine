import type { ResultsData } from '../../../types'

export default class ResultsService {
    public static async get(auth: string) {
        const data = await (await fetch(process.env.API_URL + '/results/valorant', {
            headers: {
                authorization: auth
            }
        })).json()

        return data as ResultsData[]
    }
}