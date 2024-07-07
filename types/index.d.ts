import { AutocompleteInteraction, Constants, InteractionDataOptions } from 'eris'

type ComponentInteractionButtonData = {
  data: Constants['ComponentTypes']['BUTTON']
  custom_id: string
  components: Array<{
    components: Array<{
      value: string
    }>
  }>
}
type CommandInteractionDataOptions = {
  options?: Array<{
    name: string
    type: number
    value: string | number
  }>
}
type CommandStructure = {
  type: 1 | 2 | 3
  name: string
  name_localizations?: {
    'pt-BR': string
  }
  description: string
  description_localizations?: {
    'pt-BR': string
  }
  options?: SlashOptions[]
}
type Team = {
  name: string
  country: string
  score: string
  won?: boolean
}
type MatchesData = {
  id: string
  teams: Team[]
  status: string
  event: string
  tournament: string
  img: string
  in: string
}
type TMatches = {
  status: string
  size: number
  data: MatchesData[]
}
type ResultsData = {
  id: string
  teams: Team[]
  status: string
  ago: string
  event: string
  tournament: string
  img: string
}
type Results = {
  status: string
  size: number
  data: ResultsData[]
}
// type AutocompleteInteractionDataOptions = {
//   value: string
//   type: 3
//   name: string
//   focused: boolean
// }
// type AutocompleteInteractionOptions = {
//   type: 1
//   options: AutocompleteInteractionDataOptions[]
//   name: string
//   value: string
// }
// type AutocompleteInteractionData = {
//   name: string
//   options: AutocompleteInteractionOptions[]
//   id: string
// }
type TournamentData = {
  id: string
  name: string
  status: 'ongoing' | 'completed' | 'upcoming'
  prizepool: string
  dates: string
  country: string
  img: string
}
type Tournament = {
  status: string
  size: number
  data: TournamentData[]
}
type PlayerPagination = {
  page: number
  limit: number
  totalElements: number
  totalPages: number
  hasNextPage: boolean
}
type PlayerData = {
  id: string
  url: string
  name: string
  teamTag: string
  country: string
}
type Player = {
  status: string
  pagination: PlayerPagination
  data: PlayerData[]
}
type PlayerTeamData = {
  id: string
  url: string
  name: string
  logo: string
  joined: string
}
type PlayerResultsMatchData = {
  id: string
  url: string
}
type PlayerResultsEventData = {
  name: string
  logo: string
}
type PlayerResultsTeamData = {
  name: string
  tag: string
  logo: string
  points: string
}
type PlayerResultsData = {
  match: PlayerResultsMatchData
  event: PlayerResultsEventData
  teams: PlayerResultsTeamData[]
}
type PlayerInfo = {
  id: string
  url: string
  img: string
  user: string
  name: string
  country: string
  flag: string
}
type PlayerPastTeam = {
  id: string
  url: string
  name: string
  logo: string
  info: string
}
type PlayerResData = {
  info: PlayerInfo
  team: PlayerTeamData
  results: PlayerResultsData[]
  pastTeams: PlayerPastTeam[]
}
type PlayerRes = {
  status: string
  data: PlayerResData
}
type TeamResData = {
  id: string
  url: string
  name: string
  img: string
  country: string
}
type TeamRes = {
  status: string
  region: string
  size: number
  data: TeamResData[]
}
type TeamInfo = {
  name: string
  tag: string
  logo: string
}
type TeamUpcomingMatch = {
  match: {
    id: string
    url: string
  }
  event: {
    name: string
    logo: string
  }
  teams: Array<{
    name: string
    tag: string
    logo: string
  }>
}
type TeamData = {
  info: TeamInfo
  players: PlayerInfo[]
  staff: PlayerInfo[]
  results: PlayerResultsData[]
  upcoming: TeamUpcomingMatch[]
}
type TeamResponse = {
  status: string
  data: TeamData
}