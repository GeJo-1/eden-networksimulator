// src/components/layout/LandingPage.jsx
import React, { useState } from 'react';

// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// --- Static Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function LandingPage({ onEnter }) {
  // --- NEW: Parallax Mouse Tracking ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Normalize mouse position to range between -1 and 1 for smooth parallax math
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="h-[100dvh] w-full bg-gray-950 flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden font-sans"
    >
      
      {/* --- NEW: CRT Scanlines & Vignette Overlay --- */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.15)_1px,rgba(0,0,0,0.15)_2px)] opacity-50"></div>
      <div className="absolute inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>

      {/* --- THE INFINITE 3D FLOOR (Now with Parallax!) --- */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden" 
        style={{ perspective: '1000px' }}
        // The background shifts slightly in the direction of the mouse
        animate={{ x: mousePos.x * -15, y: mousePos.y * -15 }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      >
        <motion.div 
          className="absolute bottom-0 w-[200%] h-[150%] left-[-50%]"
          style={{
            transformOrigin: 'bottom',
            transform: 'rotateX(75deg)', 
            backgroundImage: `
              linear-gradient(to right, rgba(34, 211, 238, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(34, 211, 238, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPositionY: ['0px', '60px'], 
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 1.5 
          }}
        >
          {/* Dynamic Floor Shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-gray-950/90 to-gray-950"></div>
        </motion.div>
        
        {/* Top Horizon Glow */}
        <div className="absolute top-1/4 left-0 w-full h-[2px] bg-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.5)] blur-md"></div>
      </motion.div>

      {/* --- MAIN UI CONTAINER (Floats opposite to background) --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        // The UI shifts opposite to the mouse, creating massive 3D depth
        whileHover={{ x: mousePos.x * 10, y: mousePos.y * 10 }}
        transition={{ type: "spring", stiffness: 70, damping: 25 }}
        className="relative z-10 w-full max-w-5xl h-full flex flex-col items-center justify-center gap-6 md:gap-10"
      >
        
        {/* --- 1. HEADER LOGO --- */}
        <motion.div variants={itemVariants} className="flex flex-col items-center cursor-default shrink-0">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black flex items-center gap-3 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            <span className="italic text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-cyan-500 to-blue-600 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] tracking-tighter">
              EDEN
            </span>
            <span className="text-gray-100 font-light tracking-[0.2em] sm:tracking-[0.4em] uppercase relative">
              Terminus
            </span>
          </h1>
          <div className="mt-4 flex items-center gap-3 opacity-90">
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <span className="text-[9px] sm:text-xs font-mono text-cyan-300 uppercase tracking-[0.3em] md:tracking-[0.4em] drop-shadow-lg">Interactive Hardware Simulation</span>
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-cyan-400"></div>
          </div>
        </motion.div>

        {/* --- 2. UNIFIED BENTO GRID --- */}
        <motion.div variants={itemVariants} className="w-full glass-panel border border-cyan-900/40 bg-gray-950/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 opacity-70 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            
            {/* VISION */}
            <div className="p-5 sm:p-6 lg:p-8 relative group hover:bg-cyan-900/10 transition-colors duration-500 flex flex-col justify-center">
              <h2 className="text-blue-400 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Vision
              </h2>
              <p className="text-gray-400 group-hover:text-gray-200 transition-colors text-[11px] sm:text-xs lg:text-sm leading-relaxed font-medium">
                To redefine how technical skills are learned by building the most intuitive and immersive digital lab experience.
              </p>
            </div>

            {/* MISSION */}
            <div className="p-5 sm:p-6 lg:p-8 relative group hover:bg-cyan-900/10 transition-colors duration-500 flex flex-col justify-center">
              <h2 className="text-cyan-400 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.017 21L16.4 14.017M15.983 3L13.6 9.983M3 14.017L9.983 16.4M21 9.983L14.017 7.6M12 12h.01M12 12a1 1 0 11-2 0 1 1 0 012 0zm0 0a5 5 0 11-10 0 5 5 0 0110 0zm0 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Mission
              </h2>
              <p className="text-gray-400 group-hover:text-gray-200 transition-colors text-[11px] sm:text-xs lg:text-sm leading-relaxed font-medium">
                To replace passive learning with real interaction, giving anyone the ability to practice and master networking skills through simulation that feels real.
              </p>
            </div>

            {/* OBJECTIVES */}
            <div className="p-5 sm:p-6 lg:p-8 relative group hover:bg-cyan-900/10 transition-colors duration-500 flex flex-col justify-center">
              <h2 className="text-indigo-400 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                Objectives
              </h2>
              <ul className="text-gray-400 group-hover:text-gray-200 transition-colors text-[11px] sm:text-xs lg:text-sm leading-relaxed font-medium space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">›</span> 
                  Provide a tactile environment for Layer 1 termination.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">›</span> 
                  Visualize complex data flows through dynamic mapping.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">›</span> 
                  Implement realistic diagnostics for active troubleshooting.
                </li>
              </ul>
            </div>

          </div>
        </motion.div>

        {/* --- 3. ACTION BUTTON --- */}
        <motion.div variants={itemVariants} className="flex flex-col items-center shrink-0">
          <button 
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 text-xs sm:text-sm font-black tracking-[0.2em] sm:tracking-[0.3em] text-cyan-50 uppercase overflow-hidden rounded-full bg-gray-950 border border-cyan-500/50 hover:border-cyan-300 transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:-translate-y-1"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.8)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/50 to-blue-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></span>
            
            <span className="relative z-10 flex items-center gap-3">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 group-hover:bg-white group-hover:animate-ping transition-colors shadow-[0_0_8px_#22d3ee]"></span>
              Initialize Terminus
            </span>
          </button>
        </motion.div>

      </motion.div>

      {/* --- FOOTER --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="w-full text-center pb-2 shrink-0 z-10"
      >
        <p className="text-[9px] sm:text-[10px] font-mono text-cyan-100/60 tracking-widest uppercase bg-black/60 inline-block px-4 py-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          Designed & Built By <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Gerald Annan</span>
        </p>
      </motion.div>
      
    </div>
  );
}