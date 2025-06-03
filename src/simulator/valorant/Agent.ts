import { valorant_agents } from "../../config"

export type Bang = {
  type: number // 0 = omen, reyna bang; 1 = skye, yoru, phoenix bang
  time: number
}

export type Ability = {
  price: number
  name: string
  damage?: number
  stun?: boolean
  decay?: boolean
  vulnerable?: boolean
  bang?: Bang
  smoke?: boolean
  has?: boolean
  move_player?: boolean
  limit?: number
  cooldown?: number
}

type AgentOptions = {
  info: typeof valorant_agents[number]
  abilities: Ability[]
  stars: AgentStar
}

type AgentStar = {
  size: number
  price: number
  limit: number
}

export default class Agent {
  public info: typeof valorant_agents[number]
  public abilities: Ability[]
  public stars?: AgentStar

  public constructor(options: AgentOptions) {
    this.info = options.info
    this.abilities = options.abilities
    this.stars = options.stars
  }

  public use_ability(ability_name: string) {}
  public buy_ability(ability_name: string) {}
}