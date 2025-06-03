import Agent from "../Agent.js"

export default class Astra extends Agent {
  public constructor() {
    super({
      info: {
        name: "Astra",
        role: "CONTROLLER"
      },
      abilities: [
        {
          name: "GRAVITY_WELL",
          vulnerable: true,
          move_player: true,
          price: 0,
          has: true,
          cooldown: 45000
        }
      ],
      stars: {
        price: 150,
        size: 1,
        limit: 5
      }
    })
  }

  public use_ability(ability_name: string) {
    const ability = this.abilities.filter(a => a.name === ability_name)[0]

    return ability
  }
}