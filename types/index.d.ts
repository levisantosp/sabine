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
type TeamData = {
  name: string
  score: string
}
type HistoryData = {
  match: string
  teams: TeamData[]
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