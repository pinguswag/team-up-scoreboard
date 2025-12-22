// Team data for all supported leagues

export type Team = {
  code: string;
  name: string;
  logo?: string;
};

export type League = 'NBA' | 'EPL' | 'NFL' | 'MLB';

export const LEAGUES: { id: League; name: string; fullName: string }[] = [
  { id: 'NBA', name: 'NBA', fullName: 'National Basketball Association' },
  { id: 'EPL', name: 'EPL', fullName: 'English Premier League' },
  { id: 'NFL', name: 'NFL', fullName: 'National Football League' },
  { id: 'MLB', name: 'MLB', fullName: 'Major League Baseball' },
];

// NBA 30팀
const NBA_TEAMS: Team[] = [
  { code: 'ATL', name: 'Atlanta Hawks' },
  { code: 'BOS', name: 'Boston Celtics' },
  { code: 'BKN', name: 'Brooklyn Nets' },
  { code: 'CHA', name: 'Charlotte Hornets' },
  { code: 'CHI', name: 'Chicago Bulls' },
  { code: 'CLE', name: 'Cleveland Cavaliers' },
  { code: 'DAL', name: 'Dallas Mavericks' },
  { code: 'DEN', name: 'Denver Nuggets' },
  { code: 'DET', name: 'Detroit Pistons' },
  { code: 'GSW', name: 'Golden State Warriors' },
  { code: 'HOU', name: 'Houston Rockets' },
  { code: 'IND', name: 'Indiana Pacers' },
  { code: 'LAC', name: 'LA Clippers' },
  { code: 'LAL', name: 'LA Lakers' },
  { code: 'MEM', name: 'Memphis Grizzlies' },
  { code: 'MIA', name: 'Miami Heat' },
  { code: 'MIL', name: 'Milwaukee Bucks' },
  { code: 'MIN', name: 'Minnesota Timberwolves' },
  { code: 'NOP', name: 'New Orleans Pelicans' },
  { code: 'NYK', name: 'New York Knicks' },
  { code: 'OKC', name: 'Oklahoma City Thunder' },
  { code: 'ORL', name: 'Orlando Magic' },
  { code: 'PHI', name: 'Philadelphia 76ers' },
  { code: 'PHX', name: 'Phoenix Suns' },
  { code: 'POR', name: 'Portland Trail Blazers' },
  { code: 'SAC', name: 'Sacramento Kings' },
  { code: 'SAS', name: 'San Antonio Spurs' },
  { code: 'TOR', name: 'Toronto Raptors' },
  { code: 'UTA', name: 'Utah Jazz' },
  { code: 'WAS', name: 'Washington Wizards' },
];

// EPL 20팀 (2024-25 시즌)
const EPL_TEAMS: Team[] = [
  { code: 'ARS', name: 'Arsenal' },
  { code: 'AVL', name: 'Aston Villa' },
  { code: 'BOU', name: 'Bournemouth' },
  { code: 'BRE', name: 'Brentford' },
  { code: 'BHA', name: 'Brighton' },
  { code: 'CHE', name: 'Chelsea' },
  { code: 'CRY', name: 'Crystal Palace' },
  { code: 'EVE', name: 'Everton' },
  { code: 'FUL', name: 'Fulham' },
  { code: 'IPS', name: 'Ipswich Town' },
  { code: 'LEI', name: 'Leicester City' },
  { code: 'LIV', name: 'Liverpool' },
  { code: 'MCI', name: 'Manchester City' },
  { code: 'MUN', name: 'Manchester United' },
  { code: 'NEW', name: 'Newcastle United' },
  { code: 'NFO', name: 'Nottingham Forest' },
  { code: 'SOU', name: 'Southampton' },
  { code: 'TOT', name: 'Tottenham' },
  { code: 'WHU', name: 'West Ham' },
  { code: 'WOL', name: 'Wolves' },
];

// NFL 32팀
const NFL_TEAMS: Team[] = [
  { code: 'ARI', name: 'Arizona Cardinals' },
  { code: 'ATL', name: 'Atlanta Falcons' },
  { code: 'BAL', name: 'Baltimore Ravens' },
  { code: 'BUF', name: 'Buffalo Bills' },
  { code: 'CAR', name: 'Carolina Panthers' },
  { code: 'CHI', name: 'Chicago Bears' },
  { code: 'CIN', name: 'Cincinnati Bengals' },
  { code: 'CLE', name: 'Cleveland Browns' },
  { code: 'DAL', name: 'Dallas Cowboys' },
  { code: 'DEN', name: 'Denver Broncos' },
  { code: 'DET', name: 'Detroit Lions' },
  { code: 'GB', name: 'Green Bay Packers' },
  { code: 'HOU', name: 'Houston Texans' },
  { code: 'IND', name: 'Indianapolis Colts' },
  { code: 'JAX', name: 'Jacksonville Jaguars' },
  { code: 'KC', name: 'Kansas City Chiefs' },
  { code: 'LV', name: 'Las Vegas Raiders' },
  { code: 'LAC', name: 'LA Chargers' },
  { code: 'LAR', name: 'LA Rams' },
  { code: 'MIA', name: 'Miami Dolphins' },
  { code: 'MIN', name: 'Minnesota Vikings' },
  { code: 'NE', name: 'New England Patriots' },
  { code: 'NO', name: 'New Orleans Saints' },
  { code: 'NYG', name: 'New York Giants' },
  { code: 'NYJ', name: 'New York Jets' },
  { code: 'PHI', name: 'Philadelphia Eagles' },
  { code: 'PIT', name: 'Pittsburgh Steelers' },
  { code: 'SF', name: 'San Francisco 49ers' },
  { code: 'SEA', name: 'Seattle Seahawks' },
  { code: 'TB', name: 'Tampa Bay Buccaneers' },
  { code: 'TEN', name: 'Tennessee Titans' },
  { code: 'WAS', name: 'Washington Commanders' },
];

// MLB 30팀
const MLB_TEAMS: Team[] = [
  { code: 'ARI', name: 'Arizona Diamondbacks' },
  { code: 'ATL', name: 'Atlanta Braves' },
  { code: 'BAL', name: 'Baltimore Orioles' },
  { code: 'BOS', name: 'Boston Red Sox' },
  { code: 'CHC', name: 'Chicago Cubs' },
  { code: 'CWS', name: 'Chicago White Sox' },
  { code: 'CIN', name: 'Cincinnati Reds' },
  { code: 'CLE', name: 'Cleveland Guardians' },
  { code: 'COL', name: 'Colorado Rockies' },
  { code: 'DET', name: 'Detroit Tigers' },
  { code: 'HOU', name: 'Houston Astros' },
  { code: 'KC', name: 'Kansas City Royals' },
  { code: 'LAA', name: 'LA Angels' },
  { code: 'LAD', name: 'LA Dodgers' },
  { code: 'MIA', name: 'Miami Marlins' },
  { code: 'MIL', name: 'Milwaukee Brewers' },
  { code: 'MIN', name: 'Minnesota Twins' },
  { code: 'NYM', name: 'New York Mets' },
  { code: 'NYY', name: 'New York Yankees' },
  { code: 'OAK', name: 'Oakland Athletics' },
  { code: 'PHI', name: 'Philadelphia Phillies' },
  { code: 'PIT', name: 'Pittsburgh Pirates' },
  { code: 'SD', name: 'San Diego Padres' },
  { code: 'SF', name: 'San Francisco Giants' },
  { code: 'SEA', name: 'Seattle Mariners' },
  { code: 'STL', name: 'St. Louis Cardinals' },
  { code: 'TB', name: 'Tampa Bay Rays' },
  { code: 'TEX', name: 'Texas Rangers' },
  { code: 'TOR', name: 'Toronto Blue Jays' },
  { code: 'WSH', name: 'Washington Nationals' },
];

export const TEAMS: Record<League, Team[]> = {
  NBA: NBA_TEAMS,
  EPL: EPL_TEAMS,
  NFL: NFL_TEAMS,
  MLB: MLB_TEAMS,
};

export const getLeagueColor = (league: League): string => {
  const colors: Record<League, string> = {
    NBA: 'bg-league-nba',
    EPL: 'bg-league-epl',
    NFL: 'bg-league-nfl',
    MLB: 'bg-league-mlb',
  };
  return colors[league];
};

export const getLeagueTextColor = (league: League): string => {
  const colors: Record<League, string> = {
    NBA: 'text-league-nba',
    EPL: 'text-league-epl',
    NFL: 'text-league-nfl',
    MLB: 'text-league-mlb',
  };
  return colors[league];
};
