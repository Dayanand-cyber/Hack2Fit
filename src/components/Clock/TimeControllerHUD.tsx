import React, { useState } from 'react';
import {
  Clock,
  Sun,
  Moon,
  Sunset,
  FastForward,
  Play,
  Pause,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';
import { VirtualClockHook } from '../../hooks/useVirtualClock';

interface TimeControllerHUDProps {
  clock: VirtualClockHook;
}

export const TimeControllerHUD: React.FC<TimeControllerHUDProps> = ({ clock }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const {
    time,
    formattedTimeShort,
    totalMinutesOfDay,
    isDaytime,
    isNight,
    isTwilight,
    clockSpeed,
    setClockSpeed,
    setTime,
    skipMinutes,
    triggerFiveMinSplash,
    triggerThirtyMinRecall
  } = clock;

  // Slider change handler (0 to 1439 minutes)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMinutes = parseInt(e.target.value, 10);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setTime(hours, minutes, 0);
  };

  return (
    <div className="bg-slate-950/95 border-b border-zinc-800 shadow-md transition-all font-sans">
      {/* Top Bar Readout */}
      <div className="px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Active Regime Icon & Badge */}
          {isNight ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono text-[10px] animate-pulse">
              <Moon className="w-3 h-3 text-amber-400" />
              <span>NIGHT (10PM-6AM): RANDOM LAG ACTIVE</span>
            </span>
          ) : isDaytime ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono text-[10px]">
              <Sun className="w-3 h-3 text-emerald-400" />
              <span>DAYTIME (6AM-6PM): 5M / 30M CHECKS</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-600/60 text-violet-300 font-mono text-[10px]">
              <Sunset className="w-3 h-3 text-violet-400" />
              <span>TWILIGHT (6PM-10PM): UNTHROTTLED</span>
            </span>
          )}

          {/* Clock Digital Display */}
          <div className="font-mono font-bold text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-violet-400" />
            <span>{formattedTimeShort}</span>
          </div>
        </div>

        {/* Toggle Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-mono text-[10px]"
        >
          <span>{isExpanded ? 'Hide Clock Controls' : 'Scrub Clock'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Interactive Controls */}
      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 space-y-2 text-xs border-t border-zinc-850/60 bg-slate-900/40">
          {/* 24-Hour Scrubber Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>00:00 (Night)</span>
              <span className="text-violet-300 font-bold">
                Drag Clock: {formattedTimeShort}
              </span>
              <span>23:59 (Night)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1439"
              value={totalMinutesOfDay}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          {/* Quick Preset Jumps & Skip Actions */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap pt-0.5">
            {/* Quick Jumps */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-zinc-500">Jump:</span>
              <button
                onClick={() => setTime(8, 0, 0)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                  time.hours === 8 && time.minutes === 0
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-zinc-850 border-zinc-750 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                08:00 AM (Day)
              </button>
              <button
                onClick={() => setTime(14, 0, 0)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                  time.hours === 14 && time.minutes === 0
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-zinc-850 border-zinc-750 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                02:00 PM (Study)
              </button>
              <button
                onClick={() => setTime(23, 0, 0)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                  time.hours === 23 && time.minutes === 0
                    ? 'bg-amber-950 border-amber-500 text-amber-300'
                    : 'bg-zinc-850 border-zinc-750 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                11:00 PM (Night Lag)
              </button>
            </div>

            {/* Test Actions */}
            <div className="flex items-center gap-1">
              {/* Skip +5m (triggers 5m reminder splash) */}
              <button
                onClick={() => skipMinutes(5)}
                className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/60 text-amber-300 text-[10px] font-mono flex items-center gap-1 transition-all active:scale-95"
                title="Advance clock by 5m (triggers full-screen 3s time check splash)"
              >
                <FastForward className="w-2.5 h-2.5" />
                <span>+5m (Time Splash)</span>
              </button>

              {/* Skip +30m (triggers 30m study question) */}
              <button
                onClick={() => skipMinutes(30)}
                className="px-2 py-0.5 rounded bg-violet-950/60 hover:bg-violet-900/60 border border-violet-700/60 text-violet-300 text-[10px] font-mono flex items-center gap-1 transition-all active:scale-95"
                title="Advance clock by 30m (triggers active study recall challenge)"
              >
                <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                <span>+30m (Study Q)</span>
              </button>

              {/* Speed control */}
              <button
                onClick={() => setClockSpeed(clockSpeed === 1 ? 10 : clockSpeed === 10 ? 0 : 1)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1"
                title="Toggle Clock Ticking Speed"
              >
                {clockSpeed === 0 ? (
                  <>
                    <Play className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Paused</span>
                  </>
                ) : (
                  <>
                    <FastForward className="w-2.5 h-2.5 text-violet-400" />
                    <span>{clockSpeed}x</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
