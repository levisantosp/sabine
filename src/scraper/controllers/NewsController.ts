import { load } from "cheerio"
import { NewsData } from "../../../types/index.js"

export default class NewsController {
  public static async get() {
    const html = await (await fetch("https://www.vlr.gg/news", {
      method: "get"
    })).text();
    const $ = load(html);
    const news: NewsData[] = [];
    $(".wf-module-item").each((i, el) => {
      const title = $(el).find("div").find("div").first().text().replace(/\t/g, "").trim();
      let desc: string | undefined = $(el).find("div").find("div").eq(1).text().replace(/\t/g, "").trim();
      if(desc === "") desc = undefined;
      const id = $(el).attr("href")?.split("/")[1]!;
      const url = "https://www.vlr.gg" + $(el).attr("href");
      news.push(
        {
          title,
          description: desc,
          id,
          url
        }
      );
    });
    return news;
  }
}