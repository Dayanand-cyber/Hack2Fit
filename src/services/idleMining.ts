import { LeaderboardEntry } from '../types';

const STORAGE_KEY_USER_STATS = 'comeback_user_stats';
const STORAGE_KEY_LAST_ACTIVE = 'comeback_last_active_timestamp';

export interface UserStats {
  username: string;
  tokens: number;
  streakDays: number;
  totalIdleMinutes: number;
  lastClaimTime: number;
}

export const INITIAL_USER_STATS: UserStats = {
  username: 'Dayanand',
  tokens: 0,
  streakDays: 0,
  totalIdleMinutes: 0,
  lastClaimTime: Date.now()
};

export const INITIAL_PEERS: LeaderboardEntry[] = [
  {
    id: 'peer-1',
    username: 'Elena Rostova',
    handle: '@neuro_monk',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    tokens: 432,
    streakDays: 14,
    isCurrentUser: false,
    status: 'offline_mining',
    lastActive: 'Offline for 4h 12m'
  },
  {
    id: 'peer-2',
    username: 'Marcus Chen',
    handle: '@circadian_zen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    tokens: 389,
    streakDays: 9,
    isCurrentUser: false,
    status: 'asleep',
    lastActive: 'Bedtime Window Active'
  },
  {
    id: 'peer-3',
    username: 'Dr. Huberman Fan',
    handle: '@early_light',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    tokens: 295,
    streakDays: 7,
    isCurrentUser: false,
    status: 'focused',
    lastActive: 'Offline for 1h 45m'
  },
  {
    id: 'peer-4',
    username: 'Aisha Malik',
    handle: '@deep_focus_ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    tokens: 240,
    streakDays: 5,
    isCurrentUser: false,
    status: 'studying',
    lastActive: 'Active Study Pass'
  },
  {
    id: 'peer-5',
    username: 'Kaelen Vance',
    handle: '@unplugged_coder',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    tokens: 150,
    streakDays: 2,
    isCurrentUser: false,
    status: 'offline_mining',
    lastActive: 'Offline for 32m'
  }
];

export function calculateIdleTokens(idleMinutes: number, sleepAdherenceBonus: number = 0): number {
  if (idleMinutes <= 0) return 0;
  // Formula: Math.floor(10 * Math.log2(1 + idleMinutes)) + sleepAdherenceBonus
  const baseTokens = Math.floor(10 * Math.log2(1 + idleMinutes));
  return baseTokens + sleepAdherenceBonus;
}

export function getUserStatsKey(email?: string): string {
  if (!email) return 'comeback_user_stats_guest';
  return `comeback_user_stats_${email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
}

export function loadUserStats(email?: string, defaultName?: string): UserStats {
  const key = getUserStatsKey(email);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load user stats from localStorage:', err);
  }

  // When an email signs in for the first time:
  // Reset leaderboard with a fresh starting balance linked directly to this email!
  const name = defaultName || (email ? email.split('@')[0] : 'Guest User');
  const cleanName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    username: cleanName,
    tokens: 0, // Clean reset starting balance linked directly to this email!
    streakDays: 0,
    totalIdleMinutes: 0,
    lastClaimTime: Date.now()
  };
}

export function resetUserStatsForEmail(email?: string, defaultName?: string): UserStats {
  const name = defaultName || (email ? email.split('@')[0] : 'Guest User');
  const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
  const resetStats: UserStats = {
    username: cleanName,
    tokens: 0,
    streakDays: 0,
    totalIdleMinutes: 0,
    lastClaimTime: Date.now()
  };
  saveUserStats(resetStats, email);
  return resetStats;
}

export function saveUserStats(stats: UserStats, email?: string) {
  const key = getUserStatsKey(email);
  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save user stats to localStorage:', err);
  }
}

export function recordLastActiveTimestamp() {
  localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, Date.now().toString());
}

export function getOfflineIdleMinutes(): number {
  const raw = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE);
  if (!raw) return 0;
  const lastActive = parseInt(raw, 10);
  if (isNaN(lastActive)) return 0;
  const diffMs = Date.now() - lastActive;
  const minutes = Math.floor(diffMs / (1000 * 60));
  return Math.max(0, minutes);
}
