import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div id="home-screen" className="min-h-screen flex flex-col items-center justify-center p-[32px_28px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 id="logo" className="text-[#F5C518] text-7xl font-bold mb-3 tracking-tighter">
          MelodAI
        </h1>
        <p className="text-[#555555] text-xs uppercase tracking-[0.4em] font-medium mb-16">
          Rate your singing with AI
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <button
            id="btn-solo"
            onClick={() => navigate("/solo")}
            className="bg-[#F5C518] text-black font-bold py-5 px-8 rounded-sm hover:opacity-90 transition-opacity cursor-pointer text-sm uppercase tracking-widest"
          >
            Solo Singing
          </button>
          <button
            id="btn-comparative"
            onClick={() => navigate("/comparative")}
            className="bg-transparent border-[0.5px] border-white/20 text-[#F0EFEA] font-bold py-5 px-8 rounded-sm hover:bg-white hover:text-black transition-all cursor-pointer text-sm uppercase tracking-widest"
          >
            Comparative Singing
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
