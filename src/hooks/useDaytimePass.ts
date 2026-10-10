import { useState, useEffect, useCallback } from 'react';
import { soundFx } from '../services/audio';

const STORAGE_KEY_DAY_PASS = 'comeback_daytime_pass_expires';
const DEFAULT_PASS_MINUTES = 10;

export function useDaytimePass() {
  const [passExpiresAt, setPassExpiresAt] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAY_PASS);
      if (saved) {
        const timestamp = parseInt(saved, 10);
        if (timestamp > Date.now()) return timestamp;
      }
    } catch {}
    return null;
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Countdown timer loop
  useEffect(() => {
    const updateCountdown = () => {
      if (!passExpiresAt) {
        setRemainingSeconds(0);
        return;
      }
      const now = Date.now();
      const diff = Math.max(0, Math.floor((passExpiresAt - now) / 1000));
      setRemainingSeconds(diff);

      if (diff === 0 && passExpiresAt !== null) {
        setPassExpiresAt(null);
        localStorage.removeItem(STORAGE_KEY_DAY_PASS);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [passExpiresAt]);

  const grantDaytimePass = useCallback((minutes: number = DEFAULT_PASS_MINUTES) => {
    const expires = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(STORAGE_KEY_DAY_PASS, expires.toString());
    setPassExpiresAt(expires);
    setRemainingSeconds(minutes * 60);
    soundFx.playUnlock();
  }, []);

  const revokePass = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_DAY_PASS);
    setPassExpiresAt(null);
    setRemainingSeconds(0);
  }, []);

  const isActive = remainingSeconds > 0;
  const totalSeconds = DEFAULT_PASS_MINUTES * 60;
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100));

  const minutesPart = Math.floor(remainingSeconds / 60);
  const secondsPart = remainingSeconds % 60;
  const formattedTime = `${minutesPart.toString().padStart(2, '0')}:${secondsPart.toString().padStart(2, '0')}`;

  return {
    isActive,
    remainingSeconds,
    progressPercent,
    formattedTime,
    grantDaytimePass,
    revokePass
  };
}
