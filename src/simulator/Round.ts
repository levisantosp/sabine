import Match from "./Match.ts"

export default class Round extends Match {
  public override async start() {
    if(this.rounds.length === this.switchSidesAt) {
      return await this.switchSides()
    }
    // TODO
  }
}