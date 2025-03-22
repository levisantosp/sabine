import EventsController from "./controllers/EventsController.js"
import LiveFeedController from "./controllers/LiveFeedController.js"
import MatchesController from "./controllers/MatchesController.js"
import NewsController from "./controllers/NewsController.js"
import PlayersController from "./controllers/PlayersController.js"
import ResultsController from "./controllers/ResultsController.js"
import TeamsController from "./controllers/TeamsController.js"

export default class MainController {
  public static async getEvents() {
    return await EventsController.get()
  }
  public static async getMatches() {
    return await MatchesController.get()
  }
  public static async getAllPlayers() {
    return await PlayersController.get()
  }
  public static async getPlayerById(id: string | number) {
    return await PlayersController.getById(id)
  }
  public static async getResults() {
    return await ResultsController.get()
  }
  public static async getAllTeams() {
    return await TeamsController.get()
  }
  public static async getTeamById(id: string | number) {
    return await TeamsController.getById(id)
  }
  public static async getAllNews() {
    return await NewsController.get()
  }
  public static async getLiveMatch(id: string | number) {
    return await LiveFeedController.getById(id);
  }
}