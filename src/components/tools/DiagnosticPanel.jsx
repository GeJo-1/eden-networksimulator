// src/components/tools/DiagnosticPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';

const MotionButton = motion.button;

export default function DiagnosticPanel({ state, actions }) {
  const { isCrimped, isTesting, testerStep, diagnosticMsg, pins } = state;
  const { runTester, resetLab } = actions;

  // Authentically parse the diagnostic message for the small LCD screen
  let lcdStatus = "READY";
  if (!isCrimped) lcdStatus = "NO CABLE";
  else if (isTesting) lcdStatus = "TESTING";
  else if (diagnosticMsg.status === 'success') lcdStatus = "PASS";
  else if (diagnosticMsg.status === 'error') {
     if (diagnosticMsg.text.includes("SPLIT") || diagnosticMsg.text.includes("CROSS")) lcdStatus = "SPLIT";
     else if (diagnosticMsg.text.includes("OPEN") || diagnosticMsg.text.includes("MISSING")) lcdStatus = "OPEN";
     else lcdStatus = "FAIL";
  }

  return (
    <aside className="w-full lg:w-1/4 bg-slate-200 dark:bg-gray-950 p-4 sm:p-6 border-l border-slate-300 dark:border-white/5 flex flex-col items-center justify-center relative transition-colors duration-500 z-20 min-h-[500px]">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:15px_15px] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]"></div>

      {/* ========================================= */}
      {/* THE FLUKE TESTER HARDWARE CHASSIS */}
      {/* ========================================= */}
      <div className="w-full max-w-[260px] bg-[#2a2d34] rounded-[2rem] border-[12px] border-[#eab308] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_5px_15px_rgba(255,255,255,0.1)] flex flex-col relative pb-8 pt-6 z-10 mt-8">
        
        {/* Physical Top RJ45 Port Hole */}
        <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-16 h-6 bg-[#111] rounded-b border border-t-0 border-[#444] shadow-inner flex items-start justify-center pt-1 z-0">
           <div className="w-10 h-2 bg-black rounded-sm border border-[#333] shadow-[inset_0_2px_5px_black]"></div>
        </div>

        {/* Left Rubber Grip */}
        <div className="absolute top-16 bottom-16 -left-[18px] w-[6px] bg-[#1a1c1e] rounded-l-md flex flex-col justify-evenly py-4 border-y border-l border-[#333]">
           {[1,2,3,4,5,6].map(i => <div key={`lg-${i}`} className="w-full h-1 bg-[#111] shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>)}
        </div>

        {/* Right Rubber Grip */}
        <div className="absolute top-16 bottom-16 -right-[18px] w-[6px] bg-[#1a1c1e] rounded-r-md flex flex-col justify-evenly py-4 border-y border-r border-[#333]">
           {[1,2,3,4,5,6].map(i => <div key={`rg-${i}`} className="w-full h-1 bg-[#111] shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>)}
        </div>

        {/* ----------------------------------------- */}
        {/* THE GREEN BACKLIT LCD SCREEN */}
        {/* ----------------------------------------- */}
        <div className="px-4">
            <div className={`w-full h-56 bg-[#9ea98f] rounded-lg border-4 border-[#1a1c1e] p-2 flex flex-col relative shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-300
                ${isTesting || (isCrimped && diagnosticMsg.status === 'success') ? 'shadow-[inset_0_0_40px_rgba(134,239,172,0.6)] bg-[#a8ba94]' : ''}`}>
                
                {/* Glass Glare Reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20"></div>

                {/* Top Status Bar */}
                <div className="flex justify-between items-center text-[#1a1c1e] opacity-80 mb-1 z-10">
                    <span className="font-black text-[8px] tracking-widest uppercase">Wiremap</span>
                    {/* Battery Icon */}
                    <div className="w-4 h-2 border border-[#1a1c1e] rounded-[1px] relative">
                        <div className="absolute top-0 bottom-0 left-0 w-[75%] bg-[#1a1c1e]"></div>
                        <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[1px] h-1 bg-[#1a1c1e]"></div>
                    </div>
                </div>

                {/* The Wiremap SVG Area */}
                <div className="flex-grow flex justify-between relative mt-2 mb-6">
                    {/* Left Column (End A) */}
                    <div className="flex flex-col justify-between h-full font-mono text-[10px] font-black text-[#1a1c1e] z-10 relative">
                        {[0,1,2,3,4,5,6,7].map(i => (
                        <span key={`a-${i}`} className={`transition-opacity ${isCrimped && (testerStep >= i || (!isTesting && diagnosticMsg.status !== 'idle')) ? 'opacity-100' : 'opacity-15'}`}>
                            {i + 1}
                        </span>
                        ))}
                    </div>

                    {/* Digital SVG Connecting Lines */}
                    <div className="absolute inset-y-1 left-4 right-4 z-0">
                        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                                const wireA = pins?.A?.[i];
                                const bIndex = wireA ? pins.B.findIndex(w => w && w.id === wireA.id) : -1;
                                
                                const y1 = `${(i / 7) * 100}%`;
                                const isVisible = isCrimped && (testerStep >= i || (!isTesting && diagnosticMsg.status !== 'idle'));
                                const isCurrent = isTesting && testerStep === i;
                                
                                if (!isCrimped && !isVisible) return null;

                                if (bIndex !== -1) {
                                    const y2 = `${(bIndex / 7) * 100}%`;
                                    return (
                                        <line 
                                            key={`line-${i}`}
                                            x1="0%" y1={y1} x2="100%" y2={y2}
                                            stroke="#1a1c1e" 
                                            strokeWidth={isCurrent ? 4 : 2}
                                            strokeDasharray={isCurrent ? "4,2" : "none"}
                                            className={`transition-opacity duration-75 ${isVisible ? 'opacity-90' : 'opacity-10'}`}
                                        />
                                    );
                                } else {
                                    // Open Fault LCD rendering
                                    return (
                                        <g key={`line-${i}`}>
                                            <line x1="0%" y1={y1} x2="40%" y2={y1} stroke="#1a1c1e" strokeWidth={2} className={`transition-opacity ${isVisible ? 'opacity-90' : 'opacity-10'}`} />
                                            {isVisible && <text x="50%" y={y1} fill="#1a1c1e" fontSize="6" fontWeight="bold" dominantBaseline="central" textAnchor="middle" className="font-mono">OPEN</text>}
                                        </g>
                                    );
                                }
                            })}
                        </svg>
                    </div>

                    {/* Right Column (End B) */}
                    <div className="flex flex-col justify-between h-full font-mono text-[10px] font-black text-[#1a1c1e] z-10 relative text-right">
                        {[0,1,2,3,4,5,6,7].map(i => {
                            let isVisible = false;
                            if (isCrimped) {
                                const wireAIndex = pins.A.findIndex(wireA => wireA && pins.B[i] && pins.B[i].id === wireA.id);
                                if (wireAIndex !== -1) {
                                    isVisible = testerStep >= wireAIndex || (!isTesting && diagnosticMsg.status !== 'idle');
                                }
                            }
                            return (
                            <span key={`b-${i}`} className={`transition-opacity ${isVisible ? 'opacity-100' : 'opacity-15'}`}>
                                {i + 1}
                            </span>
                            )
                        })}
                    </div>
                </div>

                {/* Bottom Status Readout */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end z-10">
                    <div className="text-[7px] font-black leading-tight max-w-[60%] opacity-80 uppercase text-[#1a1c1e]">
                        {isCrimped && !isTesting && diagnosticMsg.status === 'error' && (
                            <span className="animate-pulse">{diagnosticMsg.text}</span>
                        )}
                    </div>
                    <div className={`text-xl font-black tracking-widest text-[#1a1c1e] ${lcdStatus === 'PASS' ? 'animate-pulse' : ''}`}>
                        {lcdStatus}
                    </div>
                </div>
            </div>
        </div>

        {/* ----------------------------------------- */}
        {/* TACTILE HARDWARE BUTTONS */}
        {/* ----------------------------------------- */}
        <div className="mt-8 px-6 grid grid-cols-3 gap-2">
          
          {/* PWR / RESET Button */}
          <div className="flex flex-col items-center gap-1">
            <MotionButton 
              whileTap={{ scale: 0.9, y: 3, boxShadow: "inset 0 4px 8px rgba(0,0,0,0.8)" }}
              onClick={resetLab}
              className="w-10 h-10 rounded-full bg-[#4a4d54] border-2 border-[#1a1c1e] shadow-[0_4px_0_#1a1c1e] flex items-center justify-center text-white/50 text-xs font-black transition-transform"
            >
              ⏻
            </MotionButton>
            <span className="text-[6px] text-white/40 font-black tracking-widest">PWR/RST</span>
          </div>

          {/* MAIN TEST Button */}
          <div className="flex flex-col items-center gap-1 relative -top-3 z-20">
            <MotionButton 
              whileTap={!isCrimped || isTesting ? {} : { scale: 0.9, y: 5, boxShadow: "inset 0 6px 12px rgba(0,0,0,0.9)" }}
              onClick={runTester}
              disabled={!isCrimped || isTesting}
              className={`w-16 h-16 rounded-full border-2 border-[#1a1c1e] shadow-[0_6px_0_#1a1c1e] flex items-center justify-center text-white text-[11px] font-black tracking-widest transition-all
                ${!isCrimped || isTesting ? 'bg-[#3b82f6] opacity-50 cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8] shadow-[0_6px_0_#1e3a8a,0_10px_20px_rgba(37,99,235,0.4)]'}`}
            >
              TEST
            </MotionButton>
            <span className="text-[6px] text-white/40 font-black tracking-widest mt-1">START</span>
          </div>

          {/* Dummy MODE Button */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-[#4a4d54] border-2 border-[#1a1c1e] shadow-[0_4px_0_#1a1c1e] flex items-center justify-center text-white/30 text-xs font-black opacity-80 cursor-not-allowed">
              ≡
            </div>
            <span className="text-[6px] text-white/40 font-black tracking-widest">MODE</span>
          </div>

        </div>

        {/* Brand Label */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-50">
            <span className="text-white font-black italic tracking-widest text-[8px]">EDEN</span>
            <span className="text-[#eab308] font-bold text-[6px] uppercase tracking-widest">MicroScanner Pro</span>
        </div>

      </div>
    </aside>
  );
}