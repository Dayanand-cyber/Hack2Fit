import { useState, useEffect, useCallback, useMemo } from 'react';
import { SleepWindow, ThrottleStatus } from '../types';
import { soundFx } from '../services/audio';

const STORAGE_KEY_SLEEP_WINDOW = 'comeback_sleep_window';
const STORAGE_KEY_TEMP_UNLOCK = 'comeback_temp_unlock_expires';
const STORAGE_KEY_FAILED_LOCK = 'comeback_failed_lock_expires';

export const DEFAULT_SLEEP_WINDOW: SleepWindow = {
  startHour: 22,
  startMinute: 30, // 10:30 PM
  endHour: 7,
  endMinute: 0, // 07:00 AM
  isEnabled: true
};

export function useCircadian(isDaytimePassActive: boolean) {
  // Sleep window configuration
  const [sleepWindow, setSleepWindow] = useState<SleepWindow>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SLEEP_WINDOW);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SLEEP_WINDOW;
  });

  // Judge Demo override
  const [isSimulatedBedtime, setIsSimulatedBedtime] = useState<boolean>(false);

  // Stroop Test modal trigger state
  const [isStroopModalOpen, setIsStroopModalOpen] = useState<boolean>(false);

  // Timers
  const [tempUnlockRemaining, setTempUnlockRemaining] = useState<number>(0);
  const [failedCooldownRemaining, setFailedCooldownRemaining] = useState<number>(0);

  // Buffer stutter cycle: true for 3s every 4s during throttled video watch
  const [isBufferingStutter, setIsBufferingStutter] = useState<boolean>(false);

  // Persist sleep window changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SLEEP_WINDOW, JSON.stringify(sleepWindow));
  }, [sleepWindow]);

  // Check if current time falls within sleep window
  const isCurrentlyInBedtimeWindow = useCallback(() => {
    if (!sleepWindow.isEnabled) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = sleepWindow.startHour * 60 + sleepWindow.startMinute;
    const endMinutes = sleepWindow.endHour * 60 + sleepWindow.endMinute;

    if (startMinutes > endMinutes) {
      // Overnight window (e.g. 22:30 -> 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Window on same day (e.g. 13:00 -> 15:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }, [sleepWindow]);

  // Check countdowns from localStorage on mount & interval
  useEffect(() => {
    const checkCountdowns = () => {
      const now = Date.now();
      const unlockExpires = parseInt(localStorage.getItem(STORAGE_KEY_TEMP_UNLOCK) || '0', 10);
      const failedExpires = parseInt(localStorage.getItem(STORAGE_KEY_FAILED_LOCK) || '0', 10);

      const unlockDiff = Math.max(0, Math.floor((unlockExpires - now) / 1000));
      const failedDiff = Math.max(0, Math.floor((failedExpires - now) / 1000));

      setTempUnlockRemaining(unlockDiff);
      setFailedCooldownRemaining(failedDiff);
    };

    checkCountdowns();
    const timer = setInterval(checkCountdowns, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute final throttle state
  const throttleStatus: ThrottleStatus = useMemo(() => {
    // 1. JUDGE DEMO SIMULATION OVERRIDE:
    // When Simulate Bedtime is toggled ON, it ALWAYS forces Bedtime Throttle immediately!
    if (isSimulatedBedtime) {
      return {
        isThrottled: true,
        reason: 'demo_simulation',
        grayscaleLevel: 100,
        isBuffering: isBufferingStutter,
        temporaryUnlockRemainingSeconds: 0,
        failedCooldownRemainingSeconds: 0
      };
    }

    // 2. If locked by failing Stroop test
    if (failedCooldownRemaining > 0) {
      return {
        isThrottled: true,
        reason: 'failed_test_cooldown',
        grayscaleLevel: 100,
        isBuffering: isBufferingStutter,
        temporaryUnlockRemainingSeconds: 0,
        failedCooldownRemainingSeconds: failedCooldownRemaining
      };
    }

    // 3. If a temporary unlock is active (from passing Stroop test) or Daytime Pass is active
    if (tempUnlockRemaining > 0 || isDaytimePassActive) {
      return {
        isThrottled: false,
        reason: null,
        grayscaleLevel: 0,
        isBuffering: false,
        temporaryUnlockRemainingSeconds: tempUnlockRemaining,
        failedCooldownRemainingSeconds: failedCooldownRemaining
      };
    }

    // 4. Check actual bedtime window
    if (isCurrentlyInBedtimeWindow()) {
      return {
        isThrottled: true,
        reason: 'bedtime_window',
        grayscaleLevel: 100,
        isBuffering: isBufferingStutter,
        temporaryUnlockRemainingSeconds: 0,
        failedCooldownRemainingSeconds: 0
      };
    }

    // 5. Normal daylight operating state
    return {
      isThrottled: false,
      reason: null,
      grayscaleLevel: 0,
      isBuffering: false,
      temporaryUnlockRemainingSeconds: 0,
      failedCooldownRemainingSeconds: 0
    };
  }, [
    isSimulatedBedtime,
    failedCooldownRemaining,
    tempUnlockRemaining,
    isDaytimePassActive,
    isCurrentlyInBedtimeWindow,
    isBufferingStutter
  ]);

  // Bedtime Throttle Engine: Forced 3-second buffering spinners every 4 seconds of watch time
  useEffect(() => {
    if (!throttleStatus.isThrottled) {
      setIsBufferingStutter(false);
      return;
    }

    let isMounted = true;
    let timer: ReturnType<typeof setTimeout>;

    // Start with buffer phase (true) immediately so the user instantly sees the 3s buffer overlay!
    const runStutterCycle = (isBufferPhase: boolean) => {
      if (!isMounted) return;
      setIsBufferingStutter(isBufferPhase);
      if (isBufferPhase) {
        soundFx.playThrottleAlert();
      }
      const duration = isBufferPhase ? 3000 : 4000;
      timer = setTimeout(() => {
        runStutterCycle(!isBufferPhase);
      }, duration);
    };

    runStutterCycle(true);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [throttleStatus.isThrottled]);

  // Grant 15-minute emergency unlock when Stroop test passes
  const grantEmergencyUnlock = useCallback(() => {
    const expires = Date.now() + 15 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY_TEMP_UNLOCK, expires.toString());
    localStorage.removeItem(STORAGE_KEY_FAILED_LOCK);
    setFailedCooldownRemaining(0);
    setTempUnlockRemaining(15 * 60);
    setIsSimulatedBedtime(false); // Turn off simulated bedtime so 15m emergency unlock takes effect!
    setIsStroopModalOpen(false);
    soundFx.playUnlock();
  }, []);

  // Impose 5-minute cooldown lock when Stroop test fails
  const imposeFailedCooldown = useCallback(() => {
    const expires = Date.now() + 5 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY_FAILED_LOCK, expires.toString());
    setFailedCooldownRemaining(5 * 60);
    setIsSimulatedBedtime(false);
    setIsStroopModalOpen(false);
    soundFx.playError();
  }, []);

  const toggleSimulateBedtime = useCallback(() => {
    setIsSimulatedBedtime((prev) => {
      const next = !prev;
      if (next) {
        localStorage.removeItem(STORAGE_KEY_TEMP_UNLOCK);
        localStorage.removeItem(STORAGE_KEY_FAILED_LOCK);
        setTempUnlockRemaining(0);
        setFailedCooldownRemaining(0);
      }
      return next;
    });
  }, []);

  return {
    sleepWindow,
    setSleepWindow,
    throttleStatus,
    isSimulatedBedtime,
    toggleSimulateBedtime,
    isStroopModalOpen,
    setIsStroopModalOpen,
    grantEmergencyUnlock,
    imposeFailedCooldown
  };
}
