import { load } from "cheerio"

export default class LiveFeedController {
  public static async get(id: string | number) {
    const html = await (await fetch("https://www.vlr.gg/" + id, {
      method: "get"
    })).text();
    let $ = load(html);
    const teams: any[] = [];
    $(".wf-title-med").each((i, el) => {
      const name = $(el).text().trim();
      console.log(name);
    });
  }
}