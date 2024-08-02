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
type TeamResponse = {
  status: string
  data: TeamData
}
type EventsData = {
  id?: string
  name: string
  status?: string
  image: string
  url: string
}
type MatchTeam = {
  name: string
  country?: string
}
type MatchTournament = {
  name: string
  image: string
}
type MatchesData = {
  id?: string
  teams: MatchTeam[]
  status: string
  tournament: MatchTournament
  stage: string
  when: number
}
type PlayersData = {
  name: string
  teamTag: string
  country: string
  id: string
}
type PlayerCountry = {
  name: string
  flag: string
}
type PlayerPastTeam = {
  id: string
  url: string
  name: string
}
type PlayerLastResultTeam = {
  name: string
  score: string
}
type PlayerLastResult = {
  id: string
  teams: PlayerLastResultTeam[]
  url: string
}
type PlayerData = {
  avatar: string
  user: string
  realName: string
  country: PlayerCountry
  currentTeam: string
  pastTeams: PlayerPastTeam[]
  lastResults: PlayerLastResult[]
}
type ResultsTeam = {
  name: string
  score: string
  country: string
  winner: boolean
}
type ResultsData = {
  id: string
  teams: ResultsTeam[]
  status: string
  tournament: MatchTournament
  stage: string
  when: number
}
type TeamsData = {
  id: string
  name: string
  url?: string
  image?: string
  country: string
}
type Roster = {
  id: string
  user: string
  url: string
}
type TeamRoster = {
  players: Roster
  staffs: Roster
}
type TeamData = {
  id: string
  name: string
  tag: string
  roster: TeamRoster
  lastResults: PlayerLastResult[]
}