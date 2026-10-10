import React, { useState } from 'react';
import {
  Brain,
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generateQuestionFromNotes,
  SAMPLE_STUDY_NOTES
} from '../../services/gemini';
import { QuizQuestion } from '../../types';
import { ActivePassRing } from './ActivePassRing';
import { soundFx } from '../../services/audio';

interface StudyTollBoothProps {
  isDaytimePassActive: boolean;
  passTimeFormatted: string;
  progressPercent: number;
  remainingSeconds: number;
  onGrantPass: (minutes?: number) => void;
  onSwitchToFeed: () => void;
}

export const StudyTollBoothModal: React.FC<StudyTollBoothProps> = ({
  isDaytimePassActive,
  passTimeFormatted,
  progressPercent,
  remainingSeconds,
  onGrantPass,
  onSwitchToFeed
}) => {
  const [notesText, setNotesText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Handle file upload (txt, md, pdf fallback reading)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNotesText(content);
        setStatusMessage(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.readAsText(file);
  };

  // Generate question using Gemini 2.5 Flash
  const handleGenerateQuestion = async () => {
    const content = notesText.trim() || SAMPLE_STUDY_NOTES[0].content;
    setIsLoading(true);
    setStatusMessage('Querying Gemini 2.5 Flash for active recall synthesis...');
    setCurrentQuestion(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    try {
      const q = await generateQuestionFromNotes(content);
      setCurrentQuestion(q);
      setStatusMessage('');
      soundFx.playTick();
    } catch {
      setStatusMessage('Error synthesizing note. Using offline resilience bank.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check answer
  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    setIsAnswerSubmitted(true);

    if (selectedOption === currentQuestion.correctIndex) {
      soundFx.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onGrantPass(10);
      }, 500);
    } else {
      soundFx.playError();
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-105px)] overflow-y-auto p-4 pb-20 bg-slate-950 text-zinc-100 flex flex-col items-center">
      {/* Active Pass Status Card */}
      {isDaytimePassActive && (
        <div className="w-full max-w-sm mb-6">
          <ActivePassRing
            remainingSeconds={remainingSeconds}
            progressPercent={progressPercent}
            formattedTime={passTimeFormatted}
          />
          <button
            onClick={onSwitchToFeed}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95"
          >
            <span>Return to Unthrottled Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Study Gate Form */}
      <div className="w-full max-w-sm bg-slate-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Banner */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono tracking-tight text-white">
                THE STUDY TOLL-BOOTH
              </h3>
              <p className="text-[11px] text-zinc-400">Active Learning Social Gate</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 border border-violet-700/60 text-violet-300">
            GEMINI 2.5 FLASH
          </span>
        </div>

        {/* Explain the Mechanism */}
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Social consumption is gated behind cognitive effort. Paste notes or upload a doc to generate an active recall question. Answering correctly grants a <strong className="text-emerald-400">10-Minute Daytime Pass</strong>.
        </p>

        {/* Sample Notes Quick-Fill */}
        <div className="mb-3">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
            Quick-Fill Sample Notes:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_STUDY_NOTES.map((sample) => (
              <button
                key={sample.title}
                onClick={() => setNotesText(sample.content)}
                className="text-[10px] font-mono px-2 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white transition-colors"
              >
                + {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative mb-3">
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Paste your study notes, lecture summary, or research paper excerpt here..."
            rows={4}
            className="w-full bg-slate-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors font-sans resize-none"
          />
        </div>

        {/* File Upload & Generate Button */}
        <div className="flex items-center gap-2 mb-4">
          <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white cursor-pointer text-xs font-mono transition-colors">
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Upload Text/Doc</span>
            <input
              type="file"
              accept=".txt,.md,.pdf,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleGenerateQuestion}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-violet-950/40 border border-violet-400/30 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Gate</span>
              </>
            )}
          </button>
        </div>

        {statusMessage && (
          <p className="text-[11px] font-mono text-violet-400 mb-3 text-center animate-pulse">
            {statusMessage}
          </p>
        )}

        {/* Render Generated MCQ Challenge */}
        {currentQuestion && (
          <div className="mt-4 pt-4 border-t border-zinc-800 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Active Recall Gate
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Source: {currentQuestion.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Resilience Bank'}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-zinc-100 mb-3 leading-relaxed">
              {currentQuestion.question}
            </h4>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                let optionStyle = 'bg-slate-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-violet-950/70 border-violet-500 text-violet-200';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${optionStyle}`}
                  >
                    <span className="font-mono font-bold text-zinc-400 text-[11px] mt-0.5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit / Retry Actions */}
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-all disabled:opacity-40"
              >
                Submit Answer & Unlock
              </button>
            ) : (
              <div className="space-y-2.5">
                {selectedOption === currentQuestion.correctIndex ? (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2 text-xs text-emerald-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-mono">10-Minute Pass Granted!</span>
                      <p className="text-[11px] text-emerald-400/90 mt-0.5">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2 text-xs text-rose-300">
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-mono">Incorrect Answer.</span>
                      <p className="text-[11px] text-rose-300/90 mt-0.5">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerateQuestion}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Another Question</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
