import React from 'react';
import { Film, Brain, Trophy, Sliders } from 'lucide-react';

export type NavTab = 'feed' | 'study' | 'leaderboard' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDaytimePassActive: boolean;
  passTimeFormatted: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  isDaytimePassActive,
  passTimeFormatted
}) => {
  const tabs = [
    { id: 'feed' as NavTab, label: 'Reels Feed', icon: Film },
    { id: 'study' as NavTab, label: 'Study Toll', icon: Brain, badge: isDaytimePassActive ? passTimeFormatted : undefined },
    { id: 'leaderboard' as NavTab, label: 'Leaderboard', icon: Trophy },
    { id: 'settings' as NavTab, label: 'Circadian', icon: Sliders }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-slate-950/95 backdrop-blur-lg border-t border-zinc-850 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-violet-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Active glow indicator */}
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full blur-[2px]" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-4 px-1 py-0.2 text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 rounded-full leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-mono tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
