import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '../../types';
import { OFFLINE_QUESTION_BANK } from '../../services/gemini';
import { soundFx } from '../../services/audio';

interface StudyRecallInterventionProps {
  onComplete: () => void;
  customQuestion?: QuizQuestion | null;
}

export const StudyRecallIntervention: React.FC<StudyRecallInterventionProps> = ({
  onComplete,
  customQuestion
}) => {
  // Pick a random question from the bank or use provided
  const [question] = useState<QuizQuestion>(() => {
    if (customQuestion) return customQuestion;
    const idx = Math.floor(Math.random() * OFFLINE_QUESTION_BANK.length);
    return OFFLINE_QUESTION_BANK[idx];
  });

  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30); // 30-second review lock

  // Handle tap anywhere on screen to reveal answer
  const handleTapScreen = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      soundFx.playSuccess();
    }
  };

  // 30-second countdown once revealed
  useEffect(() => {
    if (!isRevealed) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRevealed]);

  return (
    <div
      onClick={handleTapScreen}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 select-none animate-fadeIn cursor-pointer font-sans"
    >
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 pt-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/50 text-violet-300 font-mono text-[10px] uppercase tracking-wider mb-2">
          <Brain className="w-3.5 h-3.5 text-violet-400" />
          <span>DAYTIME PROTOCOL // 30-MIN STUDY CHECK</span>
        </div>

        <h2 className="text-xl font-black text-white font-mono tracking-tight">
          Active Retrieval Challenge
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Reinforcing memory retention before returning to feed
        </p>
      </div>

      {/* Question Card */}
      <div className="relative z-10 my-auto w-full max-w-sm mx-auto bg-slate-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Question Text */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase mb-2">
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Concept Recall Question</span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
            {question.question}
          </h3>
        </div>

        {/* State 1: Answer Hidden -> Tap anywhere to reveal */}
        {!isRevealed ? (
          <div className="p-6 rounded-xl bg-violet-950/20 border-2 border-dashed border-violet-500/40 text-center animate-pulse">
            <div className="w-12 h-12 mx-auto rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-violet-200 font-mono">
              Tap Anywhere to Reveal Answer
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1">
              Recall the answer in your mind first for maximum synaptic plasticity!
            </p>
          </div>
        ) : (
          /* State 2: Answer Revealed with 30s Review Countdown */
          <div className="space-y-3 animate-fadeIn">
            {/* Correct Answer */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>CORRECT ANSWER:</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                {question.options[question.correctIndex]}
              </p>
            </div>

            {/* Explanation */}
            <div className="p-3 rounded-xl bg-slate-950 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
              <span className="font-mono text-violet-400 font-semibold block mb-1 text-[10px] uppercase">
                Core Mechanism:
              </span>
              {question.explanation}
            </div>

            {/* 30-Second Review Timer */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                    Review Lock
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {countdown > 0 ? `${countdown}s remaining` : 'Review Completed'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="relative z-10 pb-4 text-center max-w-sm mx-auto w-full">
        {isRevealed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold shadow-xl shadow-violet-950/60 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>{countdown > 0 ? `Continue to Reels (Skip ${countdown}s)` : 'Continue Watching Reels'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
