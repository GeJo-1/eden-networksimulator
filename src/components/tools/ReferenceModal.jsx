// src/components/tools/ReferenceModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div;

const STANDARDS = {
  'T568B': [
    { label: 'O-W', bg: 'bg-orange-500', striped: true, full: 'Orange-White' },
    { label: 'O',   bg: 'bg-orange-500', striped: false, full: 'Solid Orange' },
    { label: 'G-W', bg: 'bg-green-500', striped: true, full: 'Green-White' },
    { label: 'B',   bg: 'bg-blue-500', striped: false, full: 'Solid Blue' },
    { label: 'B-W', bg: 'bg-blue-500', striped: true, full: 'Blue-White' },
    { label: 'G',   bg: 'bg-green-500', striped: false, full: 'Solid Green' },
    { label: 'Br-W',bg: 'bg-[#78350f]', striped: true, full: 'Brown-White' },
    { label: 'Br',  bg: 'bg-[#78350f]', striped: false, full: 'Solid Brown' }
  ],
  'T568A': [
    { label: 'G-W', bg: 'bg-green-500', striped: true, full: 'Green-White' },
    { label: 'G',   bg: 'bg-green-500', striped: false, full: 'Solid Green' },
    { label: 'O-W', bg: 'bg-orange-500', striped: true, full: 'Orange-White' },
    { label: 'B',   bg: 'bg-blue-500', striped: false, full: 'Solid Blue' },
    { label: 'B-W', bg: 'bg-blue-500', striped: true, full: 'Blue-White' },
    { label: 'O',   bg: 'bg-orange-500', striped: false, full: 'Solid Orange' },
    { label: 'Br-W',bg: 'bg-[#78350f]', striped: true, full: 'Brown-White' },
    { label: 'Br',  bg: 'bg-[#78350f]', striped: false, full: 'Solid Brown' }
  ]
};

const PhotorealisticWire = ({ wire, index }) => (
  <div className="flex flex-col items-center gap-2 group">
    <div className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-gray-400 group-hover:text-cyan-500 transition-colors">
      {index + 1}
    </div>
    <div 
      className={`w-6 h-24 sm:w-8 sm:h-32 rounded-sm relative overflow-hidden shadow-md border-x border-black/20 dark:border-white/10 transition-transform group-hover:-translate-y-2
      ${wire.bg}`}
      style={wire.striped ? { backgroundImage: 'repeating-linear-gradient(110deg, #f8fafc, #f8fafc 8px, transparent 8px, transparent 16px)' } : {}}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(255,255,255,0.3)_30%,transparent_50%,rgba(0,0,0,0.4)_85%,rgba(0,0,0,0.6)_100%)] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 inset-x-[20%] h-[3px] bg-gradient-to-r from-[#5c2b07] via-[#e6c27a] to-[#5c2b07] rounded-t-[1px]"></div>
    </div>
    <div className="text-[8px] sm:text-[9px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest text-center max-w-[40px] leading-tight mt-1 opacity-80 group-hover:opacity-100">
      {wire.full}
    </div>
  </div>
);

const KeystoneSlot = ({ wire, index, side }) => (
  <div className={`flex items-center gap-2 sm:gap-4 ${side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
    <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-gray-500 w-3 text-center">{index + 1}</span>
    <div className="w-12 h-6 sm:w-16 sm:h-8 bg-slate-300 dark:bg-gray-800 border-2 border-slate-400 dark:border-gray-600 rounded-sm shadow-inner relative flex items-center justify-center overflow-visible z-10">
       <div className="w-1 h-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 dark:from-slate-500 dark:via-slate-300 dark:to-slate-600 border-x border-slate-500 dark:border-black shadow-sm z-0"></div>
       <div 
        className={`absolute inset-x-[-8px] h-3.5 sm:h-4 shadow-[0_3px_5px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center border-y border-white/20 ${wire.bg}`} 
        style={wire.striped ? { backgroundImage: 'repeating-linear-gradient(110deg, rgba(255,255,255,0.9), rgba(255,255,255,0.9) 6px, transparent 6px, transparent 12px)' } : {}}
       >
         <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,transparent_40%,rgba(0,0,0,0.6)_100%)] mix-blend-overlay pointer-events-none"></div>
       </div>
    </div>
    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-gray-300 w-20 sm:w-28 ${side === 'left' ? 'text-right' : 'text-left'}`}>
      {wire.full}
    </span>
  </div>
);

export default function ReferenceModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('T568B');
  const [keystoneMode, setKeystoneMode] = useState('T568B'); 

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <MotionDiv 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <MotionDiv 
          initial={{ scale: 0.95, y: 20, rotateX: 10 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-[#1e2329] dark:bg-[#121418] rounded-xl border-[6px] border-[#333a45] dark:border-[#1a1c20] shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.1)] relative flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Hardware Screws */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-black/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-black/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-black/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>

          {/* Rugged Header */}
          <div className="bg-[#2a3038] dark:bg-[#1a1d24] px-4 py-3 sm:px-6 sm:py-4 border-b border-black/50 flex justify-between items-center shadow-md relative shrink-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#b45309_10px,#b45309_20px)] opacity-80"></div>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-black font-black text-[10px] px-2 py-0.5 rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.3)] hidden sm:block">FIELD OPS</div>
              <h2 className="text-white font-black text-sm sm:text-base tracking-[0.2em] uppercase">SOP Reference Manual</h2>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 hover:border-red-500 flex items-center justify-center transition-all shadow-inner font-black text-lg"
            >
              ✕
            </button>
          </div>

          {/* Tablet Screen Area */}
          <div className="p-3 sm:p-6 bg-slate-200 dark:bg-black/90 relative overflow-y-auto flex-grow">
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-0"></div>

            {/* Tactical Segmented Controls */}
            <div className="flex flex-wrap sm:flex-nowrap bg-slate-300 dark:bg-[#1e2329] p-1 rounded-lg shadow-inner mb-4 sm:mb-6 relative z-10 max-w-2xl mx-auto gap-1">
              {['T568B', 'T568A', 'CROSSOVER', '110-BLOCK'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[45%] sm:min-w-0 py-2 sm:py-2.5 text-[9px] sm:text-[10px] md:text-xs font-black tracking-widest uppercase rounded-md transition-all relative ${activeTab === tab ? 'text-white' : 'text-slate-600 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300'}`}
                >
                  {activeTab === tab && (
                    <MotionDiv layoutId="activeTabRef" className="absolute inset-0 bg-blue-600 rounded-md shadow-md border-b-2 border-blue-800 -z-10"></MotionDiv>
                  )}
                  {tab}
                </button>
              ))}
            </div>

            {/* Dynamic Content Area */}
            <div className="bg-slate-50 dark:bg-[#15181c] p-4 sm:p-6 rounded-xl border border-slate-300 dark:border-[#333a45] shadow-sm dark:shadow-[inset_0_5px_20px_rgba(0,0,0,0.5)] relative z-10 min-h-[250px] flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <MotionDiv 
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex justify-center"
                >
                  {/* --- T568A & T568B VIEWS --- */}
                  {activeTab === 'T568B' || activeTab === 'T568A' ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex justify-center gap-1 sm:gap-3 md:gap-4 mb-6">
                        {STANDARDS[activeTab].map((wire, i) => (
                          <PhotorealisticWire key={`${activeTab}-${i}`} wire={wire} index={i} />
                        ))}
                      </div>
                      
                      {/* Hardware Orientation Guide */}
                      <div className="px-4 py-2 bg-slate-200 dark:bg-[#1e2329] rounded border border-slate-300 dark:border-white/10 shadow-inner flex items-center gap-3 max-w-lg w-full mb-4">
                         <div className="w-10 h-6 bg-slate-100 dark:bg-white/10 rounded-sm border border-slate-400 dark:border-white/20 relative flex justify-center shrink-0">
                            <div className="absolute -bottom-1.5 w-3 h-1.5 bg-slate-400 dark:bg-white/30 rounded-b-sm"></div>
                         </div>
                         <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 dark:text-gray-400 leading-relaxed">
                           Hold RJ45 connector with <strong>GOLD PINS UP</strong> and the plastic <strong>LOCKING CLIP FACING DOWN</strong>. Pin 1 is on the far left.
                         </span>
                      </div>

                      {/* Descriptive Usage Note for A/B */}
                      <div className="p-4 bg-slate-200 dark:bg-[#1e2329] border border-slate-300 dark:border-white/5 rounded-lg shadow-inner w-full max-w-lg text-left">
                        <h4 className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-white mb-2 tracking-widest uppercase border-b border-slate-300 dark:border-white/10 pb-1">
                          {activeTab === 'T568B' ? 'Commercial Standard (Straight-Through)' : 'Residential / Federal Standard (Straight-Through)'}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-bold">
                          {activeTab === 'T568B' 
                            ? 'T568B is the dominant wiring standard used globally for commercial data networks. Wiring both ends of a cable with this standard creates a Straight-Through cable, used to connect different types of devices together (e.g., a PC to a Switch, or a Switch to a Router).'
                            : 'T568A is widely used in residential networking and specific government installations to provide backward compatibility with legacy USOC telephone wiring. Wiring both ends of a cable with this standard creates a Straight-Through cable.'}
                        </p>
                      </div>

                    </div>
                  ) : activeTab === 'CROSSOVER' ? (
                    /* --- CROSSOVER VIEW --- */
                    <div className="flex flex-col items-center w-full max-w-xl">
                       <div className="flex justify-between w-full items-center">
                          <div className="text-center w-1/3">
                             <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-white mb-2 tracking-widest">END A</div>
                             <div className="bg-green-100 border border-green-300 dark:border-none dark:bg-green-900/30 px-3 py-2 rounded text-[10px] sm:text-xs font-black text-green-700 dark:text-green-400 shadow-inner">T568A Standard</div>
                          </div>
                          
                          <div className="flex-grow flex flex-col items-center px-2 sm:px-4 opacity-70">
                             <svg width="100%" height="60" className="drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                                <path d="M 0 15 L 100 45" fill="none" stroke="currentColor" className="text-cyan-500" strokeWidth="2" strokeDasharray="4 4">
                                  <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite"/>
                                </path>
                                <path d="M 0 45 L 100 15" fill="none" stroke="currentColor" className="text-orange-500" strokeWidth="2" strokeDasharray="4 4">
                                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="1s" repeatCount="indefinite"/>
                                </path>
                             </svg>
                             <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase mt-2 text-slate-600 dark:text-gray-400">Rx/Tx Inversion</span>
                          </div>

                          <div className="text-center w-1/3">
                             <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-white mb-2 tracking-widest">END B</div>
                             <div className="bg-orange-100 border border-orange-300 dark:border-none dark:bg-orange-900/30 px-3 py-2 rounded text-[10px] sm:text-xs font-black text-orange-700 dark:text-orange-400 shadow-inner">T568B Standard</div>
                          </div>
                       </div>
                       
                       <div className="mt-8 p-4 bg-slate-200 dark:bg-[#1e2329] border border-slate-300 dark:border-white/5 rounded-lg shadow-inner text-left w-full">
                         <h4 className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-white mb-2 tracking-widest uppercase border-b border-slate-300 dark:border-white/10 pb-1">
                           Cross-Device Link
                         </h4>
                         <p className="text-[10px] sm:text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-bold">
                           Used to connect similar devices directly to each other without a switch in the middle (e.g., PC to PC, Switch to Switch, Router to Router). Pins 1 & 2 (Transmit) are crossed to Pins 3 & 6 (Receive) on the opposite end.
                         </p>
                       </div>
                    </div>
                  ) : (
                    /* --- KEYSTONE 110-BLOCK SCHEMATIC --- */
                    <div className="flex flex-col items-center w-full">
                      
                      <div className="flex gap-2 mb-6 p-1 bg-slate-200 dark:bg-[#0a0c0f] rounded-md shadow-inner border border-slate-300 dark:border-white/5">
                        <button 
                          onClick={() => setKeystoneMode('T568B')}
                          className={`px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded transition-colors ${keystoneMode === 'T568B' ? 'bg-white dark:bg-[#2a3038] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300'}`}
                        >
                          View T568B Blueprint
                        </button>
                        <button 
                          onClick={() => setKeystoneMode('T568A')}
                          className={`px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded transition-colors ${keystoneMode === 'T568A' ? 'bg-white dark:bg-[#2a3038] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300'}`}
                        >
                          View T568A Blueprint
                        </button>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-6 bg-slate-100 dark:bg-[#0a0c0f] p-4 sm:p-6 rounded-xl border border-slate-300 dark:border-white/5 shadow-inner">
                        <div className="flex flex-col gap-3">
                          {[0, 2, 4, 6].map(i => (
                             <KeystoneSlot key={`l-${i}`} wire={STANDARDS[keystoneMode][i]} index={i} side="left" />
                          ))}
                        </div>
                        <div className="w-8 sm:w-12 h-full py-4 bg-slate-300 dark:bg-[#1a1d24] border-x-2 border-slate-400 dark:border-black flex items-center justify-center rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(0,0,0,0.8)] z-0">
                           <span className="rotate-90 text-[8px] sm:text-[10px] font-black tracking-[0.3em] text-slate-500 dark:text-gray-600 uppercase whitespace-nowrap opacity-60">
                             Central Spine
                           </span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {[1, 3, 5, 7].map(i => (
                             <KeystoneSlot key={`r-${i}`} wire={STANDARDS[keystoneMode][i]} index={i} side="right" />
                          ))}
                        </div>
                      </div>

                      <div className="max-w-xl w-full mt-6 bg-yellow-100 dark:bg-[#2a2410] border border-yellow-400 dark:border-yellow-600/50 p-3 sm:p-4 rounded-lg flex items-start gap-3 shadow-sm">
                        <div className="text-xl sm:text-2xl mt-0.5">⚠️</div>
                        <div>
                          <h4 className="text-[10px] sm:text-xs font-black text-yellow-800 dark:text-yellow-500 uppercase tracking-widest mb-1">Termination Warning</h4>
                          <p className="text-[9px] sm:text-[10px] font-bold text-yellow-900 dark:text-yellow-600/80 leading-relaxed">
                            When punching down into the V-blades, maintain pair twists up to <strong className="underline">0.5 inches</strong> from the termination point to prevent alien crosstalk and signal degradation.
                          </p>
                        </div>
                      </div>

                    </div>
                  )}
                </MotionDiv>
              </AnimatePresence>
            </div>
            
            <div className="absolute bottom-3 right-4 opacity-20 pointer-events-none hidden sm:block">
               <div className="font-mono text-[6px] tracking-[0.4em] mb-1 text-slate-900 dark:text-white">PROPERTY OF EDEN TECH</div>
               <div className="flex gap-0.5 h-4">
                  {[1,3,1,2,4,1,2,1,3,2,1].map((w, i) => (
                    <div key={i} style={{ width: `${w * 2}px` }} className="bg-slate-900 dark:bg-white h-full"></div>
                  ))}
               </div>
            </div>

          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
}