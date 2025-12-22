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

export const TEAMS: Record<League, Team[]> = {
  NBA: [
    { code: 'LAL', name: 'LA Lakers' },
    { code: 'GSW', name: 'Golden State Warriors' },
    { code: 'BOS', name: 'Boston Celtics' },
    { code: 'MIA', name: 'Miami Heat' },
    { code: 'CHI', name: 'Chicago Bulls' },
    { code: 'NYK', name: 'New York Knicks' },
    { code: 'BKN', name: 'Brooklyn Nets' },
    { code: 'PHX', name: 'Phoenix Suns' },
    { code: 'DAL', name: 'Dallas Mavericks' },
    { code: 'DEN', name: 'Denver Nuggets' },
    { code: 'MIL', name: 'Milwaukee Bucks' },
    { code: 'PHI', name: 'Philadelphia 76ers' },
    { code: 'LAC', name: 'LA Clippers' },
    { code: 'TOR', name: 'Toronto Raptors' },
    { code: 'ATL', name: 'Atlanta Hawks' },
  ],
  EPL: [
    { code: 'MCI', name: 'Manchester City' },
    { code: 'ARS', name: 'Arsenal' },
    { code: 'LIV', name: 'Liverpool' },
    { code: 'MUN', name: 'Manchester United' },
    { code: 'CHE', name: 'Chelsea' },
    { code: 'TOT', name: 'Tottenham Hotspur' },
    { code: 'NEW', name: 'Newcastle United' },
    { code: 'AVL', name: 'Aston Villa' },
    { code: 'WHU', name: 'West Ham United' },
    { code: 'BHA', name: 'Brighton & Hove Albion' },
    { code: 'CRY', name: 'Crystal Palace' },
    { code: 'FUL', name: 'Fulham' },
    { code: 'BRE', name: 'Brentford' },
    { code: 'WOL', name: 'Wolverhampton' },
    { code: 'EVE', name: 'Everton' },
  ],
  NFL: [
    { code: 'KC', name: 'Kansas City Chiefs' },
    { code: 'SF', name: 'San Francisco 49ers' },
    { code: 'DAL', name: 'Dallas Cowboys' },
    { code: 'PHI', name: 'Philadelphia Eagles' },
    { code: 'BUF', name: 'Buffalo Bills' },
    { code: 'MIA', name: 'Miami Dolphins' },
    { code: 'BAL', name: 'Baltimore Ravens' },
    { code: 'DET', name: 'Detroit Lions' },
    { code: 'GB', name: 'Green Bay Packers' },
    { code: 'LAR', name: 'LA Rams' },
    { code: 'CLE', name: 'Cleveland Browns' },
    { code: 'NYG', name: 'New York Giants' },
    { code: 'LAC', name: 'LA Chargers' },
    { code: 'SEA', name: 'Seattle Seahawks' },
    { code: 'NE', name: 'New England Patriots' },
  ],
  MLB: [
    { code: 'NYY', name: 'New York Yankees' },
    { code: 'LAD', name: 'LA Dodgers' },
    { code: 'BOS', name: 'Boston Red Sox' },
    { code: 'CHC', name: 'Chicago Cubs' },
    { code: 'ATL', name: 'Atlanta Braves' },
    { code: 'HOU', name: 'Houston Astros' },
    { code: 'PHI', name: 'Philadelphia Phillies' },
    { code: 'TEX', name: 'Texas Rangers' },
    { code: 'SDP', name: 'San Diego Padres' },
    { code: 'NYM', name: 'New York Mets' },
    { code: 'SEA', name: 'Seattle Mariners' },
    { code: 'SF', name: 'San Francisco Giants' },
    { code: 'TBR', name: 'Tampa Bay Rays' },
    { code: 'MIN', name: 'Minnesota Twins' },
    { code: 'BAL', name: 'Baltimore Orioles' },
  ],
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
