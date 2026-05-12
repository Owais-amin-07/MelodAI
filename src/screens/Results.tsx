import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, AlertCircle, Info, Quote } from "lucide-react";
import { AnalysisResult } from "../App";

interface ResultsProps {
  result: AnalysisResult | null;
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ onReset }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const result: AnalysisResult = location.state?.result;

  if (!result) {
    return <div className="p-8">No results found.</div>;
  }

  const handleBack = () => {
    onReset();
    navigate("/");
  };

  return (
    <div id="results-screen" className="min-h-screen p-[32px] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-[1024px] mx-auto flex flex-col h-full min-h-[700px]"
      >
        {/* Header */}
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div className="text-[#F5C518] text-3xl font-bold tracking-tighter cursor-pointer" onClick={handleBack}>MelodAI</div>
          <button 
            onClick={handleBack}
            className="text-[#555555] hover:text-[#F0EFEA] text-xs uppercase tracking-widest transition-colors cursor-pointer"
          >
            ← Back to home
          </button>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-12 flex-grow items-center">
          
          {/* Left Column: Scores */}
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-center space-y-10">
            <div className="flex items-end gap-6">
              <span className="text-[120px] md:text-[140px] leading-none font-black text-[#F5C518] tracking-tighter">
                {result.score}
              </span>
              <div className="mb-4">
                <span className="text-[#555555] block text-[10px] uppercase tracking-[0.2em] mb-1">Overall Grade</span>
                <span className="text-4xl font-semibold text-[#F0EFEA]">{result.grade}</span>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <ScoreRow label="Pitch Accuracy" value={result.subScores.pitch} />
              <ScoreRow label="Rhythmic Stability" value={result.subScores.rhythm} />
              <ScoreRow label="Tone Quality" value={result.subScores.tone} />
            </div>
          </div>

          {/* Right Column: Feedback */}
          <div className="col-span-12 lg:col-span-7 flex flex-col space-y-6">
            {/* Mistakes Section */}
            <div className="bg-[#141414] border-[0.5px] border-white/10 p-8 rounded-sm">
              <h3 className="text-[#555555] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Analysis: Mistakes</h3>
              <ul className="space-y-5">
                {result.mistakes && result.mistakes.length > 0 ? (
                  result.mistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#E24B4A] mt-1.5 shrink-0" />
                      <p className="text-sm text-[#F0EFEA]/90">
                        <span className="text-[#555555] font-mono mr-2 text-xs">{mistake.timestamp}</span>
                        {mistake.description}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#F0EFEA]/60 italic">No major mistakes detected — great job!</li>
                )}
              </ul>
            </div>

            {/* Tips Section */}
            <div className="bg-[#141414] border-[0.5px] border-white/10 p-8 rounded-sm flex-grow">
              <h3 className="text-[#378ADD] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">AI Improvements</h3>
              <div className="space-y-6">
                {result.tips.map((tip, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-[#378ADD] font-bold opacity-50 text-base">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm text-[#F0EFEA]/80 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Quote */}
        <footer className="mt-12 shrink-0">
          <div className="border-l-[3px] border-[#F5C518] pl-6 py-2">
            <p className="text-[#F0EFEA]/80 italic font-serif text-lg leading-relaxed max-w-2xl">
              "{result.quote}"
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold text-[#F5C518] tracking-widest">Daily Motivation</span>
              <div className="h-[1px] w-12 bg-white/10" />
              <span className="text-[10px] text-[#555555] uppercase tracking-widest">AI Vocal Coach</span>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

const ScoreRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-[#555555]">
      <span>{label}</span>
      <span className="text-[#F5C518] font-mono">{value}/100</span>
    </div>
    <div className="h-[3px] bg-[#141414] w-full rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="h-full bg-[#F5C518] rounded-full"
      />
    </div>
  </div>
);

export default Results;
