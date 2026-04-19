// src/App.jsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { flushSync } from 'react-dom'; // <-- View Transitions needs this!

import { useSimulator } from './hooks/useSimulator';
import { useNetwork } from './hooks/useNetwork';

import { motion, AnimatePresence } from 'framer-motion';

import LandingPage from './components/layout/LandingPage'; 
import Header from './components/layout/Header';
import Workbench from './components/lab/Workbench';
import Canvas from './components/lab/Canvas';
import DiagnosticsPanel from './components/tools/DiagnosticPanel'; 
import ReferenceModal from './components/tools/ReferenceModal';
import NetworkCanvas from './components/network/NetworkCanvas'; 

const MotionDiv = motion.div;

// --- UPDATED: Persistent Layout Wrapper with Theme Support ---
const AppLayout = ({ children, simulatorData, theme, toggleTheme }) => {
  const location = useLocation();
  const isLab = location.pathname === '/lab';
  const isNetwork = location.pathname === '/network';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 font-sans flex flex-col overflow-hidden transition-colors duration-500">
      <ReferenceModal 
       isOpen={simulatorData.state.isRefOpen} 
       onClose={() => simulatorData.setters.setIsRefOpen(false)} 
      />

      {/* Header only renders in Lab Mode */}
      {isLab && <Header {...simulatorData} />}
      
      {/* NAVIGATION TABS & THEME TOGGLE */}
      <div className="w-full bg-white/80 dark:bg-black/40 border-b border-slate-200 dark:border-white/5 flex items-center justify-between z-40 relative backdrop-blur-md shadow-sm dark:shadow-md shrink-0 min-h-[48px] px-2 sm:px-6 transition-colors duration-500">
        
        {/* Invisible counterweight to keep the center tabs perfectly centered on large screens */}
        <div className="w-8 shrink-0 hidden sm:block pointer-events-none opacity-0"></div>

        {/* Center Tabs - Now scrollable on ultra-narrow screens */}
        <div className="flex justify-center flex-grow overflow-x-auto hide-scrollbar">
          <Link 
            to="/lab"
            className={`px-3 sm:px-8 py-3 text-[8px] sm:text-[10px] whitespace-nowrap font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-b-2 ${isLab ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20' : 'border-transparent text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            Terminal 01: Termination Lab
          </Link>
          <Link 
            to="/network"
            className={`px-3 sm:px-8 py-3 text-[8px] sm:text-[10px] whitespace-nowrap font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-b-2 ${isNetwork ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20' : 'border-transparent text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            Terminal 02: Topology Grid
          </Link>
        </div>

        {/* Right: Theme Toggle Button - Now a robust flex item */}
        <button 
          onClick={toggleTheme}
          className="shrink-0 ml-2 sm:ml-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-cyan-400 hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors shadow-inner overflow-hidden group"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'dark' ? (
              <motion.svg key="moon" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </motion.svg>
            ) : (
              <motion.svg key="sun" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="w-5 h-5 text-amber-500 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

      </div>

      {children}
    </div>
  );
};


// --- The Main Routing Logic ---
function AppContent() {
  const simulatorData = useSimulator();
  const networkData = useNetwork(); 
  const navigate = useNavigate();

  // Default to dark mode because it's the primary EDEN Tech aesthetic
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('eden_terminus_theme') || 'dark';
  });

  // Watch for theme changes and inject the class into the raw HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Save their preference so it remembers if they refresh
    localStorage.setItem('eden_terminus_theme', theme);
  }, [theme]);

  // THE MAGIC: View Transitions API for buttery smooth theme toggling
  const toggleTheme = () => {
    if (!document.startViewTransition) {
      setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
      });
    });
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onEnter={() => navigate('/lab')} />} />
      
      <Route path="/lab" element={
        <AppLayout simulatorData={simulatorData} theme={theme} toggleTheme={toggleTheme}>
          <main className="flex-grow flex flex-col lg:flex-row relative overflow-y-auto lg:overflow-hidden animate-in fade-in duration-500">
            <Workbench {...simulatorData} />
            <Canvas {...simulatorData} />
            <DiagnosticsPanel {...simulatorData} />
          </main>
        </AppLayout>
      } />

      <Route path="/network" element={
        <AppLayout simulatorData={simulatorData} theme={theme} toggleTheme={toggleTheme}>
          <main className="flex-grow flex relative overflow-hidden animate-in fade-in duration-500">
            <NetworkCanvas {...networkData} />
          </main>
        </AppLayout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}