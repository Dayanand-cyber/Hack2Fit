import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { soundFx } from '../services/audio';

export interface VirtualTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export type ClockSpeed = 1 | 10 | 60 | 0;

export interface VirtualClockHook {
  time: VirtualTime;
  formattedTime: string;
  formattedTimeShort: string;
  totalMinutesOfDay: number;
  isDaytime: boolean;       // 6:00 AM to 6:00 PM (06:00 to 18:00)
  isNight: boolean;         // 10:00 PM to 6:00 AM (22:00 to 06:00)
  isTwilight: boolean;      // 6:00 PM to 10:00 PM (18:00 to 22:00)
  clockSpeed: ClockSpeed;
  setClockSpeed: (speed: ClockSpeed) => void;
  setTime: (hours: number, minutes: number, seconds?: number) => void;
  skipMinutes: (minutesDelta: number) => void;
  
  // 5-Min Time Splash Feature (Daytime 6 AM - 6 PM)
  isFiveMinSplashActive: boolean;
  fiveMinSplashCountdown: number; // 3 seconds display
  dismissFiveMinSplash: () => void;
  triggerFiveMinSplash: () => void;

  // 30-Min Active Study Recall Feature (Daytime 6 AM - 6 PM)
  isThirtyMinRecallActive: boolean;
  thirtyMinSessionElapsed: number; // watch seconds accumulated
  dismissThirtyMinRecall: () => void;
  triggerThirtyMinRecall: () => void;
}

const STORAGE_KEY_VIRTUAL_TIME = 'comeback_virtual_time';

export function useVirtualClock(isWatchingFeed: boolean = true): VirtualClockHook {
  // Initialize from current real time
  const [time, setTimeState] = useState<VirtualTime>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIRTUAL_TIME);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds()
    };
  });

  const [clockSpeed, setClockSpeed] = useState<ClockSpeed>(1);

  // Daytime 5-min full-screen reminder splash state (3 seconds duration)
  const [isFiveMinSplashActive, setIsFiveMinSplashActive] = useState<boolean>(false);
  const [fiveMinSplashCountdown, setFiveMinSplashCountdown] = useState<number>(3);

  // Daytime 30-min study recall modal state
  const [isThirtyMinRecallActive, setIsThirtyMinRecallActive] = useState<boolean>(false);
  const [thirtyMinSessionElapsed, setThirtyMinSessionElapsed] = useState<number>(0);

  // Track daytime watch time for 5-min intervals
  const daytimeWatchSecondsRef = useRef<number>(0);
  const lastFiveMinTriggerRef = useRef<number>(0);

  // Sync virtual time to localStorage periodically
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIRTUAL_TIME, JSON.stringify(time));
    } catch {}
  }, [time]);

  // Window calculations
  const totalMinutesOfDay = useMemo(() => {
    return time.hours * 60 + time.minutes;
  }, [time.hours, time.minutes]);

  // Morning 6 AM to Evening 6 PM (06:00 to 18:00)
  const isDaytime = useMemo(() => {
    return time.hours >= 6 && time.hours < 18;
  }, [time.hours]);

  // Night 10 PM to Morning 6 AM (22:00 to 06:00)
  const isNight = useMemo(() => {
    return time.hours >= 22 || time.hours < 6;
  }, [time.hours]);

  const isTwilight = useMemo(() => {
    return time.hours >= 18 && time.hours < 22;
  }, [time.hours]);

  // Formatted string (e.g. "08:15:30 AM")
  const formattedTime = useMemo(() => {
    const period = time.hours >= 12 ? 'PM' : 'AM';
    const displayHour = time.hours % 12 === 0 ? 12 : time.hours % 12;
    const h = displayHour.toString().padStart(2, '0');
    const m = time.minutes.toString().padStart(2, '0');
    const s = time.seconds.toString().padStart(2, '0');
    return `${h}:${m}:${s} ${period}`;
  }, [time]);

  // Short formatted string (e.g. "08:15 AM")
  const formattedTimeShort = useMemo(() => {
    const period = time.hours >= 12 ? 'PM' : 'AM';
    const displayHour = time.hours % 12 === 0 ? 12 : time.hours % 12;
    const h = displayHour.toString().padStart(2, '0');
    const m = time.minutes.toString().padStart(2, '0');
    return `${h}:${m} ${period}`;
  }, [time]);

  // Trigger 5-Min Full-screen time splash (lasts 3 seconds)
  const triggerFiveMinSplash = useCallback(() => {
    setIsFiveMinSplashActive(true);
    setFiveMinSplashCountdown(3);
    soundFx.playTick();
  }, []);

  const dismissFiveMinSplash = useCallback(() => {
    setIsFiveMinSplashActive(false);
  }, []);

  // Trigger 30-Min Study Recall
  const triggerThirtyMinRecall = useCallback(() => {
    setIsThirtyMinRecallActive(true);
    soundFx.playSuccess();
  }, []);

  const dismissThirtyMinRecall = useCallback(() => {
    setIsThirtyMinRecallActive(false);
    setThirtyMinSessionElapsed(0);
  }, []);

  // Countdown timer for 5-min splash (auto-dismiss after 3s)
  useEffect(() => {
    if (!isFiveMinSplashActive) return;

    const interval = setInterval(() => {
      setFiveMinSplashCountdown((prev) => {
        if (prev <= 1) {
          setIsFiveMinSplashActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFiveMinSplashActive]);

  // Set time directly
  const setTime = useCallback((hours: number, minutes: number, seconds: number = 0) => {
    const clampedH = Math.max(0, Math.min(23, Math.floor(hours)));
    const clampedM = Math.max(0, Math.min(59, Math.floor(minutes)));
    const clampedS = Math.max(0, Math.min(59, Math.floor(seconds)));

    setTimeState({ hours: clampedH, minutes: clampedM, seconds: clampedS });
  }, []);

  // Skip minutes (+5m, +30m, etc.)
  const skipMinutes = useCallback((minutesDelta: number) => {
    setTimeState((prev) => {
      let totalMins = prev.hours * 60 + prev.minutes + minutesDelta;
      while (totalMins < 0) totalMins += 24 * 60;
      totalMins = totalMins % (24 * 60);

      const newHours = Math.floor(totalMins / 60);
      const newMinutes = totalMins % 60;
      return { hours: newHours, minutes: newMinutes, seconds: prev.seconds };
    });

    // If skipping within daytime:
    // If skipping +5m, trigger the 5-min splash!
    if (minutesDelta === 5 || minutesDelta % 5 === 0) {
      triggerFiveMinSplash();
    }
    // If skipping +30m, trigger the 30-min active recall question!
    if (minutesDelta >= 30) {
      triggerThirtyMinRecall();
    }
  }, [triggerFiveMinSplash, triggerThirtyMinRecall]);

  // Main Virtual Clock Ticker
  useEffect(() => {
    if (clockSpeed === 0) return; // Paused

    const intervalMs = 1000;

    const interval = setInterval(() => {
      setTimeState((prev) => {
        // Advance seconds by clockSpeed
        let nextSec = prev.seconds + clockSpeed;
        let nextMin = prev.minutes;
        let nextHour = prev.hours;

        if (nextSec >= 60) {
          nextMin += Math.floor(nextSec / 60);
          nextSec = nextSec % 60;
        }

        if (nextMin >= 60) {
          nextHour += Math.floor(nextMin / 60);
          nextMin = nextMin % 60;
        }

        if (nextHour >= 24) {
          nextHour = nextHour % 24;
        }

        return { hours: nextHour, minutes: nextMin, seconds: nextSec };
      });

      // Track daytime watch duration if active
      if (isWatchingFeed && isDaytime) {
        daytimeWatchSecondsRef.current += clockSpeed;
        setThirtyMinSessionElapsed((prev) => {
          const next = prev + clockSpeed;
          // Trigger 30-min study check when reaching 1800s (30m)
          if (next >= 1800 && !isThirtyMinRecallActive) {
            triggerThirtyMinRecall();
            return 0;
          }
          return next;
        });

        // Trigger 5-min reminder every 300 seconds (5m)
        const elapsed = daytimeWatchSecondsRef.current;
        if (elapsed - lastFiveMinTriggerRef.current >= 300) {
          lastFiveMinTriggerRef.current = elapsed;
          if (!isFiveMinSplashActive && !isThirtyMinRecallActive) {
            triggerFiveMinSplash();
          }
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [clockSpeed, isWatchingFeed, isDaytime, isFiveMinSplashActive, isThirtyMinRecallActive, triggerFiveMinSplash, triggerThirtyMinRecall]);

  return {
    time,
    formattedTime,
    formattedTimeShort,
    totalMinutesOfDay,
    isDaytime,
    isNight,
    isTwilight,
    clockSpeed,
    setClockSpeed,
    setTime,
    skipMinutes,
    isFiveMinSplashActive,
    fiveMinSplashCountdown,
    dismissFiveMinSplash,
    triggerFiveMinSplash,
    isThirtyMinRecallActive,
    thirtyMinSessionElapsed,
    dismissThirtyMinRecall,
    triggerThirtyMinRecall
  };
}
