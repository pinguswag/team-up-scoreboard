// Dummy game data for MVP

import { League } from './teams';

export type Game = {
  id: string;
  league: League;
  homeTeam: string;
  homeTeamCode: string;
  awayTeam: string;
  awayTeamCode: string;
  date: string; // ISO date string
  time: string; // HH:mm format (KST)
  broadcast: string; // 중계 채널
};

// Generate dates relative to today
const today = new Date();
const formatDate = (daysFromNow: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const DUMMY_GAMES: Game[] = [
  // NBA Games
  {
    id: 'nba-1',
    league: 'NBA',
    homeTeam: 'LA Lakers',
    homeTeamCode: 'LAL',
    awayTeam: 'Golden State Warriors',
    awayTeamCode: 'GSW',
    date: formatDate(0),
    time: '11:30',
    broadcast: 'SPOTV',
  },
  {
    id: 'nba-2',
    league: 'NBA',
    homeTeam: 'Boston Celtics',
    homeTeamCode: 'BOS',
    awayTeam: 'Miami Heat',
    awayTeamCode: 'MIA',
    date: formatDate(0),
    time: '09:00',
    broadcast: '한국 중계 없음',
  },
  {
    id: 'nba-3',
    league: 'NBA',
    homeTeam: 'Chicago Bulls',
    homeTeamCode: 'CHI',
    awayTeam: 'New York Knicks',
    awayTeamCode: 'NYK',
    date: formatDate(1),
    time: '10:00',
    broadcast: 'SPOTV',
  },
  {
    id: 'nba-4',
    league: 'NBA',
    homeTeam: 'Phoenix Suns',
    homeTeamCode: 'PHX',
    awayTeam: 'Denver Nuggets',
    awayTeamCode: 'DEN',
    date: formatDate(2),
    time: '12:00',
    broadcast: '미확인',
  },
  {
    id: 'nba-5',
    league: 'NBA',
    homeTeam: 'Milwaukee Bucks',
    homeTeamCode: 'MIL',
    awayTeam: 'Philadelphia 76ers',
    awayTeamCode: 'PHI',
    date: formatDate(3),
    time: '08:30',
    broadcast: 'SPOTV',
  },

  // EPL Games
  {
    id: 'epl-1',
    league: 'EPL',
    homeTeam: 'Manchester City',
    homeTeamCode: 'MCI',
    awayTeam: 'Arsenal',
    awayTeamCode: 'ARS',
    date: formatDate(0),
    time: '22:30',
    broadcast: '쿠팡플레이',
  },
  {
    id: 'epl-2',
    league: 'EPL',
    homeTeam: 'Liverpool',
    homeTeamCode: 'LIV',
    awayTeam: 'Chelsea',
    awayTeamCode: 'CHE',
    date: formatDate(1),
    time: '21:00',
    broadcast: '쿠팡플레이',
  },
  {
    id: 'epl-3',
    league: 'EPL',
    homeTeam: 'Tottenham Hotspur',
    homeTeamCode: 'TOT',
    awayTeam: 'Manchester United',
    awayTeamCode: 'MUN',
    date: formatDate(2),
    time: '00:30',
    broadcast: 'SPOTV',
  },
  {
    id: 'epl-4',
    league: 'EPL',
    homeTeam: 'Newcastle United',
    homeTeamCode: 'NEW',
    awayTeam: 'Aston Villa',
    awayTeamCode: 'AVL',
    date: formatDate(4),
    time: '22:00',
    broadcast: '한국 중계 없음',
  },
  {
    id: 'epl-5',
    league: 'EPL',
    homeTeam: 'West Ham United',
    homeTeamCode: 'WHU',
    awayTeam: 'Brighton & Hove Albion',
    awayTeamCode: 'BHA',
    date: formatDate(5),
    time: '20:00',
    broadcast: '쿠팡플레이',
  },

  // NFL Games
  {
    id: 'nfl-1',
    league: 'NFL',
    homeTeam: 'Kansas City Chiefs',
    homeTeamCode: 'KC',
    awayTeam: 'San Francisco 49ers',
    awayTeamCode: 'SF',
    date: formatDate(0),
    time: '04:25',
    broadcast: 'SPOTV',
  },
  {
    id: 'nfl-2',
    league: 'NFL',
    homeTeam: 'Dallas Cowboys',
    homeTeamCode: 'DAL',
    awayTeam: 'Philadelphia Eagles',
    awayTeamCode: 'PHI',
    date: formatDate(1),
    time: '02:00',
    broadcast: '한국 중계 없음',
  },
  {
    id: 'nfl-3',
    league: 'NFL',
    homeTeam: 'Buffalo Bills',
    homeTeamCode: 'BUF',
    awayTeam: 'Miami Dolphins',
    awayTeamCode: 'MIA',
    date: formatDate(3),
    time: '05:20',
    broadcast: 'SPOTV',
  },
  {
    id: 'nfl-4',
    league: 'NFL',
    homeTeam: 'Baltimore Ravens',
    homeTeamCode: 'BAL',
    awayTeam: 'Detroit Lions',
    awayTeamCode: 'DET',
    date: formatDate(5),
    time: '03:00',
    broadcast: '미확인',
  },
  {
    id: 'nfl-5',
    league: 'NFL',
    homeTeam: 'Green Bay Packers',
    homeTeamCode: 'GB',
    awayTeam: 'LA Rams',
    awayTeamCode: 'LAR',
    date: formatDate(6),
    time: '06:15',
    broadcast: 'SPOTV',
  },

  // MLB Games
  {
    id: 'mlb-1',
    league: 'MLB',
    homeTeam: 'New York Yankees',
    homeTeamCode: 'NYY',
    awayTeam: 'LA Dodgers',
    awayTeamCode: 'LAD',
    date: formatDate(0),
    time: '08:05',
    broadcast: 'SPOTV',
  },
  {
    id: 'mlb-2',
    league: 'MLB',
    homeTeam: 'Boston Red Sox',
    homeTeamCode: 'BOS',
    awayTeam: 'Chicago Cubs',
    awayTeamCode: 'CHC',
    date: formatDate(1),
    time: '07:10',
    broadcast: '한국 중계 없음',
  },
  {
    id: 'mlb-3',
    league: 'MLB',
    homeTeam: 'Atlanta Braves',
    homeTeamCode: 'ATL',
    awayTeam: 'Houston Astros',
    awayTeamCode: 'HOU',
    date: formatDate(2),
    time: '09:40',
    broadcast: 'SPOTV',
  },
  {
    id: 'mlb-4',
    league: 'MLB',
    homeTeam: 'Philadelphia Phillies',
    homeTeamCode: 'PHI',
    awayTeam: 'Texas Rangers',
    awayTeamCode: 'TEX',
    date: formatDate(4),
    time: '07:05',
    broadcast: '쿠팡플레이',
  },
  {
    id: 'mlb-5',
    league: 'MLB',
    homeTeam: 'San Diego Padres',
    homeTeamCode: 'SDP',
    awayTeam: 'New York Mets',
    awayTeamCode: 'NYM',
    date: formatDate(6),
    time: '10:40',
    broadcast: 'SPOTV',
  },
];
