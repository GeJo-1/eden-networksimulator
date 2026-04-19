// src/components/layout/Header.jsx
import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-4 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Logo Section */}
      <div className="flex flex-col w-full sm:w-auto items-center sm:items-start group cursor-default">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 transition-transform duration-500 group-hover:scale-105">
          {/* EDEN Gradient (Deep ink for Light Mode, Neon for Dark Mode) */}
          <span className="italic text-transparent bg-clip-text bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-800 dark:from-cyan-300 dark:via-cyan-500 dark:to-blue-600 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] tracking-tighter">
            EDEN
          </span>
          {/* Cinematic TERMINUS text */}
          <span className="text-slate-800 dark:text-gray-100 font-light tracking-[0.4em] uppercase relative transition-colors">
            Terminus
            {/* Techy glowing underline accent that reveals on hover */}
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 dark:via-cyan-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></span>
          </span>
        </h1>
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
           <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-600 dark:bg-cyan-500 animate-ping shadow-none dark:shadow-[0_0_10px_#06b6d4]"></span>
           <span className="text-[8px] sm:text-[10px] font-mono text-cyan-700 dark:text-cyan-400 uppercase tracking-[0.3em] font-bold transition-colors">System Online</span>
        </div>
      </div>
      
      {/* Controls Container - Wraps on mobile */}
      <div className="flex flex-wrap items-center justify-center w-full sm:w-auto gap-3 sm:gap-4">
        
        {/* PORTFOLIO LINK BUTTON */}
        <a 
          href="https://gejo-1.github.io/Portfolio/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative inline-flex items-center justify-center px-4 py-1.5 text-[9px] sm:text-[10px] font-black tracking-widest uppercase overflow-hidden rounded-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-cyan-500/50 hover:border-cyan-500 dark:hover:border-cyan-400 text-slate-700 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-[0_0_15px_rgba(34,211,238,0.2)] dark:hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:-translate-y-0.5"
        >
          {/* Animated hover gradient */}
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-100/50 to-blue-100/50 dark:from-cyan-500/20 dark:to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          
          <span className="relative z-10 flex items-center gap-2">
            Designed & Built By Gerald Annan
            {/* Small animated arrow */}
            <svg className="w-3 h-3 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 group-hover:text-cyan-800 dark:group-hover:text-white transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </a>

        {/* Static Hardware Telemetry Badge */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 backdrop-blur-xl shadow-sm dark:shadow-inner cursor-default transition-colors duration-500">
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-500 transition-colors">EDEN TECH CORE</span>
          </div>
          
          {/* Fake Signal/Activity Bars for aesthetic */}
          <div className="flex items-end gap-0.5 h-4">
            <div className="w-1 h-1.5 bg-cyan-800 dark:bg-cyan-600 rounded-sm transition-colors"></div>
            <div className="w-1 h-2.5 bg-cyan-700 dark:bg-cyan-500 rounded-sm transition-colors"></div>
            <div className="w-1 h-3.5 bg-cyan-600 dark:bg-cyan-400 rounded-sm transition-colors"></div>
            <div className="w-1 h-full bg-cyan-500 dark:bg-white animate-pulse rounded-sm shadow-none dark:shadow-[0_0_8px_#22d3ee] transition-colors"></div>
          </div>
        </div>

      </div>
    </header>
  );
}