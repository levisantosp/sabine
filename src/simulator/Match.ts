import { valorant_agents, valorant_weapons } from '../config.ts'
import ComponentInteractionContext from '../structures/interactions/ComponentInteractionContext.ts'

const calcPlayerOvr = (player: TeamPlayer) => {
  return (player.stats.aim + player.stats.HS + player.stats.movement + player.stats.aggression + player.stats.ACS + player.stats.gamesense) / 4.5
}
export type PlayerStats = {
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
}
export type PlayerMatchStats = {
  kills: number
  deaths: number
}
export type TeamPlayer = {
  id: string
  name: string
  stats: PlayerStats
  role: 'initiator' | 'controller' | 'duelist' | 'sentinel' | 'flex'
  agent?: typeof valorant_agents[number]
  shield_type?: number
  alive: boolean
  match_stats?: PlayerMatchStats
  credits: number
  weapon?: typeof valorant_weapons[number]['name']
}
export type Team = {
  user: TeamUser
  roster: string[]
  side?: 'DEFENSE' | 'ATTACK'
  name: string
  tag: string
}
type KillEvent = {
  killer: Pick<TeamPlayer, 'id' | 'name'>
  killer_index: number
  victim: Pick<TeamPlayer, 'id' | 'name'>
  victim_index: number
  weapon: typeof valorant_weapons[number]['name']
}
type RoundResult = {
  bomb_planted?: boolean
  bomb_defused?: boolean
  winning_team: number
  win_type: 'ELIMINATION' | 'BOMB' | 'DEFUSE' | 'TIME'
  kills: KillEvent[]
}
type MatchOptions = {
  teams: Team[]
  ctx: ComponentInteractionContext
  locale: string
  mode: 'unranked' | 'ranked' | 'swiftplay' | 'ranked;swiftplay' | 'tournament'
}
type TeamUser = {
  name: string
  id: string
}
type PrivateTeam = {
  user: TeamUser
  roster: TeamPlayer[]
  side?: 'DEFENSE' | 'ATTACK'
  lost_round_streak: number
  name: string
  tag: string
}

export default class Match {
  private rounds_played: RoundResult[] = []
  private __teams: PrivateTeam[] = []
  public teams: Team[] = []
  public finished: boolean = false
  private ctx: ComponentInteractionContext
  private content: string = ''
  private locale: string
  private mode: 'unranked' | 'ranked' | 'swiftplay' | 'ranked;swiftplay' | 'tournament'
  public constructor(options: MatchOptions) {
    this.teams = options.teams
    this.ctx = options.ctx
    this.locale = options.locale
    this.mode = options.mode
  }
}