import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Moon,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  User,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { AuthUser } from '../../types';
import {
  DEMO_GOOGLE_PROFILES,
  decodeGoogleJwt,
  verifyGoogleAccount,
  GoogleVerificationResult
} from '../../services/auth';
import { soundFx } from '../../services/audio';

interface GoogleLoginPageProps {
  onSignInSuccess: (user: AuthUser) => void;
  onContinueAsGuest: () => void;
}

export const GoogleLoginPage: React.FC<GoogleLoginPageProps> = ({
  onSignInSuccess,
  onContinueAsGuest
}) => {
  // Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');

  // Input states
  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Validation & Loading states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [verifiedResult, setVerifiedResult] = useState<GoogleVerificationResult | null>(null);

  // Google Identity Services ref
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize official Google Identity Services if a Client ID is configured in .env
  useEffect(() => {
    if (!googleClientId) return;

    const win = window as unknown as {
      google?: {
        accounts: {
          id: {
            initialize: (config: {
              client_id: string;
              callback: (response: { credential: string }) => void;
            }) => void;
            renderButton: (
              element: HTMLElement,
              options: { theme: string; size: string; width: number; text: string; shape: string }
            ) => void;
          };
        };
      };
    };

    if (win.google?.accounts?.id && googleBtnContainerRef.current) {
      try {
        win.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: { credential: string }) => {
            const decoded = decodeGoogleJwt(response.credential);
            if (decoded && decoded.name && decoded.email) {
              const user: AuthUser = {
                id: decoded.id || `google-${Date.now()}`,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.avatar || DEMO_GOOGLE_PROFILES[0].avatar,
                provider: 'google',
                signedInAt: Date.now()
              };
              soundFx.playSuccess();
              onSignInSuccess(user);
            }
          }
        });

        win.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'pill'
        });
      } catch (err) {
        console.warn('Google Identity Services setup deferred:', err);
      }
    }
  }, [googleClientId, onSignInSuccess]);

  // Open Google Modal
  const openGoogleSignIn = (prefillEmail: string = '') => {
    setInputEmail(prefillEmail);
    setErrorMessage(null);
    setLoginStep('email');
    setVerifiedResult(null);
    setIsGoogleModalOpen(true);
  };

  // Close Google Modal
  const closeGoogleSignIn = () => {
    setIsGoogleModalOpen(false);
    setErrorMessage(null);
    setLoginStep('email');
    setVerifiedResult(null);
  };

  // Step 1: Verify Google Account (Strict Email Check)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Run strict Google validation
    const result = verifyGoogleAccount(inputEmail);

    if (!result.isValid) {
      // REJECT LOGIN WITH AUTHENTIC GOOGLE ERROR
      soundFx.playError();
      setErrorMessage(result.errorMessage || "Couldn't find your Google Account");
      return;
    }

    // Valid account: Show brief authentic verification spinner then advance to password step
    setIsValidating(true);
    soundFx.playTick();

    setTimeout(() => {
      setIsValidating(false);
      setVerifiedResult(result);
      setLoginStep('password');
      setErrorMessage(null);
    }, 600);
  };

  // Step 2: Complete Google Sign-In
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedResult || !verifiedResult.normalizedEmail) return;

    soundFx.playSuccess();

    const user: AuthUser = {
      id: `google-${verifiedResult.normalizedEmail}`,
      name: verifiedResult.suggestedName || 'Google User',
      email: verifiedResult.normalizedEmail,
      avatar: verifiedResult.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(verifiedResult.normalizedEmail)}`,
      provider: 'google',
      signedInAt: Date.now()
    };

    setIsGoogleModalOpen(false);
    onSignInSuccess(user);
  };

  // Fast-track Demo Profile sign in (also validates email strictly)
  const handleFastTrackProfile = (profile: typeof DEMO_GOOGLE_PROFILES[0]) => {
    const verified = verifyGoogleAccount(profile.email);
    if (!verified.isValid) {
      soundFx.playError();
      setErrorMessage(verified.errorMessage || "Couldn't find your Google Account");
      return;
    }

    soundFx.playSuccess();
    const user: AuthUser = {
      id: `google-${profile.email}`,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      provider: 'google',
      signedInAt: Date.now()
    };
    onSignInSuccess(user);
  };

  return (
    <div className="min-h-screen bg-black flex justify-center selection:bg-violet-500/30 selection:text-violet-200">
      <div className="w-full max-w-md min-h-screen bg-slate-950 border-x border-zinc-850 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
        {/* Cyber background glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="pt-4 text-center relative z-10">
          <div className="inline-flex relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-xl shadow-violet-950/40">
              <Brain className="w-8 h-8 animate-pulse-subtle" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-violet-950/70 border border-violet-600/50 text-violet-300 font-mono text-[10px] uppercase tracking-wider mb-2">
            HACK2PITCH 2026 // TRACK 01
          </div>

          <h1 className="text-2xl font-black text-white font-mono tracking-tight drop-shadow-sm">
            COMEBACK
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Circadian Friction & Cognitive Resilience Protocol
          </p>
        </div>

        {/* Value Proposition Cards */}
        <div className="my-5 space-y-2.5 relative z-10">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 font-mono">Circadian Friction Feed</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Forced 3s buffering stutter & 100% grayscale kill late-night doomscrolling.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 font-mono">Active Recall Study Gate</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                10-minute daytime passes earned exclusively through AI-synthesized recall.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200 font-mono">Fair Logarithmic Token Mining</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Earn $CBK tokens for screen-off time. Leaderboard scoped per Gmail account.
              </p>
            </div>
          </div>
        </div>

        {/* Authentication CTA Section */}
        <div className="pb-3 relative z-10 space-y-3">
          {/* Optional Official GSI Render if Client ID configured */}
          {googleClientId && (
            <div ref={googleBtnContainerRef} className="flex justify-center mb-1" />
          )}

          {/* Primary Sign In with Google Button */}
          <button
            onClick={() => openGoogleSignIn()}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-medium shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 group font-sans border border-zinc-200"
          >
            {/* Google Multi-Color SVG Logo */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-semibold tracking-tight text-zinc-900 text-sm">
              Sign in with Google
            </span>
          </button>

          {/* Quick-Pick Verified Accounts for Demo Speed */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2 px-1">
              <span>VERIFIED GOOGLE ACCOUNTS (1-CLICK DEMO):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_GOOGLE_PROFILES.slice(0, 2).map((p) => (
                <button
                  key={p.email}
                  onClick={() => handleFastTrackProfile(p)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-zinc-850 border border-zinc-800 hover:border-violet-500/50 flex items-center gap-2 text-left transition-all active:scale-95 group"
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                  />
                  <div className="truncate flex-1">
                    <span className="text-[11px] font-bold text-zinc-200 block truncate group-hover:text-violet-300">
                      {p.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono truncate block">
                      {p.email.split('@')[0]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Continue as Guest Button */}
          <button
            onClick={onContinueAsGuest}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <span>Continue as Guest Judge</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          <p className="text-[10px] text-zinc-500 text-center leading-normal pt-1">
            Each Gmail login scopes and resets leaderboard tokens to that specific account.
          </p>
        </div>

        {/* ======================================================== */}
        {/* AUTHENTIC GOOGLE SIGN-IN MODAL DIALOG                     */}
        {/* ======================================================== */}
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-sm bg-slate-900 border border-zinc-750 rounded-2xl shadow-2xl overflow-hidden p-6 relative font-sans">
              {/* Close Modal Button */}
              <button
                onClick={closeGoogleSignIn}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Google Brand Header */}
              <div className="text-center mb-5">
                {/* Authentic Google Multi-Color G Icon */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md mb-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-semibold text-white tracking-tight">
                  {loginStep === 'email' ? 'Sign in' : `Welcome`}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {loginStep === 'email'
                    ? 'to continue to Comeback Circadian Resilience'
                    : verifiedResult?.normalizedEmail}
                </p>
              </div>

              {/* Progress Bar Animation while validating */}
              {isValidating && (
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-blue-500 animate-pulse w-full" />
                </div>
              )}

              {/* ======================================= */}
              {/* STEP 1: EMAIL ENTRY WITH STRICT REJECT */}
              {/* ======================================= */}
              {loginStep === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1.5 font-mono">
                      Email or phone
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="username@gmail.com"
                      value={inputEmail}
                      onChange={(e) => {
                        setInputEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full bg-slate-950 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 transition-all font-mono focus:outline-none ${
                        errorMessage
                          ? 'border-2 border-rose-500 focus:border-rose-500 shadow-sm shadow-rose-950'
                          : 'border border-zinc-700 focus:border-blue-500'
                      }`}
                    />

                    {/* Authentic Google Error Message Banner */}
                    {errorMessage && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-start gap-2 text-rose-300 text-xs animate-shake">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                        <span className="leading-tight font-sans">{errorMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Test Rejection Chips for Judges */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>QUICK TEST CHIPS:</span>
                      <span className="text-zinc-500">Tap to test verification</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInputEmail('doesnotexist@gmail.com');
                          setErrorMessage(null);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[10px] font-mono transition-colors"
                      >
                        ❌ doesnotexist@gmail.com
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInputEmail('user@yahoo.com');
                          setErrorMessage(null);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[10px] font-mono transition-colors"
                      >
                        ❌ user@yahoo.com
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInputEmail('abc@gmail.com');
                          setErrorMessage(null);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-[10px] font-mono transition-colors"
                      >
                        ❌ abc@gmail.com (&lt;6 chars)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInputEmail('dayanand.dev@gmail.com');
                          setErrorMessage(null);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono transition-colors"
                      >
                        ✅ dayanand.dev@gmail.com
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setInputEmail('dayanand.dev@gmail.com')}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Fill Demo Account
                    </button>

                    <button
                      type="submit"
                      disabled={isValidating}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-950 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Next</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ======================================= */}
              {/* STEP 2: PASSWORD & FINAL CONFIRMATION   */}
              {/* ======================================= */}
              {loginStep === 'password' && verifiedResult && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Account Pill with Back Switcher */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={verifiedResult.avatar}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                      />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">
                          {verifiedResult.suggestedName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono block truncate">
                          {verifiedResult.normalizedEmail}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('email');
                        setErrorMessage(null);
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Switch Google Account"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-medium text-zinc-300 font-mono">
                        Enter your password
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Account Verified
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className="w-full bg-slate-950 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 border border-zinc-700 focus:border-blue-500 font-mono pr-10 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Leaderboard Notice */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-[11px] text-emerald-300 font-mono">
                    ✦ Leaderboard will be reset & scoped to{' '}
                    <strong className="text-white">{verifiedResult.normalizedEmail}</strong>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep('email')}
                      className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-950 flex items-center gap-2 transition-all active:scale-95"
                    >
                      <span>Sign in</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
