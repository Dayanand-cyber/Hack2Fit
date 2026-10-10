import React from 'react';
import {
  Trophy,
  Flame,
  Coins,
  Shield,
  Clock,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  TrendingUp,
  Brain
} from 'lucide-react';
import { LeaderboardEntry, AuthUser } from '../../types';
import { UserStats, calculateIdleTokens } from '../../services/idleMining';

interface LeaderboardViewProps {
  userStats: UserStats;
  rankedEntries: LeaderboardEntry[];
  currentUserRank: number;
  onAddIdleMinutes: (minutes: number) => void;
  onResetStats?: () => void;
  authUser?: AuthUser | null;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userStats,
  rankedEntries,
  currentUserRank,
  onAddIdleMinutes,
  onResetStats,
  authUser
}) => {
  return (
    <div className="w-full min-h-[calc(100vh-105px)] overflow-y-auto p-4 pb-20 bg-slate-950 text-zinc-100 flex flex-col items-center">
      {/* User Stats Card */}
      <div className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/40 border border-zinc-800 rounded-2xl p-5 shadow-2xl mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="w-24 h-24 text-violet-400" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/50 flex items-center justify-center font-mono font-bold text-violet-300 text-sm">
              #{currentUserRank}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                {userStats.username}
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">
                {authUser?.email ? `Linked: ${authUser.email}` : 'Global Standings'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Streak</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold font-mono text-xs">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{userStats.streakDays} Days</span>
            </div>
          </div>
        </div>

        {/* Big Token Balance */}
        <div className="py-3 px-4 rounded-xl bg-slate-950/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Cognitive Tokens Mined
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                {userStats.tokens}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">$CBK</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Total Offline Time
            </span>
            <span className="text-xs font-mono font-bold text-zinc-200">
              {Math.floor(userStats.totalIdleMinutes / 60)}h {userStats.totalIdleMinutes % 60}m
            </span>
          </div>
        </div>

        {/* Logarithmic Idle Formula Explainer Card */}
        <div className="mt-4 p-3 rounded-xl bg-violet-950/20 border border-violet-800/30 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 font-mono font-bold text-violet-300 text-[10px] mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            <span>FAIR LOGARITHMIC IDLE FORMULA</span>
          </div>
          <p className="text-zinc-400 font-mono text-[10px]">
            <code className="text-emerald-300">Tokens = 10 * log₂(1 + idleMinutes) + bonus</code>
          </p>
          <p className="text-zinc-400 text-[10px] mt-1">
            Minimizes hyper-inflation while guaranteeing diminishing returns for massive idle times to encourage balanced digital detox.
          </p>
        </div>

        {/* Quick Simulation & Reset Button for Judges */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-850">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-400">Actions:</span>
            {onResetStats && (
              <button
                onClick={onResetStats}
                className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-[10px] font-mono transition-colors"
                title="Reset leaderboard stats to 0 for this account"
              >
                Reset Stats
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAddIdleMinutes(15)}
              className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-[10px] font-mono transition-colors"
            >
              +15m ({calculateIdleTokens(15)} $CBK)
            </button>
            <button
              onClick={() => onAddIdleMinutes(60)}
              className="px-2.5 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono transition-colors"
            >
              +60m ({calculateIdleTokens(60)} $CBK)
            </button>
          </div>
        </div>
      </div>

      {/* Global Leaderboard Table */}
      <div className="w-full max-w-sm bg-slate-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
          <h4 className="text-xs font-bold font-mono text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-violet-400" />
            Global Resilience Rankings
          </h4>
          <span className="text-[10px] font-mono text-zinc-500">Live Synced</span>
        </div>

        <div className="space-y-2">
          {rankedEntries.map((entry) => {
            const isSelf = entry.isCurrentUser;

            return (
              <div
                key={entry.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelf
                    ? 'bg-violet-950/40 border-violet-500/70 shadow-sm shadow-violet-950'
                    : 'bg-slate-950/60 border-zinc-850 hover:border-zinc-750'
                }`}
              >
                {/* Left: Rank & User */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 font-mono font-bold text-xs text-center ${
                      entry.rank === 1
                        ? 'text-amber-400'
                        : entry.rank === 2
                        ? 'text-zinc-300'
                        : entry.rank === 3
                        ? 'text-amber-600'
                        : 'text-zinc-500'
                    }`}
                  >
                    {entry.rank}
                  </span>

                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                  />

                  <div>
                    <h5 className="text-xs font-bold text-zinc-100 flex items-center gap-1 font-mono">
                      {entry.username}
                      {isSelf && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-violet-500/30 text-violet-300">
                          YOU
                        </span>
                      )}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span>{entry.handle}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-400/90 gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        {entry.streakDays}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Tokens & Status */}
                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-emerald-400">
                    {entry.tokens} <span className="text-[10px] text-zinc-400">$CBK</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                    {entry.lastActive}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
