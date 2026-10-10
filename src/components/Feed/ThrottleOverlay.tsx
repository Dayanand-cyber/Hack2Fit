import React from 'react';
import { Loader2, Moon, ShieldAlert, Zap } from 'lucide-react';

interface ThrottleOverlayProps {
  isBuffering: boolean;
  onOpenStroopTest: () => void;
  reason: 'bedtime_window' | 'demo_simulation' | 'failed_test_cooldown' | null;
  cooldownSeconds: number;
}

export const ThrottleOverlay: React.FC<ThrottleOverlayProps> = ({
  isBuffering,
  onOpenStroopTest,
  reason,
  cooldownSeconds
}) => {
  if (!isBuffering && reason !== 'failed_test_cooldown') return null;

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-full border-2 border-zinc-800 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full">
          <Moon className="w-3.5 h-3.5 fill-current" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-300 font-mono text-xs mb-3">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>CIRCADIAN FRICTION ENGAGED</span>
      </div>

      <h3 className="text-lg font-bold text-zinc-100 tracking-tight font-sans">
        Forced Buffering Stutter (3s)
      </h3>

      <p className="text-xs text-zinc-400 max-w-xs mt-2 leading-relaxed">
        {reason === 'failed_test_cooldown'
          ? `Alertness challenge failed. Strict lockout active for ${Math.floor(cooldownSeconds / 60)}m ${cooldownSeconds % 60}s.`
          : 'Dopamine delivery intentionally stalled to break nocturnal reward loops and restore sleep architecture.'}
      </p>

      {reason !== 'failed_test_cooldown' && (
        <button
          onClick={onOpenStroopTest}
          className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-violet-900/40 border border-violet-400/30 transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 text-violet-200" />
          <span>Pass Dawn Stroop Test to Unlock (15m)</span>
        </button>
      )}
    </div>
  );
};
