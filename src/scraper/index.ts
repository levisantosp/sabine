import EventsController from './controllers/EventsController'
import MatchesController from './controllers/MatchesController'
import PlayersController from './controllers/PlayersController'
import ResultsController from './controllers/ResultsController'
import TeamsController from './controllers/TeamsController'

export default class MainController {
  static async getEvents() {
    return await EventsController.get()
  }
  static async getMatches() {
    return await MatchesController.get()
  }
  static async getAllPlayers() {
    return await PlayersController.get()
  }
  static async getPlayerById(id: string | number) {
    return await PlayersController.getById(id)
  }
  static async getResults() {
    return await ResultsController.get()
  }
  static async getAllTeams() {
    return await TeamsController.get()
  }
  static async getTeam(id: string | number) {
    return await TeamsController.getById(id)
  }
}