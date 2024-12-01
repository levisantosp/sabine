import { load } from "cheerio"
import { EventsData } from "../../../types"

export default class EventsController {
  static async get() {
    const html = await (await fetch("https://www.vlr.gg/events", {
      method: "get"
    })).text()
    const $ = load(html)
    const events: EventsData[] = []
    $(".wf-card.mod-flex.event-item").each((index, element) => {
      const id = $(element).attr("href")?.split("/")[2]
      const name = $(element).find(".event-item-title").text().trim() 
      const status = $(element).find(".event-item-desc-item-status").text()
      const image = "https:" + $(element).find(".event-item-thumb img").attr("src")
      const url = "https://vlr.gg" + $(element).attr("href")
      events.push({ id, name, status, image, url })
    })
    return events
  }
}