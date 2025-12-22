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
 * Normalize a raw fixture row from EPL or NFL table
 * @param row - Raw row from database
 * @param league - League type
 * @returns NormalizedFixture
 */
export const normalizeFixture = (row: any, league: League): NormalizedFixture => {
  const dateISO = normalizeDateString(row.date);
  
  let time: string | null = null;
  let weekLabel: string | null = null;
  
  if (league === 'EPL') {
    time = normalizeTimeString(row.time);
    weekLabel = row.matchweek ? `MW ${row.matchweek}` : null;
  } else if (league === 'NFL') {
    // NFL may have et_time or local_time
    time = normalizeTimeString(row.et_time ?? row.local_time ?? row.time);
    weekLabel = row.week ? `Week ${row.week}` : null;
  }
  
  return {
    id: row.id || `${dateISO}-${row.home_team}-${row.away_team}`,
    dateISO,
    time,
    homeTeam: row.home_team || '',
    awayTeam: row.away_team || '',
    weekLabel,
    league,
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
