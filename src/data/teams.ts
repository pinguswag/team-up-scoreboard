// Team data for all supported leagues

export type Team = {
  code: string;
  name: string;       // Display name (짧은 이름)
  fullName: string;   // Full name (DB에서 매칭용)
};

export type League = 'NBA' | 'EPL' | 'NFL' | 'MLB';

// 리그별 활성 상태 (준비중 여부)
export const LEAGUE_STATUS: Record<League, { active: boolean; message?: string }> = {
  NBA: { active: false, message: '준비중입니다. 곧 서비스 예정!' },
  EPL: { active: true },
  NFL: { active: true },
  MLB: { active: false, message: '준비중입니다. 곧 서비스 예정!' },
};

export const LEAGUES: { id: League; name: string; fullName: string }[] = [
  { id: 'NBA', name: 'NBA', fullName: 'National Basketball Association' },
  { id: 'EPL', name: 'EPL', fullName: 'English Premier League' },
  { id: 'NFL', name: 'NFL', fullName: 'National Football League' },
  { id: 'MLB', name: 'MLB', fullName: 'Major League Baseball' },
];

// NBA 30팀 (준비중)
const NBA_TEAMS: Team[] = [
  { code: 'ATL', name: 'Atlanta Hawks', fullName: 'Atlanta Hawks' },
  { code: 'BOS', name: 'Boston Celtics', fullName: 'Boston Celtics' },
  { code: 'BKN', name: 'Brooklyn Nets', fullName: 'Brooklyn Nets' },
  { code: 'CHA', name: 'Charlotte Hornets', fullName: 'Charlotte Hornets' },
  { code: 'CHI', name: 'Chicago Bulls', fullName: 'Chicago Bulls' },
  { code: 'CLE', name: 'Cleveland Cavaliers', fullName: 'Cleveland Cavaliers' },
  { code: 'DAL', name: 'Dallas Mavericks', fullName: 'Dallas Mavericks' },
  { code: 'DEN', name: 'Denver Nuggets', fullName: 'Denver Nuggets' },
  { code: 'DET', name: 'Detroit Pistons', fullName: 'Detroit Pistons' },
  { code: 'GSW', name: 'Golden State Warriors', fullName: 'Golden State Warriors' },
  { code: 'HOU', name: 'Houston Rockets', fullName: 'Houston Rockets' },
  { code: 'IND', name: 'Indiana Pacers', fullName: 'Indiana Pacers' },
  { code: 'LAC', name: 'LA Clippers', fullName: 'LA Clippers' },
  { code: 'LAL', name: 'LA Lakers', fullName: 'Los Angeles Lakers' },
  { code: 'MEM', name: 'Memphis Grizzlies', fullName: 'Memphis Grizzlies' },
  { code: 'MIA', name: 'Miami Heat', fullName: 'Miami Heat' },
  { code: 'MIL', name: 'Milwaukee Bucks', fullName: 'Milwaukee Bucks' },
  { code: 'MIN', name: 'Minnesota Timberwolves', fullName: 'Minnesota Timberwolves' },
  { code: 'NOP', name: 'New Orleans Pelicans', fullName: 'New Orleans Pelicans' },
  { code: 'NYK', name: 'New York Knicks', fullName: 'New York Knicks' },
  { code: 'OKC', name: 'Oklahoma City Thunder', fullName: 'Oklahoma City Thunder' },
  { code: 'ORL', name: 'Orlando Magic', fullName: 'Orlando Magic' },
  { code: 'PHI', name: 'Philadelphia 76ers', fullName: 'Philadelphia 76ers' },
  { code: 'PHX', name: 'Phoenix Suns', fullName: 'Phoenix Suns' },
  { code: 'POR', name: 'Portland Trail Blazers', fullName: 'Portland Trail Blazers' },
  { code: 'SAC', name: 'Sacramento Kings', fullName: 'Sacramento Kings' },
  { code: 'SAS', name: 'San Antonio Spurs', fullName: 'San Antonio Spurs' },
  { code: 'TOR', name: 'Toronto Raptors', fullName: 'Toronto Raptors' },
  { code: 'UTA', name: 'Utah Jazz', fullName: 'Utah Jazz' },
  { code: 'WAS', name: 'Washington Wizards', fullName: 'Washington Wizards' },
];

// EPL 20팀 (2024-25 시즌) - fullName은 DB의 home_team/away_team 값과 매칭
const EPL_TEAMS: Team[] = [
  { code: 'ARS', name: 'Arsenal', fullName: 'Arsenal' },
  { code: 'AVL', name: 'Aston Villa', fullName: 'Aston Villa' },
  { code: 'BOU', name: 'Bournemouth', fullName: 'Bournemouth' },
  { code: 'BRE', name: 'Brentford', fullName: 'Brentford' },
  { code: 'BHA', name: 'Brighton', fullName: 'Brighton' },
  { code: 'CHE', name: 'Chelsea', fullName: 'Chelsea' },
  { code: 'CRY', name: 'Crystal Palace', fullName: 'Crystal Palace' },
  { code: 'EVE', name: 'Everton', fullName: 'Everton' },
  { code: 'FUL', name: 'Fulham', fullName: 'Fulham' },
  { code: 'IPS', name: 'Ipswich', fullName: 'Ipswich' },
  { code: 'LEI', name: 'Leicester', fullName: 'Leicester' },
  { code: 'LIV', name: 'Liverpool', fullName: 'Liverpool' },
  { code: 'MCI', name: 'Man City', fullName: 'Man City' },
  { code: 'MUN', name: 'Man Utd', fullName: 'Man Utd' },
  { code: 'NEW', name: 'Newcastle', fullName: 'Newcastle' },
  { code: 'NFO', name: "Nott'm Forest", fullName: "Nott'm Forest" },
  { code: 'SOU', name: 'Southampton', fullName: 'Southampton' },
  { code: 'TOT', name: 'Spurs', fullName: 'Spurs' },
  { code: 'WHU', name: 'West Ham', fullName: 'West Ham' },
  { code: 'WOL', name: 'Wolves', fullName: 'Wolves' },
];

// NFL 32팀 - fullName은 DB의 home_team/away_team 값과 매칭
const NFL_TEAMS: Team[] = [
  { code: 'ARI', name: 'Cardinals', fullName: 'Arizona Cardinals' },
  { code: 'ATL', name: 'Falcons', fullName: 'Atlanta Falcons' },
  { code: 'BAL', name: 'Ravens', fullName: 'Baltimore Ravens' },
  { code: 'BUF', name: 'Bills', fullName: 'Buffalo Bills' },
  { code: 'CAR', name: 'Panthers', fullName: 'Carolina Panthers' },
  { code: 'CHI', name: 'Bears', fullName: 'Chicago Bears' },
  { code: 'CIN', name: 'Bengals', fullName: 'Cincinnati Bengals' },
  { code: 'CLE', name: 'Browns', fullName: 'Cleveland Browns' },
  { code: 'DAL', name: 'Cowboys', fullName: 'Dallas Cowboys' },
  { code: 'DEN', name: 'Broncos', fullName: 'Denver Broncos' },
  { code: 'DET', name: 'Lions', fullName: 'Detroit Lions' },
  { code: 'GB', name: 'Packers', fullName: 'Green Bay Packers' },
  { code: 'HOU', name: 'Texans', fullName: 'Houston Texans' },
  { code: 'IND', name: 'Colts', fullName: 'Indianapolis Colts' },
  { code: 'JAX', name: 'Jaguars', fullName: 'Jacksonville Jaguars' },
  { code: 'KC', name: 'Chiefs', fullName: 'Kansas City Chiefs' },
  { code: 'LV', name: 'Raiders', fullName: 'Las Vegas Raiders' },
  { code: 'LAC', name: 'Chargers', fullName: 'Los Angeles Chargers' },
  { code: 'LAR', name: 'Rams', fullName: 'Los Angeles Rams' },
  { code: 'MIA', name: 'Dolphins', fullName: 'Miami Dolphins' },
  { code: 'MIN', name: 'Vikings', fullName: 'Minnesota Vikings' },
  { code: 'NE', name: 'Patriots', fullName: 'New England Patriots' },
  { code: 'NO', name: 'Saints', fullName: 'New Orleans Saints' },
  { code: 'NYG', name: 'Giants', fullName: 'New York Giants' },
  { code: 'NYJ', name: 'Jets', fullName: 'New York Jets' },
  { code: 'PHI', name: 'Eagles', fullName: 'Philadelphia Eagles' },
  { code: 'PIT', name: 'Steelers', fullName: 'Pittsburgh Steelers' },
  { code: 'SF', name: '49ers', fullName: 'San Francisco 49ers' },
  { code: 'SEA', name: 'Seahawks', fullName: 'Seattle Seahawks' },
  { code: 'TB', name: 'Buccaneers', fullName: 'Tampa Bay Buccaneers' },
  { code: 'TEN', name: 'Titans', fullName: 'Tennessee Titans' },
  { code: 'WAS', name: 'Commanders', fullName: 'Washington Commanders' },
];

// MLB 30팀 (준비중)
const MLB_TEAMS: Team[] = [
  { code: 'ARI', name: 'Diamondbacks', fullName: 'Arizona Diamondbacks' },
  { code: 'ATL', name: 'Braves', fullName: 'Atlanta Braves' },
  { code: 'BAL', name: 'Orioles', fullName: 'Baltimore Orioles' },
  { code: 'BOS', name: 'Red Sox', fullName: 'Boston Red Sox' },
  { code: 'CHC', name: 'Cubs', fullName: 'Chicago Cubs' },
  { code: 'CWS', name: 'White Sox', fullName: 'Chicago White Sox' },
  { code: 'CIN', name: 'Reds', fullName: 'Cincinnati Reds' },
  { code: 'CLE', name: 'Guardians', fullName: 'Cleveland Guardians' },
  { code: 'COL', name: 'Rockies', fullName: 'Colorado Rockies' },
  { code: 'DET', name: 'Tigers', fullName: 'Detroit Tigers' },
  { code: 'HOU', name: 'Astros', fullName: 'Houston Astros' },
  { code: 'KC', name: 'Royals', fullName: 'Kansas City Royals' },
  { code: 'LAA', name: 'Angels', fullName: 'Los Angeles Angels' },
  { code: 'LAD', name: 'Dodgers', fullName: 'Los Angeles Dodgers' },
  { code: 'MIA', name: 'Marlins', fullName: 'Miami Marlins' },
  { code: 'MIL', name: 'Brewers', fullName: 'Milwaukee Brewers' },
  { code: 'MIN', name: 'Twins', fullName: 'Minnesota Twins' },
  { code: 'NYM', name: 'Mets', fullName: 'New York Mets' },
  { code: 'NYY', name: 'Yankees', fullName: 'New York Yankees' },
  { code: 'OAK', name: 'Athletics', fullName: 'Oakland Athletics' },
  { code: 'PHI', name: 'Phillies', fullName: 'Philadelphia Phillies' },
  { code: 'PIT', name: 'Pirates', fullName: 'Pittsburgh Pirates' },
  { code: 'SD', name: 'Padres', fullName: 'San Diego Padres' },
  { code: 'SF', name: 'Giants', fullName: 'San Francisco Giants' },
  { code: 'SEA', name: 'Mariners', fullName: 'Seattle Mariners' },
  { code: 'STL', name: 'Cardinals', fullName: 'St. Louis Cardinals' },
  { code: 'TB', name: 'Rays', fullName: 'Tampa Bay Rays' },
  { code: 'TEX', name: 'Rangers', fullName: 'Texas Rangers' },
  { code: 'TOR', name: 'Blue Jays', fullName: 'Toronto Blue Jays' },
  { code: 'WSH', name: 'Nationals', fullName: 'Washington Nationals' },
];

export const TEAMS: Record<League, Team[]> = {
  NBA: NBA_TEAMS,
  EPL: EPL_TEAMS,
  NFL: NFL_TEAMS,
  MLB: MLB_TEAMS,
};

// Helper: fullName으로 팀 코드 찾기
export const getTeamCodeByFullName = (league: League, fullName: string): string | null => {
  const team = TEAMS[league].find(t => 
    t.fullName.toLowerCase() === fullName.toLowerCase() ||
    t.name.toLowerCase() === fullName.toLowerCase()
  );
  return team?.code || null;
};

// Helper: 팀 코드로 fullName 찾기
export const getTeamFullNameByCode = (league: League, code: string): string | null => {
  const team = TEAMS[league].find(t => t.code === code);
  return team?.fullName || null;
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
