import React, { useState } from 'react';
import { JudgeDemoBar } from './components/JudgeDemoBar';
import { Navigation, NavTab } from './components/Navigation';
import { SocialFeed } from './components/Feed/SocialFeed';
import { StroopTestModal } from './components/Feed/StroopTestModal';
import { StudyTollBoothModal } from './components/StudyGate/StudyTollBoothModal';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { CircadianSettings } from './components/Settings/CircadianSettings';
import { useCircadian } from './hooks/useCircadian';
import { useDaytimePass } from './hooks/useDaytimePass';
import { useLeaderboard } from './hooks/useLeaderboard';
import { Sparkles, X, Coins, Flame } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('feed');

  // Daytime Pass hook (10 min active learning pass)
  const {
    isActive: isDaytimePassActive,
    remainingSeconds: passRemainingSeconds,
    progressPercent: passProgressPercent,
    formattedTime: passTimeFormatted,
    grantDaytimePass,
    revokePass
  } = useDaytimePass();

  // Circadian Throttle engine hook
  const {
    sleepWindow,
    setSleepWindow,
    throttleStatus,
    isSimulatedBedtime,
    toggleSimulateBedtime,
    isStroopModalOpen,
    setIsStroopModalOpen,
    grantEmergencyUnlock,
    imposeFailedCooldown
  } = useCircadian(isDaytimePassActive);

  // Leaderboard & logarithmic idle mining hook
  const {
    userStats,
    rankedEntries,
    currentUserRank,
    pendingClaim,
    dismissClaim,
    addSimulatedIdleMinutes
  } = useLeaderboard();

  const handleToggleBedtime = () => {
    if (!isSimulatedBedtime) {
      revokePass();
    }
    toggleSimulateBedtime();
  };

  return (
    <div className="min-h-screen bg-black flex justify-center selection:bg-violet-500/30 selection:text-violet-200">
      {/* Mobile container restricted to max-w-md mx-auto with full responsive scaling */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 border-x border-zinc-850 flex flex-col relative shadow-2xl overflow-hidden font-sans">
        {/* Fixed Judge Demo Bar at Top */}
        <JudgeDemoBar
          isSimulatedBedtime={isSimulatedBedtime}
          onToggleSimulateBedtime={handleToggleBedtime}
          onTriggerStroopTest={() => setIsStroopModalOpen(true)}
          onAddIdleTime={() => addSimulatedIdleMinutes(30)}
          throttleStatus={throttleStatus}
          isDaytimePassActive={isDaytimePassActive}
          passTimeFormatted={passTimeFormatted}
        />

        {/* Offline Mining Claim Notification Toast */}
        {pendingClaim && (
          <div className="absolute top-16 left-3 right-3 z-50 p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/60 shadow-2xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1">
                  Idle Tokens Mined!
                  <span className="text-emerald-400">+{pendingClaim.tokensEarned} $CBK</span>
                </h5>
                <p className="text-[10px] text-zinc-400">
                  Logged {pendingClaim.idleMinutes}m offline absence via logarithmic engine.
                </p>
              </div>
            </div>
            <button
              onClick={dismissClaim}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Tab View Rendering */}
        <main className="flex-1 relative overflow-hidden">
          {activeTab === 'feed' && (
            <SocialFeed
              throttleStatus={throttleStatus}
              onOpenStroopTest={() => setIsStroopModalOpen(true)}
              onOpenStudyGate={() => setActiveTab('study')}
              isDaytimePassActive={isDaytimePassActive}
              passTimeFormatted={passTimeFormatted}
            />
          )}

          {activeTab === 'study' && (
            <StudyTollBoothModal
              isDaytimePassActive={isDaytimePassActive}
              passTimeFormatted={passTimeFormatted}
              progressPercent={passProgressPercent}
              remainingSeconds={passRemainingSeconds}
              onGrantPass={() => grantDaytimePass(10)}
              onSwitchToFeed={() => setActiveTab('feed')}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              userStats={userStats}
              rankedEntries={rankedEntries}
              currentUserRank={currentUserRank}
              onAddIdleMinutes={(mins) => addSimulatedIdleMinutes(mins)}
            />
          )}

          {activeTab === 'settings' && (
            <CircadianSettings
              sleepWindow={sleepWindow}
              onUpdateSleepWindow={setSleepWindow}
              onResetStats={() => {}}
            />
          )}
        </main>

        {/* Emergency Morning Stroop Test Modal */}
        <StroopTestModal
          isOpen={isStroopModalOpen}
          onClose={() => setIsStroopModalOpen(false)}
          onPass={grantEmergencyUnlock}
          onFail={imposeFailedCooldown}
        />

        {/* Fixed Mobile Bottom Navigation */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isDaytimePassActive={isDaytimePassActive}
          passTimeFormatted={passTimeFormatted}
        />
      </div>
    </div>
  );
};

export default App;
