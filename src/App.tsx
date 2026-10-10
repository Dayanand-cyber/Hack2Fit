import React, { useState } from 'react';
import { JudgeDemoBar } from './components/JudgeDemoBar';
import { Navigation, NavTab } from './components/Navigation';
import { SocialFeed } from './components/Feed/SocialFeed';
import { StroopTestModal } from './components/Feed/StroopTestModal';
import { StudyTollBoothModal } from './components/StudyGate/StudyTollBoothModal';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { CircadianSettings } from './components/Settings/CircadianSettings';
import { GoogleLoginPage } from './components/Auth/GoogleLoginPage';
import { useCircadian } from './hooks/useCircadian';
import { useDaytimePass } from './hooks/useDaytimePass';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useVirtualClock } from './hooks/useVirtualClock';
import { TimeControllerHUD } from './components/Clock/TimeControllerHUD';
import { AuthUser } from './types';
import { loadAuthUser, saveAuthUser } from './services/auth';
import { Sparkles, X, Coins, Flame } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadAuthUser());

  const handleSignInSuccess = (user: AuthUser) => {
    setAuthUser(user);
    saveAuthUser(user);
  };

  const handleSignOut = () => {
    setAuthUser(null);
    saveAuthUser(null);
  };

  const handleContinueAsGuest = () => {
    const guestUser: AuthUser = {
      id: `guest-${Date.now()}`,
      name: 'Guest Judge',
      email: 'judge.guest@hack2pitch.dev',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      provider: 'guest',
      signedInAt: Date.now()
    };
    setAuthUser(guestUser);
    saveAuthUser(guestUser);
  };

  // Daytime Pass hook (10 min active learning pass)
  const {
    isActive: isDaytimePassActive,
    remainingSeconds: passRemainingSeconds,
    progressPercent: passProgressPercent,
    formattedTime: passTimeFormatted,
    grantDaytimePass,
    revokePass
  } = useDaytimePass();

  // Virtual Clock & Reminders hook (5m full-screen time splash + 30m study check)
  const virtualClock = useVirtualClock(activeTab === 'feed');

  // Circadian Throttle engine hook (synchronized with virtual clock!)
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
  } = useCircadian(isDaytimePassActive, virtualClock.totalMinutesOfDay);

  // Leaderboard & logarithmic idle mining hook
  const {
    userStats,
    rankedEntries,
    currentUserRank,
    pendingClaim,
    dismissClaim,
    addSimulatedIdleMinutes,
    resetLeaderboardStats
  } = useLeaderboard(authUser);

  const handleToggleBedtime = () => {
    if (!isSimulatedBedtime) {
      revokePass();
    }
    toggleSimulateBedtime();
  };

  // If user is not signed in, show the dedicated Google Login Page
  if (!authUser) {
    return (
      <GoogleLoginPage
        onSignInSuccess={handleSignInSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

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
          authUser={authUser}
          onSignOut={handleSignOut}
        />

        {/* Interactive Virtual Clock Controller HUD & Time Scrubber */}
        <TimeControllerHUD clock={virtualClock} />

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
              isDaytime={virtualClock.isDaytime}
              isNight={virtualClock.isNight}
              formattedTime={virtualClock.formattedTime}
              isFiveMinSplashActive={virtualClock.isFiveMinSplashActive}
              fiveMinSplashCountdown={virtualClock.fiveMinSplashCountdown}
              onDismissFiveMinSplash={virtualClock.dismissFiveMinSplash}
              isThirtyMinRecallActive={virtualClock.isThirtyMinRecallActive}
              onDismissThirtyMinRecall={virtualClock.dismissThirtyMinRecall}
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
              onResetStats={resetLeaderboardStats}
              authUser={authUser}
            />
          )}

          {activeTab === 'settings' && (
            <CircadianSettings
              sleepWindow={sleepWindow}
              onUpdateSleepWindow={setSleepWindow}
              onResetStats={resetLeaderboardStats}
              authUser={authUser}
              onSignOut={handleSignOut}
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
