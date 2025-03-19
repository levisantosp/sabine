import { AutocompleteInteraction, Constants, InteractionDataOptions } from "oceanic.js"

type EventsData = {
  id?: string;
  name: string;
  status?: string;
  image: string;
  url: string;
}
type MatchTeam = {
  name: string;
  country?: string;
}
type MatchTournament = {
  name: string;
  image: string;
}
type MatchesData = {
  id?: string;
  teams: MatchTeam[];
  status: string;
  tournament: MatchTournament;
  stage: string;
  when: number;
}
type PlayersData = {
  name: string;
  teamTag: string;
  country: string;
  id: string;
}
type PlayerCountry = {
  name: string;
  flag?: string;
}
type PlayerPastTeam = {
  id: string;
  url: string;
  name: string;
}
type PlayerLastResultTeam = {
  name: string;
  score: string;
}
type PlayerLastResult = {
  id: string;
  teams: PlayerLastResultTeam[];
  url: string;
}
type PlayerCurrentTeam = {
  name: string;
  url: string;
}
type PlayerData = {
  avatar: string;
  user: string;
  realName: string;
  country: PlayerCountry;
  team: PlayerCurrentTeam;
  pastTeams: PlayerPastTeam[];
  lastResults: PlayerLastResult[];
}
type ResultsTeam = {
  name: string;
  score: string;
  country: string;
  winner: boolean;
}
type ResultsData = {
  id: string;
  teams: ResultsTeam[];
  status: string;
  tournament: MatchTournament;
  stage: string;
  when: number;
}
type TeamsData = {
  id: string;
  name: string;
  url?: string;
  image?: string;
  country: string;
}
type Roster = {
  id: string;
  user: string;
  url: string;
}
type TeamRoster = {
  players: Roster[];
  staffs: Roster[];
}
type UpcomingMatchTeam = {
  name: string;
}
type UpcomingMatch = {
  teams: UpcomingMatchTeam[];
  url: string;
}
type TeamData = {
  id: string;
  name: string;
  tag: string;
  logo: string;
  roster: TeamRoster;
  lastResults: PlayerLastResult[];
  upcomingMatches: UpcomingMatch[];
}
type NewsData = {
  title: string;
  description?: string;
  url: string;
  id: string;
}
type LiveFeed = {
  teams: PlayerLastResultTeam[];
  currentMap: string;
  score1: string;
  score2: string;
  id: string | number;
  url: string;
  stage: string;
}