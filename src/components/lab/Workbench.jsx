import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer'; 

const MotionButton = motion.button;

export default function Workbench({ state, setters, actions }) {
  const { 
    activeScenario, examTime, isXRayMode, history, isCrimped, isCrimping, 
     isTrainingWheels, activeMode, hardwareType,
    cableType, activeStandard, isPullerActive 
  } = state;
  
  const { 
    setIsXRayMode, setIsTrainingWheels, setIsRefOpen, setHardwareType,
    setCableType, setActiveStandard, setIsPullerActive, setActiveEnd
  } = setters;
  
  const { generateScenario, handleUndo, handleCrimp, handlePunchDown, resetLab } = actions;

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [xpPenalty, setXpPenalty] = useState(0);

  const isExam = activeMode === 'exam' || activeScenario;
  const isDangerTime = isExam && examTime > 0 && examTime <= 15;

  const toggleHardware = (type) => {
    if (isExam) return; 
    setHardwareType(type);
    if (type === 'keystone' && cableType === 'crossover') {
      setCableType('straight');
      setActiveEnd('A');
    }
    resetLab(); 
  };

  const handleModeChange = (mode) => {
    if (isExam) return;
    if (mode === 'crossover') {
      setCableType('crossover');
    } else {
      setCableType('straight');
      setActiveStandard(mode);
    }
    resetLab();
  };

  const handleRequestScenario = () => {
    setIsDecrypting(true);
    setXpPenalty(0); 
    setTimeout(() => {
      setIsDecrypting(false);
      generateScenario();
    }, 1200);
  };

  const handleCheatSheet = () => {
    if (isExam && xpPenalty < (activeScenario?.reward || 0)) {
      setXpPenalty(prev => prev + 25);
    }
    setIsRefOpen(true);
  };

  const handleXRayToggle = () => {
    if (isExam && !isXRayMode && xpPenalty < (activeScenario?.reward || 0)) {
      setXpPenalty(prev => prev + 15);
    }
    setIsXRayMode(!isXRayMode);
  };

  const currentValue = cableType === 'crossover' ? 'crossover' : activeStandard;
  const currentReward = activeScenario ? Math.max(0, activeScenario.reward - xpPenalty) : 0;

  return (
    <aside className="w-full lg:w-1/4 bg-slate-200 dark:bg-[#121418] p-3 xl:p-4 border-r border-slate-300 dark:border-black flex flex-col gap-3 z-10 shadow-[20px_0_30px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_30px_rgba(0,0,0,0.5)] overflow-y-auto lg:overflow-hidden transition-colors duration-500 lg:h-full lg:max-h-screen">
      
      <div className="shrink-0">
        <VideoPlayer state={state} />
      </div>

      <div className="bg-white dark:bg-[#1a1d24] rounded-lg p-2.5 xl:p-3 border border-slate-300 dark:border-transparent border-b-4 border-b-slate-400 dark:border-b-[#15181c] shadow-sm dark:shadow-lg shrink-0 flex flex-col gap-2 transition-colors">
        <h2 className="text-[10px] xl:text-xs uppercase tracking-[0.15em] font-black text-slate-700 dark:text-gray-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-500 shadow-[0_0_5px_#0891b2] dark:shadow-[0_0_5px_#06b6d4]"></div>
          Hardware Config
        </h2>
        
        <div className="flex gap-2 w-full">
          <div className="flex w-[45%] bg-slate-100 dark:bg-black p-1 rounded shadow-inner relative border border-slate-200 dark:border-none transition-colors">
            {isExam && <div className="absolute inset-0 z-10 bg-slate-200/50 dark:bg-black/40 cursor-not-allowed rounded" title="Hardware locked"></div>}
            <button 
              onClick={() => toggleHardware('rj45')}
              className={`flex-1 py-1.5 text-[10px] xl:text-xs font-black tracking-wider uppercase rounded transition-all ${hardwareType === 'rj45' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'}`}
            >
              RJ-45
            </button>
            <button 
              onClick={() => toggleHardware('keystone')}
              className={`flex-1 py-1.5 text-[10px] xl:text-xs font-black tracking-wider uppercase rounded transition-all ${hardwareType === 'keystone' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'}`}
            >
              110-BLK
            </button>
          </div>

          <div className="flex w-[55%] bg-slate-100 dark:bg-black p-1 rounded shadow-inner relative border border-slate-200 dark:border-none transition-colors">
            {isExam && <div className="absolute inset-0 z-10 bg-slate-200/50 dark:bg-black/40 cursor-not-allowed rounded"></div>}
            <button onClick={() => handleModeChange('T568B')} className={`flex-1 py-1.5 text-[10px] xl:text-xs font-black tracking-wider uppercase rounded transition-all ${currentValue === 'T568B' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'}`}>T568B</button>
            <button onClick={() => handleModeChange('T568A')} className={`flex-1 py-1.5 text-[10px] xl:text-xs font-black tracking-wider uppercase rounded transition-all ${currentValue === 'T568A' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'}`}>T568A</button>
            
            {/* Disables Crossover if Keystone is selected */}
            <button 
              onClick={() => handleModeChange('crossover')} 
              disabled={hardwareType === 'keystone'}
              title={hardwareType === 'keystone' ? 'Crossovers are for patch cables, not infrastructure keystones' : ''}
              className={`flex-1 py-1.5 text-[10px] xl:text-xs font-black tracking-wider uppercase rounded transition-all 
              ${hardwareType === 'keystone' ? 'opacity-30 cursor-not-allowed grayscale text-slate-500 dark:text-slate-600' : 
                currentValue === 'crossover' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'}`}
            >
              CROSS
            </button>
          </div>
        </div>
      </div>

      {/* --- DISPATCH TERMINAL --- */}
      <div className={`rounded-lg p-3 border-2 relative overflow-hidden transition-colors duration-300 shadow-md shrink-0 flex flex-col 
        ${isDangerTime ? 'border-red-400 bg-red-50 dark:border-red-900 dark:bg-[#2a0808]' 
        : 'border-amber-300 bg-amber-50 dark:border-[#1a1a1a] dark:bg-[#0a0a05]'}`}>
        
        <div className="absolute inset-0 pointer-events-none hidden dark:block bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] z-10"></div>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-10"></div>

        <h2 className={`text-[10px] xl:text-xs uppercase tracking-[0.2em] font-black z-20 relative flex items-center gap-2 ${isDangerTime ? 'text-red-700 dark:text-red-500' : 'text-amber-800 dark:text-amber-500'}`}>
          <span className={`w-2 h-2 rounded-full ${isDangerTime ? 'bg-red-600 dark:bg-red-500 animate-ping' : 'bg-amber-600 dark:bg-amber-500 animate-pulse'}`}></span> 
          {isDangerTime ? 'CRITICAL TIME' : 'DISPATCH TERMINAL'}
        </h2>
        
        <div className="mt-3 relative z-20 min-h-[75px] flex flex-col justify-center">
          {isDecrypting ? (
            <p className="text-amber-700 dark:text-amber-500 text-[10px] xl:text-xs font-mono animate-pulse tracking-widest font-bold text-center">DECRYPTING SECURE DATA...</p>
          ) : activeScenario ? (
            <div className="flex flex-col h-full font-mono justify-between">
              <div>
                <h3 className="text-xs xl:text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-wide leading-none">{activeScenario.title}</h3>
                <p className="text-[10px] xl:text-xs font-bold text-amber-800/80 dark:text-amber-600/80 leading-snug mt-1.5 line-clamp-2">{activeScenario.desc}</p>
              </div>
              
              <div className="flex justify-between items-end mt-3 pt-2 border-t border-amber-300 dark:border-amber-900/50">
                <span className={`text-[10px] xl:text-xs font-bold ${xpPenalty > 0 ? 'text-red-600 dark:text-red-500' : 'text-amber-800 dark:text-amber-500'}`}>
                  REWARD: <span className={xpPenalty > 0 ? 'line-through opacity-50 mr-1' : 'hidden'}>{activeScenario.reward}</span> 
                  <span className={xpPenalty > 0 ? 'text-amber-900 dark:text-amber-400' : 'text-amber-900 dark:text-amber-400'}>{currentReward} XP</span>
                </span>
                <span className={`font-black text-xs xl:text-sm ${isDangerTime ? 'text-red-700 dark:text-red-500 animate-pulse' : 'text-amber-800 dark:text-amber-500'}`}>T-MINUS: {examTime}s</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <button onClick={handleRequestScenario} className="px-4 py-2 border-2 border-amber-600 text-amber-800 dark:text-amber-500 hover:bg-amber-600 hover:text-white dark:hover:text-black font-mono text-[10px] xl:text-xs font-black tracking-widest uppercase transition-colors shadow-sm">
                [ GET DIRECTIVE ]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- HEAVY MACHINERY TOOLBOX --- */}
      <div className="bg-white dark:bg-[#1a1d24] rounded-lg p-2.5 xl:p-3 border border-slate-300 dark:border-transparent border-b-4 border-b-slate-400 dark:border-b-[#15181c] shadow-sm dark:shadow-lg flex-grow flex flex-col min-h-0 transition-colors">
        <h2 className="text-[10px] xl:text-xs uppercase tracking-[0.15em] font-black text-slate-700 dark:text-gray-400 mb-2 shrink-0">Utility Belt</h2>
        
        <div className="grid grid-cols-4 gap-1.5 mb-3 shrink-0">
          <button onClick={handleCheatSheet} className={`h-8 sm:h-10 rounded border text-[9px] xl:text-[10px] font-black tracking-wider transition-all shadow-sm dark:shadow-inner hover:bg-slate-50 dark:hover:bg-[#333] ${isExam ? 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-900/20 dark:border-orange-500/30 dark:text-orange-500' : 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-[#1e2329] dark:border-[#444] dark:text-slate-300'}`}>
            {isExam ? '⚠️ CH' : 'SOP'}
          </button>
          <button onClick={handleXRayToggle} className={`h-8 sm:h-10 rounded border text-[9px] xl:text-[10px] font-black tracking-wider transition-all shadow-sm dark:shadow-inner hover:bg-slate-50 dark:hover:bg-[#333] ${isXRayMode ? 'bg-cyan-50 border-cyan-400 text-cyan-800 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-[#1e2329] dark:border-[#444] dark:text-slate-300'}`}>
            X-RAY
          </button>
          <button onClick={() => !isExam && setIsTrainingWheels(!isTrainingWheels)} disabled={isExam} className={`h-8 sm:h-10 rounded border text-[9px] xl:text-[10px] font-black tracking-wider transition-all shadow-sm dark:shadow-inner ${isExam ? 'opacity-50 text-slate-500 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-[#1e2329]' : isTrainingWheels ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' : 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-[#1e2329] dark:border-[#444] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333]'}`}>
            AST {isExam ? 'X' : (isTrainingWheels ? 'ON' : 'OFF')}
          </button>
          <button onClick={handleUndo} disabled={history.length === 0 || isCrimped} className="h-8 sm:h-10 rounded border text-[9px] xl:text-[10px] font-black tracking-wider transition-all shadow-sm dark:shadow-inner text-slate-700 bg-slate-50 border-slate-300 hover:bg-slate-100 dark:bg-[#1e2329] dark:border-[#444] dark:text-slate-300 dark:hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed">
            UNDO
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-auto flex-grow justify-end">
          {hardwareType === 'rj45' ? (
            <MotionButton 
              whileTap={isCrimped || isCrimping ? {} : { scale: 0.98, y: 2 }}
              onClick={handleCrimp} 
              disabled={isCrimped || isCrimping} 
              className={`w-full h-12 sm:h-14 rounded-lg font-black text-xs xl:text-sm tracking-widest uppercase transition-all relative overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-md
                ${isCrimped ? 'bg-slate-200 border-2 border-slate-300 text-slate-500 dark:bg-[#1e2329] dark:border-[#15181c] dark:text-slate-600 cursor-not-allowed' 
                : 'bg-yellow-400 border-b-4 border-yellow-600 text-black shadow-[0_5px_15px_rgba(234,179,8,0.4)] hover:bg-yellow-300'}`}
            >
              {!isCrimped && <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)] pointer-events-none"></div>}
              {!isCrimped && <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-lg pointer-events-none"></div>}
              <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">{isCrimping ? 'CRUSHING...' : 'ACTUATE CRIMPER'}</span>
            </MotionButton>
          ) : (
            <div className="flex gap-2 h-12 sm:h-14 shrink-0">
              <MotionButton 
                whileTap={isCrimped || isCrimping ? {} : { scale: 0.98, y: 2 }}
                onClick={handlePunchDown} 
                disabled={isCrimped || isCrimping} 
                className={`flex-1 rounded-lg font-black text-[10px] xl:text-xs tracking-widest uppercase transition-all relative overflow-hidden flex flex-col items-center justify-center shadow-md
                  ${isCrimped ? 'bg-slate-200 border-2 border-slate-300 text-slate-500 dark:bg-[#1e2329] dark:border-[#15181c] dark:text-slate-600 cursor-not-allowed' 
                  : 'bg-orange-500 border-b-4 border-orange-700 text-black shadow-[0_5px_15px_rgba(249,115,22,0.4)] hover:bg-orange-400'}`}
              >
                {!isCrimped && <div className="absolute top-0 inset-x-0 h-1 bg-white/30 rounded-t-lg pointer-events-none"></div>}
                <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">{isCrimping ? 'IMPACTING...' : 'PUNCH-DOWN'}</span>
              </MotionButton>
              
              <MotionButton 
                whileTap={isCrimped || isCrimping ? {} : { scale: 0.98, y: 2 }}
                onClick={() => setIsPullerActive(!isPullerActive)} 
                disabled={isCrimped || isCrimping} 
                className={`w-14 sm:w-16 rounded-lg font-black text-xl tracking-widest uppercase transition-all relative overflow-hidden flex flex-col items-center justify-center shadow-md
                  ${isCrimped ? 'bg-slate-200 border-2 border-slate-300 text-slate-500 dark:bg-[#1e2329] dark:border-[#15181c] dark:text-slate-600 cursor-not-allowed' 
                  : isPullerActive ? 'bg-red-600 border-b-4 border-red-800 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                  : 'bg-slate-300 border-b-4 border-slate-500 text-black hover:bg-white'}`}
                title="Wire Hook Tool"
              >
                {!isCrimped && <div className="absolute top-0 inset-x-0 h-1 bg-white/50 rounded-t-lg pointer-events-none"></div>}
                <span className="relative z-10 drop-shadow-sm">🪝</span>
              </MotionButton>
            </div>
          )}

          <MotionButton 
            whileTap={{ scale: 0.98, y: 1 }}
            onClick={resetLab} 
            className="w-full h-10 mt-1 rounded-md bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 dark:bg-[#3f1515] dark:hover:bg-[#5c1a1a] dark:border-[#7f1d1d] dark:text-red-500 text-[10px] xl:text-xs font-black tracking-widest uppercase transition-all shadow-sm dark:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 shrink-0"
          >
            <span className="text-red-600 text-lg leading-none">✂</span> 
            SNIP & RE-TERMINATE
          </MotionButton>
        </div>
        
      </div>
    </aside>
  );
}