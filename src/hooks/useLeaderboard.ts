import { useState, useEffect, useCallback, useMemo } from 'react';
import { LeaderboardEntry } from '../types';
import {
  UserStats,
  loadUserStats,
  saveUserStats,
  calculateIdleTokens,
  INITIAL_PEERS,
  recordLastActiveTimestamp,
  getOfflineIdleMinutes
} from '../services/idleMining';
import { soundFx } from '../services/audio';

export interface MiningClaimNotice {
  idleMinutes: number;
  tokensEarned: number;
  bonus: number;
}

export function useLeaderboard() {
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats);
  const [peers, setPeers] = useState<LeaderboardEntry[]>(INITIAL_PEERS);
  const [pendingClaim, setPendingClaim] = useState<MiningClaimNotice | null>(null);

  // Sync userStats to localStorage
  useEffect(() => {
    saveUserStats(userStats);
  }, [userStats]);

  // Logarithmic offline mining via document.visibilityState and focus/blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordLastActiveTimestamp();
      } else if (document.visibilityState === 'visible') {
        const offlineMinutes = getOfflineIdleMinutes();
        if (offlineMinutes >= 1) {
          // Calculate reward
          const adherenceBonus = userStats.streakDays >= 3 ? 5 : 0;
          const tokensEarned = calculateIdleTokens(offlineMinutes, adherenceBonus);

          if (tokensEarned > 0) {
            setUserStats((prev) => ({
              ...prev,
              tokens: prev.tokens + tokensEarned,
              totalIdleMinutes: prev.totalIdleMinutes + offlineMinutes,
              lastClaimTime: Date.now()
            }));

            setPendingClaim({
              idleMinutes: offlineMinutes,
              tokensEarned,
              bonus: adherenceBonus
            });

            soundFx.playSuccess();
          }
        }
        recordLastActiveTimestamp();
      }
    };

    const handleWindowBlur = () => {
      recordLastActiveTimestamp();
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check on mount
    recordLastActiveTimestamp();

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userStats.streakDays]);

  // Judge Demo Trigger: Simulate +30m Idle Offline
  const addSimulatedIdleMinutes = useCallback((minutes: number = 30) => {
    const adherenceBonus = userStats.streakDays >= 3 ? 5 : 0;
    const earned = calculateIdleTokens(minutes, adherenceBonus);

    setUserStats((prev) => {
      const updated = {
        ...prev,
        tokens: prev.tokens + earned,
        totalIdleMinutes: prev.totalIdleMinutes + minutes,
        lastClaimTime: Date.now()
      };
      saveUserStats(updated);
      return updated;
    });

    setPendingClaim({
      idleMinutes: minutes,
      tokensEarned: earned,
      bonus: adherenceBonus
    });

    soundFx.playSuccess();
  }, [userStats.streakDays]);

  // Dismiss claim toast
  const dismissClaim = useCallback(() => {
    setPendingClaim(null);
  }, []);

  // Update streak or username
  const updateUserProfile = useCallback((name: string, streak: number) => {
    setUserStats((prev) => ({
      ...prev,
      username: name,
      streakDays: streak
    }));
  }, []);

  // Combine currentUser and peers into ranked leaderboard
  const rankedEntries = useMemo(() => {
    const currentUserEntry: LeaderboardEntry = {
      id: 'current-user',
      username: userStats.username,
      handle: '@dayanand_resilient',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      tokens: userStats.tokens,
      streakDays: userStats.streakDays,
      isCurrentUser: true,
      status: 'focused',
      lastActive: 'Online Now'
    };

    const all = [...peers, currentUserEntry];
    all.sort((a, b) => b.tokens - a.tokens);

    return all.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));
  }, [userStats, peers]);

  const currentUserRank = useMemo(() => {
    const found = rankedEntries.find((e) => e.isCurrentUser);
    return found ? found.rank : 1;
  }, [rankedEntries]);

  return {
    userStats,
    rankedEntries,
    currentUserRank,
    pendingClaim,
    dismissClaim,
    addSimulatedIdleMinutes,
    updateUserProfile
  };
}
