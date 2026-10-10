import React from 'react';
import { Clock, Sun, Sparkles } from 'lucide-react';

interface FullScreenTimeSplashProps {
  timeFormatted: string;
  countdown: number;
  onDismiss: () => void;
}

export const FullScreenTimeSplash: React.FC<FullScreenTimeSplashProps> = ({
  timeFormatted,
  countdown,
  onDismiss
}) => {
  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn cursor-pointer"
    >
      {/* Background ambient glow */}
      <div className="absolute w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-[11px] mb-6 shadow-lg shadow-amber-950/50">
        <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
        <span className="uppercase tracking-wider">DAYTIME PROTOCOL // 5-MIN FOCUS CHECK</span>
      </div>

      {/* Hero Clock Display */}
      <div className="relative z-10 mb-4">
        <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]">
          {timeFormatted}
        </div>
        <p className="text-xs font-mono text-amber-400/90 mt-2 tracking-wide uppercase">
          ✦ 5 MINUTES OF REEL TIME ELAPSED ✦
        </p>
      </div>

      <p className="relative z-10 text-xs text-zinc-400 max-w-xs leading-relaxed mb-6">
        Mindful check-in: Notice your posture, breath, and digital presence before continuing.
      </p>

      {/* Auto-Dismiss Progress Indicator */}
      <div className="relative z-10 w-48 bg-zinc-800/80 h-1.5 rounded-full overflow-hidden border border-zinc-700/50">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 3) * 100}%` }}
        />
      </div>

      <span className="relative z-10 text-[10px] font-mono text-zinc-500 mt-2">
        Returning to reel in {countdown}s (Tap anywhere to dismiss)
      </span>
    </div>
  );
};
