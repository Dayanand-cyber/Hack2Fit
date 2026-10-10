import React from 'react';
import { Moon, Sun, BrainCircuit, Sparkles, Clock, AlertTriangle, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { ThrottleStatus, AuthUser } from '../types';

interface JudgeDemoBarProps {
  isSimulatedBedtime: boolean;
  onToggleSimulateBedtime: () => void;
  onTriggerStroopTest: () => void;
  onAddIdleTime: () => void;
  throttleStatus: ThrottleStatus;
  isDaytimePassActive: boolean;
  passTimeFormatted: string;
  authUser?: AuthUser | null;
  onSignOut?: () => void;
}

export const JudgeDemoBar: React.FC<JudgeDemoBarProps> = ({
  isSimulatedBedtime,
  onToggleSimulateBedtime,
  onTriggerStroopTest,
  onAddIdleTime,
  throttleStatus,
  isDaytimePassActive,
  passTimeFormatted,
  authUser,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-zinc-800 shadow-lg px-3 py-2 text-xs">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          <span className="font-mono font-bold tracking-wider text-violet-400 uppercase text-[10px]">
            HACK2PITCH 2026 // JUDGE CONTROL
          </span>
        </div>

        {/* User Badge & Dynamic status pill */}
        <div className="flex items-center gap-1.5">
          {authUser && (
            <div className="flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-full bg-zinc-900 border border-zinc-750 font-mono text-[10px]">
              <img
                src={authUser.avatar}
                alt={authUser.name}
                className="w-3.5 h-3.5 rounded-full object-cover border border-zinc-700"
              />
              <span className="text-zinc-300 max-w-[65px] truncate">
                {authUser.name.split(' ')[0]}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-0.5 text-zinc-500 hover:text-rose-400 transition-colors ml-0.5"
                >
                  <LogOut className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}

          {/* Dynamic status pill */}
          <div>
            {throttleStatus.isThrottled ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 font-mono text-[10px] animate-pulse">
              <Moon className="w-3 h-3 text-amber-400" />
              {isSimulatedBedtime ? 'SIM BEDTIME THROTTLE' : 'BEDTIME THROTTLE'}
            </span>
          ) : throttleStatus.failedCooldownRemainingSeconds > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-600/60 text-rose-300 font-mono text-[10px] animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              LOCKOUT: {Math.floor(throttleStatus.failedCooldownRemainingSeconds / 60)}m
            </span>
          ) : isDaytimePassActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono text-[10px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              PASS: {passTimeFormatted}
            </span>
          ) : throttleStatus.temporaryUnlockRemainingSeconds > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 font-mono text-[10px]">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              STROOP UNLOCKED: {Math.floor(throttleStatus.temporaryUnlockRemainingSeconds / 60)}m
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono text-[10px]">
              <Sun className="w-3 h-3 text-zinc-400" />
              DAYLIGHT NORMAL
            </span>
          )}
        </div>
      </div>
    </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-1.5 font-mono">
        {/* Toggle Bedtime */}
        <button
          onClick={onToggleSimulateBedtime}
          disabled={throttleStatus.isThrottled}
          title={
            throttleStatus.isThrottled
              ? 'Bedtime Throttle is ACTIVE! You must pass the Dawn Stroop Test to exit.'
              : 'Force circadian bedtime grayscale and buffering stutters instantly'
          }
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[11px] font-semibold border transition-all ${
            throttleStatus.isThrottled
              ? 'bg-zinc-900/90 text-zinc-500 border-zinc-800 cursor-not-allowed opacity-60 select-none'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700/80 active:scale-95'
          }`}
        >
          {throttleStatus.isThrottled ? (
            <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-500/70" />
          ) : (
            <Moon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
          )}
          <span className="truncate">
            {throttleStatus.isThrottled ? 'Locked' : 'Sim Bedtime'}
          </span>
        </button>

        {/* Trigger Stroop Test */}
        <button
          onClick={onTriggerStroopTest}
          title="Trigger the dynamic 45-second Stroop alertness dawn challenge"
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[11px] font-semibold bg-violet-950/40 hover:bg-violet-900/40 text-violet-300 border border-violet-700/60 transition-all hover:border-violet-500"
        >
          <BrainCircuit className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
          <span className="truncate">Stroop Test</span>
        </button>

        {/* Add +30m Idle */}
        <button
          onClick={onAddIdleTime}
          title="Inject +30 minutes of idle offline presence to test logarithmic mining"
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[11px] font-semibold bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 transition-all hover:border-emerald-500"
        >
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">+30m Idle</span>
        </button>
      </div>
    </header>
  );
};
