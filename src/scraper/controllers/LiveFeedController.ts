import { load } from "cheerio"

export default class LiveFeedController {
  public static async getById(id: string | number) {
    const html = await (await fetch("https://www.vlr.gg/" + id, {
      method: "get"
    })).text();
    let $ = load(html);
    const team0 = $(".wf-title-med").eq(0).text().trim();
    const team1 = $(".wf-title-med").eq(1).text().trim();
    const score0 = $(".js-spoiler").find("span").text().replace(":", "").replace(/\s+/g, "").trim().split("")[0];
    const score1 = $(".js-spoiler").find("span").text().replace(":", "").replace(/\s+/g, "").trim().split("")[1];
    const maps = $("div[style*='text-align: center']").contents().filter((_, el) => el.type === "text").text().trim().replace(/\s+/g, " ").split(" ");
    const currentMap = maps[Number($(".vm-stats-gamesnav-item.js-map-switch.mod-active.mod-live").find("span").text().trim()) - 1];
    const mapScore0 = $(".vm-stats-game.mod-active").find("div").find(".score").eq(0).text().trim();
    const mapScore1 = $(".vm-stats-game.mod-active").find("div").find(".score").eq(1).text().trim();
    return {
      teams: [
        {
          name: team0,
          score: score0
        },
        {
          name: team1,
          score: score1
        }
      ],
      currentMap,
      score1: mapScore0,
      score2: mapScore1,
      id,
      url: "https://www.vlr.gg/" + id
    }
  }
}