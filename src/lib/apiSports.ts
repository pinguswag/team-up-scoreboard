// API Sports API 클라이언트
// API 키는 환경 변수 VITE_API_SPORTS_KEY에서 가져옵니다

import { League } from '@/data/teams';

// API Sports API 설정
const API_SPORTS_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_SPORTS_KEY;

/**
 * API Sports API 응답 타입
 */
export type ApiSportsFixture = {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string; // ISO 8601 format
    timestamp: number;
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
};

export type ApiSportsFixtureResponse = {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: ApiSportsFixture[];
};

export type ApiSportsTeamResponse = {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: Array<{
    team: {
      id: number;
      name: string;
      code: string | null;
      country: string;
      founded: number | null;
      national: boolean;
      logo: string;
    };
    venue: {
      id: number;
      name: string;
      address: string | null;
      city: string;
      capacity: number | null;
      surface: string | null;
      image: string | null;
    };
  }>;
};

/**
 * 리그별 API Sports League ID
 */
export const LEAGUE_IDS: Record<League, number | null> = {
  EPL: 39, // Premier League
  NFL: null, // NFL은 별도 API 필요
  NBA: null, // NBA는 별도 API 필요
  MLB: null, // MLB는 별도 API 필요
};

/**
 * API Sports API 요청 헤더
 * api-sports.io는 x-apisports-key 헤더를 사용합니다
 */
const getHeaders = () => {
  if (!API_KEY) {
    throw new Error('API Sports API 키가 설정되지 않았습니다. VITE_API_SPORTS_KEY 환경 변수를 설정해주세요.');
  }
  return {
    'x-apisports-key': API_KEY,
  };
};

const API_SPORTS_TEAM_NAME_OVERRIDES: Partial<Record<League, Record<string, string>>> = {
  EPL: {
    'Man City': 'Manchester City',
    'Man Utd': 'Manchester United',
    Spurs: 'Tottenham Hotspur',
    Newcastle: 'Newcastle United',
    Brighton: 'Brighton & Hove Albion',
    'West Ham': 'West Ham United',
    Wolves: 'Wolverhampton Wanderers',
    "Nott'm Forest": 'Nottingham Forest',
    Ipswich: 'Ipswich Town',
    Bournemouth: 'AFC Bournemouth',
  },
};

const normalizeTeamKey = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const getApiSportsTeamName = (league: League, teamName: string): string => {
  const overrides = API_SPORTS_TEAM_NAME_OVERRIDES[league];
  if (!overrides) return teamName;
  const normalized = normalizeTeamKey(teamName);
  const override = Object.entries(overrides).find(
    ([key]) => normalizeTeamKey(key) === normalized
  );
  return override ? override[1] : teamName;
};

const fetchTeamSearch = async (
  searchName: string,
  leagueId: number
): Promise<Array<{ team: { id: number; name: string } }>> => {
  const response = await fetch(
    `${API_SPORTS_BASE_URL}/teams?league=${leagueId}&search=${encodeURIComponent(searchName)}&season=${new Date().getFullYear()}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    console.error('Team search failed:', response.statusText);
    return [];
  }

  const data: { response: Array<{ team: { id: number; name: string } }> } = await response.json();
  return data.response ?? [];
};

/**
 * API Sports API에서 팀 ID를 가져옵니다
 * @param teamName - 팀 이름
 * @param leagueId - 리그 ID
 * @param league - 리그 타입
 * @returns 팀 ID 또는 null
 */
export const getTeamId = async (teamName: string, leagueId: number, league: League): Promise<number | null> => {
  if (!API_KEY) return null;

  try {
    const searchName = getApiSportsTeamName(league, teamName);
    let responseItems = await fetchTeamSearch(searchName, leagueId);

    if (responseItems.length === 0 && searchName !== teamName) {
      responseItems = await fetchTeamSearch(teamName, leagueId);
    }

    if (responseItems.length > 0) {
      // 가장 유사한 팀 이름 매칭
      const team = responseItems.find(t => 
        t.team.name.toLowerCase().includes(teamName.toLowerCase()) ||
        teamName.toLowerCase().includes(t.team.name.toLowerCase())
      ) || responseItems[0];
      return team.team.id;
    }

    return null;
  } catch (error) {
    console.error('Error fetching team ID:', error);
    return null;
  }
};

/**
 * 여러 팀 이름에 대한 팀 ID를 가져옵니다 (배치 처리)
 * @param teamNames - 팀 이름 배열
 * @param leagueId - 리그 ID
 * @returns 팀 이름과 ID의 맵
 */
export const getTeamIds = async (
  teamNames: string[],
  leagueId: number,
  league: League
): Promise<Map<string, number>> => {
  const teamIdMap = new Map<string, number>();
  
  if (!API_KEY) return teamIdMap;

  // 각 팀에 대해 ID 조회
  await Promise.all(
    teamNames.map(async (teamName) => {
      const teamId = await getTeamId(teamName, leagueId, league);
      if (teamId) {
        teamIdMap.set(teamName, teamId);
      }
    })
  );

  return teamIdMap;
};

/**
 * API Sports API에서 경기 일정을 가져옵니다
 * @param league - 리그 타입
 * @param teamIds - 팀 ID 배열
 * @param dateFrom - 시작 날짜 (YYYY-MM-DD)
 * @param dateTo - 종료 날짜 (YYYY-MM-DD)
 * @returns 경기 일정 배열
 */
export const fetchFixtures = async (
  league: League,
  teamIds: number[],
  dateFrom?: string,
  dateTo?: string
): Promise<ApiSportsFixture[]> => {
  if (!API_KEY) {
    throw new Error('API Sports API 키가 설정되지 않았습니다.');
  }

  const leagueId = LEAGUE_IDS[league];
  if (!leagueId) {
    console.warn(`리그 ${league}는 API Sports API에서 지원하지 않습니다.`);
    return [];
  }

  if (teamIds.length === 0) {
    return [];
  }

  try {
    // 날짜 범위 설정 (기본값: 오늘부터 30일 후까지)
    const today = new Date();
    const fromDate = dateFrom || today.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 30);
    const toDate = dateTo || futureDate.toISOString().split('T')[0];

    // 각 팀별로 요청 (API 제한 고려)
    const allFixtures: ApiSportsFixture[] = [];
    const uniqueFixtureIds = new Set<number>();

    // API 호출을 배치로 처리 (동시 요청 제한 방지)
    for (const teamId of teamIds) {
      const url = new URL(`${API_SPORTS_BASE_URL}/fixtures`);
      url.searchParams.append('league', leagueId.toString());
      url.searchParams.append('season', new Date().getFullYear().toString());
      url.searchParams.append('team', teamId.toString());
      url.searchParams.append('from', fromDate);
      url.searchParams.append('to', toDate);
      
      const response = await fetch(url.toString(), {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fixture fetch failed for team ${teamId}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        continue;
      }

      const data: ApiSportsFixtureResponse = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        console.error('API Sports API errors:', data.errors);
        continue;
      }

      // 중복 제거 (같은 경기가 여러 팀 요청에 포함될 수 있음)
      data.response?.forEach((fixture) => {
        if (!uniqueFixtureIds.has(fixture.fixture.id)) {
          uniqueFixtureIds.add(fixture.fixture.id);
          allFixtures.push(fixture);
        }
      });

      // API rate limit 방지를 위한 짧은 지연
      if (teamIds.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allFixtures;
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
};

/**
 * API Sports API 응답을 내부 형식으로 변환
 * @param fixture - API Sports Fixture
 * @param league - 리그 타입
 * @returns 정규화된 경기 정보 (Supabase 형식과 호환)
 */
export const convertApiSportsFixture = (
  fixture: ApiSportsFixture,
  league: League
): {
  id: string;
  date: string;
  time: string | null;
  home_team: string;
  away_team: string;
  matchweek: number | null;
  status: string;
  _fromApiSports?: boolean;
  _kstTime?: boolean;
} => {
  // API Sports는 UTC 시간을 ISO 8601 형식으로 반환합니다
  // 예: "2024-01-15T15:00:00+00:00" 또는 "2024-01-15T15:00:00Z"
  const fixtureDateString = fixture.fixture.date;
  const fixtureDate = new Date(fixtureDateString);
  
  // UTC 시간에서 직접 KST 시간 계산 (UTC + 9시간)
  const utcHours = fixtureDate.getUTCHours();
  const utcMinutes = fixtureDate.getUTCMinutes();
  
  // UTC 시간에 9시간을 더해서 KST 계산
  let kstHours = utcHours + 9;
  let kstMinutes = utcMinutes;
  let dateOffset = 0;
  
  // 자정 넘어가는 경우 처리
  if (kstHours >= 24) {
    dateOffset = Math.floor(kstHours / 24);
    kstHours = kstHours % 24;
  }
  
  // KST 시간 포맷팅
  const kstTime = `${String(kstHours).padStart(2, '0')}:${String(kstMinutes).padStart(2, '0')}`;
  
  // 날짜 계산 (UTC 날짜 기준)
  const utcYear = fixtureDate.getUTCFullYear();
  const utcMonth = fixtureDate.getUTCMonth();
  const utcDay = fixtureDate.getUTCDate();
  
  // 날짜 오프셋 적용
  const finalDate = new Date(Date.UTC(utcYear, utcMonth, utcDay + dateOffset));
  const finalDateISO = `${finalDate.getUTCFullYear()}-${String(finalDate.getUTCMonth() + 1).padStart(2, '0')}-${String(finalDate.getUTCDate()).padStart(2, '0')}`;
  
  console.log('KST 변환 결과:', { kstTime, finalDateISO });

  // Matchweek 추출 (라운드 정보에서)
  // 예: "Regular Season - 1", "Matchweek 1" 등
  const matchweekMatch = fixture.league.round?.match(/Matchweek\s*(\d+)/i) || 
                         fixture.league.round?.match(/(\d+)/);
  const matchweek = matchweekMatch ? parseInt(matchweekMatch[1], 10) : null;

  return {
    id: fixture.fixture.id.toString(),
    date: finalDateISO,
    time: kstTime,
    home_team: fixture.teams.home.name,
    away_team: fixture.teams.away.name,
    matchweek,
    status: fixture.fixture.status.short,
    _fromApiSports: true, // API Sports에서 온 데이터임을 표시
    _kstTime: true, // 이미 KST로 변환되었음을 표시
  };
};
