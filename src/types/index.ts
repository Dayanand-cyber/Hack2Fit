export interface SleepWindow {
  startHour: number; // 0-23
  startMinute: number; // 0-59
  endHour: number; // 0-23
  endMinute: number; // 0-59
  isEnabled: boolean;
}

export interface ThrottleStatus {
  isThrottled: boolean;
  reason: 'bedtime_window' | 'demo_simulation' | 'failed_test_cooldown' | null;
  grayscaleLevel: number; // 0 to 100%
  isBuffering: boolean;
  temporaryUnlockRemainingSeconds: number; // When Stroop test is passed (15 mins)
  failedCooldownRemainingSeconds: number; // When Stroop test fails (5 mins)
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: 'gemini' | 'offline_bank';
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  tokens: number;
  streakDays: number;
  isCurrentUser: boolean;
  status: 'offline_mining' | 'studying' | 'asleep' | 'focused';
  lastActive: string;
  rank?: number;
}

export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  caption: string;
  tags: string[];
  category: 'focus' | 'science' | 'humor' | 'tech' | 'nature';
  videoUrl?: string;
  posterBg: string; // Gradient or styling for visual interest
  likes: number;
  comments: number;
  shares: number;
  soundtrack: string;
}

export interface DaytimePass {
  isActive: boolean;
  expiresAt: number | null; // timestamp in ms
  durationMinutes: number;
}
