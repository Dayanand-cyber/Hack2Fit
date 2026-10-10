import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Brain, CheckCircle2, AlertOctagon, Flame, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../services/audio';

interface StroopTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPass: () => void;
  onFail: () => void;
}

interface StroopItem {
  word: string;
  textColorClass: string;
  correctColorName: string;
}

const COLOR_CONFIGS = [
  { name: 'RED', textClass: 'text-rose-500', bgClass: 'bg-rose-500/20 border-rose-500 text-rose-400' },
  { name: 'BLUE', textClass: 'text-cyan-400', bgClass: 'bg-cyan-500/20 border-cyan-500 text-cyan-300' },
  { name: 'GREEN', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' },
  { name: 'YELLOW', textClass: 'text-amber-300', bgClass: 'bg-amber-500/20 border-amber-500 text-amber-300' },
  { name: 'PURPLE', textClass: 'text-purple-400', bgClass: 'bg-purple-500/20 border-purple-500 text-purple-300' }
];

const TARGET_STREAK = 5;
const TOTAL_TIME_SECONDS = 45;

export const StroopTestModal: React.FC<StroopTestModalProps> = ({
  isOpen,
  onClose,
  onPass,
  onFail
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_TIME_SECONDS);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [currentItem, setCurrentItem] = useState<StroopItem | null>(null);

  // Generate a discordant Stroop trial (where word text != font color)
  const generateNewTrial = useCallback((): StroopItem => {
    const wordIndex = Math.floor(Math.random() * COLOR_CONFIGS.length);
    let colorIndex = Math.floor(Math.random() * COLOR_CONFIGS.length);
    // Ensure word and font color mismatch to induce the cognitive interference effect
    if (colorIndex === wordIndex) {
      colorIndex = (colorIndex + 1) % COLOR_CONFIGS.length;
    }

    return {
      word: COLOR_CONFIGS[wordIndex].name,
      textColorClass: COLOR_CONFIGS[colorIndex].textClass,
      correctColorName: COLOR_CONFIGS[colorIndex].name
    };
  }, []);

  // Initialize trial when modal opens
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(TOTAL_TIME_SECONDS);
      setStreak(0);
      setFeedback(null);
      setCurrentItem(generateNewTrial());
    }
  }, [isOpen, generateNewTrial]);

  // 45-second countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          soundFx.playError();
          onFail();
          return 0;
        }
        if (prev <= 10) {
          soundFx.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onFail]);

  // Handle color choice tap
  const handleAnswer = (selectedColorName: string) => {
    if (!currentItem) return;

    if (selectedColorName === currentItem.correctColorName) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setFeedback('correct');
      soundFx.playSuccess();

      if (nextStreak >= TARGET_STREAK) {
        // Passed the Stroop Dawn Alertness Test!
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          onPass();
        }, 300);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setCurrentItem(generateNewTrial());
        }, 180);
      }
    } else {
      // Failed trial resets streak and subtracts time
      soundFx.playError();
      setFeedback('wrong');
      setStreak(0);
      setSecondsLeft((prev) => Math.max(1, prev - 5)); // 5s penalty

      setTimeout(() => {
        setFeedback(null);
        setCurrentItem(generateNewTrial());
      }, 300);
    }
  };

  const progressPercent = useMemo(() => {
    return (streak / TARGET_STREAK) * 100;
  }, [streak]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-mono tracking-tight">
                DAWN ALERTNESS TEST
              </h2>
              <p className="text-[10px] text-zinc-400">Dynamic Stroop Cognitive Gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 bg-zinc-950/60 border-b border-zinc-850 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock className={`w-3.5 h-3.5 ${secondsLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-zinc-400'}`} />
            <span className={secondsLeft <= 10 ? 'text-rose-400 font-bold' : ''}>
              {secondsLeft}s left
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">
              Streak: {streak} / {TARGET_STREAK}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800 w-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Area */}
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Tap the <span className="text-zinc-100 font-bold underline decoration-violet-500">FONT COLOR</span> (Ignore the written word!)
          </p>

          <div
            className={`my-6 py-6 px-8 rounded-xl bg-slate-950/90 border border-zinc-800 w-full flex items-center justify-center transition-all transform ${
              feedback === 'wrong'
                ? 'animate-stutter border-rose-500/80 bg-rose-950/30'
                : feedback === 'correct'
                ? 'border-emerald-500/80 bg-emerald-950/30 scale-105'
                : ''
            }`}
          >
            {currentItem && (
              <span
                className={`text-4xl font-extrabold font-mono tracking-widest ${currentItem.textColorClass} transition-colors drop-shadow-md`}
              >
                {currentItem.word}
              </span>
            )}
          </div>

          {/* Color Options */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {COLOR_CONFIGS.map((c, idx) => (
              <button
                key={c.name}
                onClick={() => handleAnswer(c.name)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all duration-150 active:scale-95 shadow-sm ${c.bgClass} ${
                  idx === 4 ? 'col-span-2' : ''
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-zinc-400 mt-5 leading-normal">
            Passing awards <span className="text-emerald-400 font-semibold">15-min emergency unlock</span>. Failing triggers a <span className="text-rose-400 font-semibold">5-min feed lockout</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
