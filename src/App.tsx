import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Background from "./components/Background";
import Home from "./screens/Home";
import Solo from "./screens/Solo";
import Comparative from "./screens/Comparative";
import Analyzing from "./screens/Analyzing";
import Results from "./screens/Results";

export type AnalysisResult = {
  score: number;
  grade: string;
  subScores: {
    pitch: number;
    rhythm: number;
    tone: number;
  };
  mistakes: { timestamp: string; description: string }[];
  tips: string[];
  quote: string;
};

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  return (
    <Router>
      <div className="min-h-screen text-[#F0EFEA] relative overflow-hidden font-sans">
        <Background />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solo" element={<Solo setAnalysisResult={setAnalysisResult} />} />
          <Route path="/comparative" element={<Comparative setAnalysisResult={setAnalysisResult} />} />
          <Route path="/analyzing" element={<Analyzing result={analysisResult} />} />
          <Route path="/results" element={<Results result={analysisResult} onReset={() => setAnalysisResult(null)} />} />
        </Routes>
      </div>
    </Router>
  );
}
