import React from 'react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface ActivePassRingProps {
  remainingSeconds: number;
  progressPercent: number;
  formattedTime: string;
  onExtendPass?: () => void;
}

export const ActivePassRing: React.FC<ActivePassRingProps> = ({
  remainingSeconds,
  progressPercent,
  formattedTime,
  onExtendPass
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      {/* Circular Progress SVG */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Animated active progress */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            className="text-emerald-400 transition-all duration-1000 ease-linear"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Countdown Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Sparkles className="w-4 h-4 text-emerald-400 mb-0.5 animate-pulse" />
          <span className="font-mono text-2xl font-black text-white tracking-tight">
            {formattedTime}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mt-0.5">
            HIGH-SPEED
          </span>
        </div>
      </div>

      <div className="text-center max-w-xs">
        <h4 className="text-sm font-bold text-zinc-100 flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Daytime Focus Pass Active
        </h4>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Circadian friction disabled. High-speed reel feed and zero grayscale unlocked until timer expires.
        </p>
      </div>

      {onExtendPass && (
        <button
          onClick={onExtendPass}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-semibold transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          Solve Another Note (+10m)
        </button>
      )}
    </div>
  );
};
