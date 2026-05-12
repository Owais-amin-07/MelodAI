import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Mic, Square } from "lucide-react";
import { motion } from "motion/react";
import { AnalysisResult } from "../App";

interface SoloProps {
  setAnalysisResult: (result: AnalysisResult | null) => void;
}

const Solo: React.FC<SoloProps> = ({ setAnalysisResult }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startAnalysis(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        const file = new File([audioBlob], "recording.wav", { type: "audio/wav" });
        startAnalysis(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startAnalysis = (file: File) => {
    navigate("/analyzing", { state: { soloFile: file } });
  };

  return (
    <div id="solo-screen" className="min-h-screen p-[32px_28px]">
      <button onClick={() => navigate("/")} className="mb-8 hover:text-[#F5C518] transition-colors cursor-pointer">
        <ArrowLeft size={32} />
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-xl mx-auto"
      >
        <h2 className="text-[#555555] text-xs uppercase tracking-[0.3em] font-bold mb-12">Solo — sing freely</h2>

        <label className="block w-full border-[0.5px] border-white/10 rounded-sm bg-[#141414] p-16 text-center cursor-pointer hover:bg-[#1c1c1c] transition-colors mb-8">
          <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
          <div className="flex flex-col items-center">
            <Music className="text-[#F5C518] mb-4" size={48} />
            <span className="text-xl font-medium mb-1 uppercase tracking-widest text-[#F5C518]">Drop Audio</span>
            <span className="text-[#555555] text-[10px] uppercase tracking-[0.2em]">MP3 WAV OGG</span>
          </div>
        </label>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-[0.5px] flex-1 bg-white/5" />
          <span className="text-[#555555] text-[10px] uppercase tracking-widest font-bold">or</span>
          <div className="h-[0.5px] flex-1 bg-white/5" />
        </div>

        <div className="space-y-4">
          {isRecording && (
            <div className="text-center font-mono text-[#F5C518] text-2xl mb-4 animate-pulse">
              {formatTime(recordingTime)}
            </div>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full flex items-center justify-center gap-3 py-6 rounded-sm transition-all font-bold uppercase tracking-widest text-sm ${
              isRecording ? "bg-red-500 text-white" : "bg-transparent border-[0.5px] border-[#378ADD] text-[#378ADD]"
            } cursor-pointer hover:opacity-90`}
          >
            {isRecording ? (
              <>
                <Square size={20} fill="currentColor" />
                Stop recording
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                Start recording now
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Solo;
