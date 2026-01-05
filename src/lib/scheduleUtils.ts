// Schedule utility functions for normalizing EPL/NFL data

import { League } from '@/data/teams';

/**
 * Normalized fixture structure for UI display
 */
export type NormalizedFixture = {
  id: string;
  dateISO: string | null;
  time: string | null;
  homeTeam: string;
  awayTeam: string;
  weekLabel: string | null;
  league: League;
  homeScore?: number | null;
  awayScore?: number | null;
  isLive?: boolean;
  status?: string;
  elapsed?: number | null;
};

/**
 * Date filter types
 */
export type DateFilter = 'today' | 'week' | 'all';

/**
 * Normalize a date string that may contain pipe-separated range values
 * @param s - Date string (may be null, empty, or contain '|')
 * @returns YYYY-MM-DD string or null
 */
export const normalizeDateString = (s: string | null | undefined): string | null => {
  if (!s || typeof s !== 'string' || s.trim() === '') {
    return null;
  }
  
  // Handle pipe-separated date ranges (e.g., '2026-01-03|2026-01-04')
  if (s.includes('|')) {
    const parts = s.split('|');
    const firstDate = parts[0]?.trim();
    // Validate it looks like a date
    if (firstDate && /^\d{4}-\d{2}-\d{2}/.test(firstDate)) {
      return firstDate.slice(0, 10);
    }
    return null;
  }
  
  // Validate basic date format
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }
  
  return null;
};

/**
 * Normalize a time string
 * @param t - Time string (may be null or empty)
 * @returns Time string or null
 */
export const normalizeTimeString = (t: string | null | undefined): string | null => {
  if (!t || typeof t !== 'string' || t.trim() === '') {
    return null;
  }
  return t.trim();
};

/**
 * Convert UK time (GMT/BST) to KST (Korean Standard Time)
 * UK time is 9 hours behind KST (GMT) or 8 hours (BST)
 * For simplicity, we use 9 hours offset (GMT standard)
 * @param ukTime - Time string in HH:mm format (UK time)
 * @param dateISO - Date string in YYYY-MM-DD format (optional, for date overflow handling)
 * @returns Time string in HH:mm format (KST) or null
 */
export const convertUKTimeToKST = (ukTime: string | null | undefined, dateISO?: string | null): { time: string | null; dateISO: string | null } => {
  if (!ukTime || typeof ukTime !== 'string') {
    return { time: null, dateISO: dateISO || null };
  }

  // Parse time (HH:mm format)
  const timeMatch = ukTime.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    return { time: ukTime.trim(), dateISO: dateISO || null }; // Return original if format is invalid
  }

  const ukHours = parseInt(timeMatch[1], 10);
  const ukMinutes = parseInt(timeMatch[2], 10);

  // Add 9 hours for GMT -> KST conversion
  // (BST is 8 hours, but we'll use 9 as standard to cover most cases)
  let kstHours = ukHours + 9;
  let kstMinutes = ukMinutes;
  let dateAdjustment = 0;

  // Handle minutes overflow
  if (kstMinutes >= 60) {
    kstHours += Math.floor(kstMinutes / 60);
    kstMinutes = kstMinutes % 60;
  }

  // Handle hours overflow (next day)
  if (kstHours >= 24) {
    dateAdjustment = Math.floor(kstHours / 24);
    kstHours = kstHours % 24;
  }

  // Format KST time
  const kstTime = `${kstHours.toString().padStart(2, '0')}:${kstMinutes.toString().padStart(2, '0')}`;

  // Adjust date if needed
  let adjustedDateISO = dateISO || null;
  if (dateAdjustment > 0 && adjustedDateISO) {
    const date = new Date(adjustedDateISO + 'T00:00:00');
    date.setDate(date.getDate() + dateAdjustment);
    adjustedDateISO = date.toISOString().slice(0, 10);
  }

  return { time: kstTime, dateISO: adjustedDateISO };
};

/**
 * Normalize a raw fixture row from EPL or NFL table
 * @param row - Raw row from database
 * @param league - League type
 * @returns NormalizedFixture
 */
export const normalizeFixture = (row: any, league: League): NormalizedFixture => {
  const dateISO = normalizeDateString(row.date);
  
  let time: string | null = null;
  let weekLabel: string | null = null;
  let finalDateISO = dateISO;
  
  if (league === 'EPL') {
    // API Sports API에서 온 데이터인 경우, 이미 KST로 변환되었으므로 그대로 사용
    // Supabase에서 온 데이터인 경우, UK 시간을 KST로 변환
    const timeString = normalizeTimeString(row.time);
    if (timeString) {
      // row._fromApiSports 플래그가 있으면 이미 변환된 시간이므로 그대로 사용
      // 또는 날짜가 KST로 변환되었는지 확인 (dateISO가 원본과 다르면 변환됨)
      if (row._fromApiSports || row._kstTime) {
        // API Sports에서 온 데이터: 이미 KST로 변환됨
        time = timeString;
        finalDateISO = dateISO; // 날짜도 이미 변환됨
      } else {
        // Supabase에서 온 데이터: UK 시간을 KST로 변환
        const kstResult = convertUKTimeToKST(timeString, dateISO);
        time = kstResult.time;
        finalDateISO = kstResult.dateISO || dateISO;
      }
    }
    weekLabel = row.matchweek ? `MW ${row.matchweek}` : null;
  } else if (league === 'NFL') {
    // API Sports API에서 온 데이터인 경우, 이미 KST로 변환되었으므로 그대로 사용
    // Supabase에서 온 데이터인 경우, 시간 그대로 사용
    const timeString = normalizeTimeString(row.et_time ?? row.local_time ?? row.time);
    if (timeString) {
      if (row._fromApiSports || row._kstTime) {
        // API Sports에서 온 데이터: 이미 KST로 변환됨
        time = timeString;
        finalDateISO = dateISO;
      } else {
        // Supabase에서 온 데이터: 그대로 사용
        time = timeString;
      }
    }
    weekLabel = row.matchweek ? `Week ${row.matchweek}` : (row.week ? `Week ${row.week}` : null);
  }
  
  return {
    id: row.id || `${finalDateISO}-${row.home_team}-${row.away_team}`,
    dateISO: finalDateISO,
    time,
    homeTeam: row.home_team || '',
    awayTeam: row.away_team || '',
    weekLabel,
    league,
    homeScore: row.home_score ?? null,
    awayScore: row.away_score ?? null,
    isLive: row.is_live ?? false,
    status: row.status ?? null,
    elapsed: row.elapsed ?? null,
  };
};

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Get week start (Sunday) and end (Saturday) as YYYY-MM-DD strings
 */
export const getWeekRangeISO = (): { weekStartISO: string; weekEndISO: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  
  // Week start (Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  
  // Week end (Saturday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    weekStartISO: weekStart.toISOString().slice(0, 10),
    weekEndISO: weekEnd.toISOString().slice(0, 10),
  };
};

/**
 * Check if a date falls within filter criteria (string-based comparison)
 */
export const matchesDateFilter = (dateISO: string | null, filter: DateFilter): boolean => {
  if (!dateISO) return false;
  
  if (filter === 'all') return true;
  
  if (filter === 'today') {
    return dateISO === getTodayISO();
  }
  
  if (filter === 'week') {
    const { weekStartISO, weekEndISO } = getWeekRangeISO();
    return dateISO >= weekStartISO && dateISO <= weekEndISO;
  }
  
  return false;
};

/**
 * Sort fixtures by date (ascending), then by time (time present first)
 */
export const sortFixtures = (fixtures: NormalizedFixture[]): NormalizedFixture[] => {
  return [...fixtures].sort((a, b) => {
    // Null dates go to end
    if (!a.dateISO && !b.dateISO) return 0;
    if (!a.dateISO) return 1;
    if (!b.dateISO) return -1;
    
    // Date comparison
    const dateCompare = a.dateISO.localeCompare(b.dateISO);
    if (dateCompare !== 0) return dateCompare;
    
    // Time comparison (items with time come first)
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
};

/**
 * Get a human-readable date label from YYYY-MM-DD string
 * Uses string comparison to avoid Date parsing issues
 */
export const getDateLabel = (dateISO: string | null): string => {
  if (!dateISO) return '날짜 미정';
  
  const todayISO = getTodayISO();
  
  // Calculate tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().slice(0, 10);
  
  if (dateISO === todayISO) return '오늘';
  if (dateISO === tomorrowISO) return '내일';
  
  // Parse for display (safe since we validated the format)
  const [year, month, day] = dateISO.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  return `${month}월 ${day}일 (${weekDays[date.getDay()]})`;
};
