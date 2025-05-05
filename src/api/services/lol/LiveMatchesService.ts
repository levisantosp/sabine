import { LiveFeed } from "../../../../types"

export default class LiveMatchesService {
        public static async get(auth: string) {
                const data = await (await fetch(process.env.API_URL + "/live/lol", {
                        headers: {
                          authorization: auth
                        }
                })).json()

                return data as LiveFeed[]
        }
}