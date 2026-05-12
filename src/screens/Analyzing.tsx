import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../App";

const STEPS = [
  "Removing background noise",
  "Extracting vocals from song",
  "Analyzing pitch and rhythm",
  "Comparing with reference",
  "Generating AI feedback",
];

const Analyzing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const analysisStarted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { soloFile, originalFile, singingFile } = location.state || {};
  
  const filteredSteps = useMemo(() => {
    return originalFile ? STEPS : [STEPS[0], STEPS[2], STEPS[4]];
  }, [originalFile]);

  const trimAudio = async (file: File, startSec: number, durationSec: number): Promise<Blob> => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      const sampleRate = audioBuffer.sampleRate;
      const startOffset = Math.floor(startSec * sampleRate);
      const frameCount = Math.floor(durationSec * sampleRate);
      
      // If song is too short to skip 10s, just return original
      if (startOffset >= audioBuffer.length) return new Blob([arrayBuffer], { type: file.type });

      const trimmedBuffer = audioCtx.createBuffer(
        audioBuffer.numberOfChannels,
        Math.min(frameCount, audioBuffer.length - startOffset),
        sampleRate
      );

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const trimmedData = trimmedBuffer.getChannelData(i);
        trimmedData.set(channelData.subarray(startOffset, startOffset + trimmedBuffer.length));
      }

      return audioBufferToWav(trimmedBuffer);
    } catch (err) {
      console.warn("Trimming failed, using original file:", err);
      return file;
    }
  };

  useEffect(() => {
    if (analysisStarted.current) return;
    analysisStarted.current = true;

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < filteredSteps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      }
    }, 2000);

    const performAnalysis = async () => {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          systemInstruction: "You are a professional singing judge. Be objective, consistent, and highly critical. Focus deeply on rhythm, phrasing ('andaz'), and the vocal character. Don't just compare frequencies; analyze how well the student captures the soul and timing of the performance. BE DECISIVE: assign a specific and varied grade based on performance quality. Do NOT default to 'Average' or 'Good' if the performance can be more precisely described. Use the full range of grades provided.",
        });
        
        let prompt = "";
        const parts: any[] = [];

        if (soloFile) {
          const soloBase64 = await fileToBase64(soloFile);
          parts.push({
            inlineData: {
              data: soloBase64.split(",")[1],
              mimeType: soloFile.type,
            },
          });
          prompt = `Analyze this solo singing recording. Provide a detailed professional rating.
          Return JSON: { 
            score: number (0-100), 
            grade: string (Choose the most accurate from: "Newbie", "Rough Start", "Needs Work", "Learning", "Getting Better", "Basic", "Fair", "Average", "Decently Fine", "Above Average", "Steady", "Skillful", "Good", "Very Good", "Great", "Really Good", "Amazing", "Superior", or "Star"), 
            subScores: { pitch: number, rhythm: number, tone: number }, 
            mistakes: [{timestamp: string, description: string}], 
            tips: [string], 
            quote: string 
          }`;
        } else if (originalFile && singingFile) {
          // Optimized: Skip first 10s, analyze 60s
          const trimmedOriginal = await trimAudio(originalFile, 10, 60);
          const trimmedSinging = await trimAudio(singingFile, 10, 60);

          const originalBase64 = await fileToBase64(new File([trimmedOriginal], "ref.wav"));
          const singingBase64 = await fileToBase64(new File([trimmedSinging], "user.wav"));
          
          parts.push({
            inlineData: { data: originalBase64.split(",")[1], mimeType: "audio/wav" },
          });
          parts.push({
            inlineData: { data: singingBase64.split(",")[1], mimeType: "audio/wav" },
          });
          prompt = `Compare the second recording (student) to the first (original artist). 
          Focus on deep rhythmic analysis, 'andaz' (style), and phrasing. 
          The audio clips provided are 60-second segments starting from the 10-second mark of the performance.
          Rate how perfectly the student matches the rhythmic vibe and emotional delivery. 
          Return JSON: { 
            score: number (0-100), 
            grade: string (Choose the most accurate from: "Not Close", "Missed Vibe", "Needs Practice", "Weak Match", "Small Effort", "Bit Mixed", "Fair Match", "Middle Match", "Getting There", "Decent Match", "Good Vibe", "Solid Effort", "Very Warm", "Strong Match", "Very Close", "Almost Twin", or "Perfect Match"), 
            subScores: { pitch: number, rhythm: number, tone: number }, 
            mistakes: [{timestamp: string, description: string}], 
            tips: [string], 
            quote: string 
          }`;
        }

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [...parts, { text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const analysisResult = JSON.parse(result.response.text());
        
        timeoutRef.current = setTimeout(() => {
          navigate("/results", { state: { result: analysisResult }, replace: true });
        }, 1500);

      } catch (err) {
        console.error("Analysis failed:", err);
        navigate("/");
      }
    };

    performAnalysis();

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filteredSteps, navigate, originalFile, soloFile, singingFile]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div id="analyzing-screen" className="min-h-screen flex flex-col items-center justify-center p-[32px_28px] text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-16 h-16 border-4 border-[#F5C518]/20 border-t-[#F5C518] rounded-full mb-8"
      />
      <h2 className="text-2xl font-medium mb-2 uppercase tracking-widest text-[#F0EFEA]">Analyzing your voice...</h2>
      <motion.p
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[#555555] text-xs tracking-[0.2em] uppercase font-bold"
      >
        {filteredSteps[currentStep]}
      </motion.p>
    </div>
  );
};

// Helper function to encode AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const bufferHeader = new ArrayBuffer(44 + dataLength);
  const view = new DataView(bufferHeader);

  const writeString = (v: DataView, o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  const offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = buffer.getChannelData(channel)[i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset + (i * numChannels + channel) * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
  }

  return new Blob([bufferHeader], { type: 'audio/wav' });
}

export default Analyzing;
