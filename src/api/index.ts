import ValorantEvents from "./services/valorant/EventsService.js"
import ValorantMatches from "./services/valorant/MatchesService.js"
import ValorantPlayers from "./services/valorant/PlayersService.js"
import ValorantTeams from "./services/valorant/TeamsService.js"
import ValorantResults from "./services/valorant/ResultsService.js"

export default class Service {
  private __auth: string;
  public constructor(auth: string) {
    this.__auth = auth;
  }
  public async getEvents() {
    return await ValorantEvents.get(this.__auth);
  }
  public async getMatches() {
    return await ValorantMatches.get(this.__auth);
  }
  public async getAllPlayers() {
    return await ValorantPlayers.get(this.__auth);
  }
  public async getPlayerById(id: string | number) {
    return await ValorantPlayers.getById(this.__auth, id);
  }
  public async getAllTeams() {
    return await ValorantTeams.get(this.__auth);
  }
  public async getTeamById(id: string | number) {
    return await ValorantTeams.getById(this.__auth, id);
  }
  public async getResults() {
    return await ValorantResults.get(this.__auth);
  }
}