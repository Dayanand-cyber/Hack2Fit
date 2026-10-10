import React, { useState } from 'react';
import {
  Moon,
  Clock,
  Key,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { SleepWindow } from '../../types';
import { DEFAULT_SLEEP_WINDOW } from '../../hooks/useCircadian';

interface CircadianSettingsProps {
  sleepWindow: SleepWindow;
  onUpdateSleepWindow: (window: SleepWindow) => void;
  onResetStats: () => void;
}

export const CircadianSettings: React.FC<CircadianSettingsProps> = ({
  sleepWindow,
  onUpdateSleepWindow,
  onResetStats
}) => {
  const [startHour, setStartHour] = useState<number>(sleepWindow.startHour);
  const [startMinute, setStartMinute] = useState<number>(sleepWindow.startMinute);
  const [endHour, setEndHour] = useState<number>(sleepWindow.endHour);
  const [endMinute, setEndMinute] = useState<number>(sleepWindow.endMinute);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('comeback_custom_gemini_key') || '';
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    onUpdateSleepWindow({
      ...sleepWindow,
      startHour,
      startMinute,
      endHour,
      endMinute
    });
    localStorage.setItem('comeback_custom_gemini_key', apiKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setStartHour(DEFAULT_SLEEP_WINDOW.startHour);
    setStartMinute(DEFAULT_SLEEP_WINDOW.startMinute);
    setEndHour(DEFAULT_SLEEP_WINDOW.endHour);
    setEndMinute(DEFAULT_SLEEP_WINDOW.endMinute);
    onUpdateSleepWindow(DEFAULT_SLEEP_WINDOW);
  };

  return (
    <div className="w-full min-h-[calc(100vh-105px)] overflow-y-auto p-4 pb-20 bg-slate-950 text-zinc-100 flex flex-col items-center">
      <div className="w-full max-w-sm bg-slate-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
          <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-tight text-white">
              CIRCADIAN RESILIENCE ENGINE
            </h3>
            <p className="text-[11px] text-zinc-400">Parameters & Cognitive Safeguards</p>
          </div>
        </div>

        {/* Sleep Window Configuration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-violet-400" />
              Sleep Window (Bedtime Throttle)
            </label>
            <button
              onClick={() =>
                onUpdateSleepWindow({ ...sleepWindow, isEnabled: !sleepWindow.isEnabled })
              }
              className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                sleepWindow.isEnabled
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {sleepWindow.isEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
            During this window, feed playback enforces 3-second buffering spinners every 4 seconds, progressive grayscale, and sluggish scroll gestures.
          </p>

          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-zinc-800">
            {/* Start Time */}
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                Sleep Start (Bedtime)
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value) || 0)}
                  className="w-12 bg-slate-900 border border-zinc-750 rounded p-1.5 text-center font-mono text-xs text-white"
                />
                <span className="text-zinc-500 font-mono">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={startMinute}
                  onChange={(e) => setStartMinute(parseInt(e.target.value) || 0)}
                  className="w-12 bg-slate-900 border border-zinc-750 rounded p-1.5 text-center font-mono text-xs text-white"
                />
                <span className="text-[10px] text-zinc-400 ml-1 font-mono">
                  {startHour >= 12 ? 'PM' : 'AM'}
                </span>
              </div>
            </div>

            {/* End Time */}
            <div>
              <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                Sleep End (Wakeup)
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={endHour}
                  onChange={(e) => setEndHour(parseInt(e.target.value) || 0)}
                  className="w-12 bg-slate-900 border border-zinc-750 rounded p-1.5 text-center font-mono text-xs text-white"
                />
                <span className="text-zinc-500 font-mono">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={endMinute}
                  onChange={(e) => setEndMinute(parseInt(e.target.value) || 0)}
                  className="w-12 bg-slate-900 border border-zinc-750 rounded p-1.5 text-center font-mono text-xs text-white"
                />
                <span className="text-[10px] text-zinc-400 ml-1 font-mono">
                  {endHour >= 12 ? 'PM' : 'AM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini API Key Configuration */}
        <div>
          <label className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5 mb-1.5">
            <Key className="w-4 h-4 text-emerald-400" />
            Gemini 2.5 Flash API Key (Optional)
          </label>
          <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
            By default, Comeback operates with a pre-loaded bank of active recall questions. Add your Gemini API key here for live generation.
          </p>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-slate-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 font-mono focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-950/40"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Circadian Preferences</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetDefaults}
            className="w-full py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono text-[11px] transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard 10:30 PM - 07:00 AM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
