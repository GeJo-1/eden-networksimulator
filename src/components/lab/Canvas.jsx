// src/components/lab/Canvas.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { STANDARDS } from '../../constants/networkData';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const springTransition = { type: 'spring', stiffness: 180, damping: 24, mass: 0.8 };
const wirePhysics = { type: 'spring', stiffness: 220, damping: 26, mass: 0.8 };

export default function Canvas({ state, setters, actions }) {
  const { 
    isXRayMode, isCrimping, isCrimped, isTesting, testerStep, 
    pins, availableWires, selectedWire, activeStandard, 
    cableType, activeEnd, crossoverMap,
    hardwareType, punchedPins, isPullerActive, activeScenario 
  } = state;
  
  const { handlePinClick, handleWireSelect } = actions;
  const { setActiveEnd } = setters;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  useEffect(() => {
    if (cableType === 'crossover' && activeEnd === 'A') {
      const isAFull = pins.A.every(wire => wire !== null);
      if (isAFull) {
        const timer = setTimeout(() => setActiveEnd('B'), 400); 
        return () => clearTimeout(timer);
      }
    }
  }, [pins.A, cableType, activeEnd, setActiveEnd]);

  const GetXRayWireStyle = (wire, index, end) => {
    if (!isXRayMode || !wire) return {};
    let isActiveSignal = false;
    let isCorrect = false;

    if (isTesting) {
       if (cableType === 'straight') {
         isActiveSignal = testerStep === index;
         isCorrect = wire.id === STANDARDS[activeStandard][index];
       } else if (cableType === 'crossover') {
         isActiveSignal = end === 'A' ? testerStep === index : testerStep === crossoverMap[index];
         const targetStandard = end === 'A' ? 'T568A' : 'T568B'; 
         isCorrect = wire.id === STANDARDS[targetStandard][index] || wire.id === STANDARDS[end === 'A' ? 'T568B' : 'T568A'][index];
       }
    }

    return {
      backgroundImage: isActiveSignal && !isCorrect && !isCrimped
        ? 'repeating-linear-gradient(45deg, rgba(220,38,38,0.8), rgba(220,38,38,0.8) 10px, rgba(0,0,0,0.8) 10px, rgba(0,0,0,0.8) 20px)' 
        : wire.striped 
          ? 'repeating-linear-gradient(110deg, #f8fafc, #f8fafc 12px, transparent 12px, transparent 18px)' 
          : 'none',
      boxShadow: isActiveSignal ? `0 0 25px ${isCorrect ? '#0891b2' : '#dc2626'}` : 'none',
    };
  };

  const RenderJack = (endLabel) => {
    const isFocused = activeEnd === endLabel;
    const jackPins = pins[endLabel];
    const isKeystone = hardwareType === 'keystone';

    const isFull = jackPins.every(wire => wire !== null);
    const isAFull = pins.A.every(wire => wire !== null);
    const needsAttention = !isFocused && endLabel === 'B' && isAFull && !isFull;

    return (
      <MotionDiv 
        layout="position"
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
        transition={springTransition}
        key={`jack-${endLabel}`}
        onClick={() => setActiveEnd(endLabel)}
        className={`flex flex-col items-center 
          ${!isFocused && cableType === 'crossover' ? 'opacity-60 dark:opacity-40 grayscale scale-90 cursor-pointer hover:opacity-100 dark:hover:opacity-70' : 'z-20'}
          ${needsAttention ? 'animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]' : ''}`}
      >
        <MotionDiv layout className={`p-3 sm:p-5 rounded-t-lg rounded-b-3xl relative transition-colors duration-500
          ${isKeystone ? 'bg-slate-200 dark:bg-gray-800 border-2 border-slate-400 dark:border-gray-600 shadow-xl dark:shadow-2xl' 
          : 'bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_2px_15px_rgba(255,255,255,0.7)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_2px_15px_rgba(255,255,255,0.1)]'}
          ${isCrimping ? (isKeystone ? 'scale-95 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'scale-95 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.4)]') 
          : isXRayMode ? 'border-cyan-500 dark:border-cyan-500/30 bg-slate-100/80 dark:bg-black/80 shadow-[0_0_40px_rgba(34,211,238,0.2)]' 
          : isFocused ? 'shadow-[0_15px_40px_rgba(8,145,178,0.15)] dark:shadow-[0_15px_40px_rgba(34,211,238,0.15)]' 
          : needsAttention ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : ''}`}>
          
          {!isKeystone && (
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10 rounded-b-xl shadow-md z-0 transition-colors duration-500"></div>
          )}

          <AnimatePresence>
            {isFull && !isCrimped && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={springTransition}
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-100 dark:bg-green-900/80 border border-green-400 dark:border-green-500/50 text-green-700 dark:text-green-300 text-[8px] sm:text-[9px] font-black px-3 py-1 rounded shadow-[0_5px_15px_rgba(34,197,94,0.3)] z-50 tracking-[0.2em] whitespace-nowrap"
              >
                ✔ TERMINATED
              </motion.div>
            )}
          </AnimatePresence>

          <h3 className={`text-center mb-3 sm:mb-4 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] relative z-10 transition-colors duration-500 ${isXRayMode ? 'text-cyan-700 dark:text-cyan-400' : isKeystone ? 'text-slate-500 dark:text-gray-500' : 'text-slate-600 dark:text-gray-400 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-none'}`}>
            {isKeystone ? `110-BLOCK IDC - END ${endLabel}` : (cableType === 'crossover' ? `Terminus ${endLabel}` : 'RJ-45 INTERFACE')}
          </h3>
          
          <AnimatePresence mode="popLayout">
            {isKeystone ? (
              <MotionDiv 
                layout 
                key="hardware-keystone"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={springTransition}
                className={`grid grid-cols-2 gap-x-12 sm:gap-x-20 gap-y-2 p-4 sm:p-6 rounded-xl border relative transition-colors duration-500 shadow-xl
                  ${isXRayMode ? 'bg-slate-800 dark:bg-black border-cyan-300 dark:border-cyan-900/50' : 'bg-slate-100 dark:bg-[#1e293b] border-slate-400 dark:border-[#0f172a] shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]'}`}>
                
                {!isXRayMode && (
                  <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-6 sm:w-8 bg-[#f8fafc] dark:bg-slate-300 rounded-sm border border-slate-300 shadow-sm flex flex-col items-center justify-between py-2 z-0 overflow-hidden pointer-events-none">
                    <div className="text-[4px] sm:text-[5px] font-black text-slate-800 rotate-90 whitespace-nowrap mt-4 opacity-40 uppercase tracking-widest">TIA/EIA-568</div>
                    <div className="flex flex-col gap-1 w-full px-1.5 mb-2">
                      <div className="h-1.5 w-full bg-orange-500 rounded-sm"></div>
                      <div className="h-1.5 w-full bg-green-500 rounded-sm"></div>
                      <div className="h-1.5 w-full bg-blue-500 rounded-sm"></div>
                      <div className="h-1.5 w-full bg-[#78350f] rounded-sm"></div>
                    </div>
                  </div>
                )}

                {jackPins.map((wire, index) => {
                  const isPunched = punchedPins[endLabel][index];
                  const isReadyToAccept = selectedWire && isFocused && !isCrimped && !wire;
                  
                  let interactionClasses = '';
                  if (isFocused && !isCrimped) {
                    if (isPullerActive && isPunched) {
                      interactionClasses = 'cursor-crosshair shadow-[0_0_15px_rgba(220,38,38,0.4)] dark:shadow-[0_0_15px_rgba(239,68,68,0.4)] ring-2 ring-red-500';
                    } else if (isReadyToAccept) {
                      interactionClasses = 'cursor-pointer animate-pulse ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]';
                    } else if (!wire) {
                      interactionClasses = 'cursor-pointer hover:ring-2 hover:ring-cyan-300 dark:hover:ring-cyan-600';
                    }
                  }

                  return (
                    <MotionDiv 
                      layout
                      key={`pin-${endLabel}-${index}`} 
                      onClick={(e) => { e.stopPropagation(); if(isFocused) handlePinClick(index, endLabel); }}
                      whileHover={!isCrimped && isFocused && (!isPunched || isPullerActive) ? { scale: 1.05 } : {}}
                      whileTap={!isCrimped && isFocused && (!isPunched || isPullerActive) ? { scale: 0.95 } : {}}
                      transition={springTransition}
                      className={`w-16 h-8 sm:w-24 sm:h-10 relative flex items-center justify-center rounded-sm transition-colors duration-300 group z-10 ${interactionClasses}`}
                      style={wire ? GetXRayWireStyle(wire, index, endLabel) : {}}
                    >
                      <div className={`absolute inset-0 rounded-sm border-y-4 border-x-2 flex items-center justify-center overflow-hidden transition-colors duration-500
                         ${isXRayMode ? 'border-cyan-500/30 bg-black/50' : 'border-slate-300 dark:border-gray-700 bg-slate-800 dark:bg-black shadow-[inset_0_10px_15px_rgba(0,0,0,1)]'}`}>

                         <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 sm:w-3 flex justify-between z-10">
                             <div className="w-[3px] sm:w-[4px] h-full bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 shadow-[1px_0_3px_black]"></div>
                             <div className="w-[3px] sm:w-[4px] h-full bg-gradient-to-l from-slate-400 via-slate-100 to-slate-500 shadow-[-1px_0_3px_black]"></div>
                         </div>

                         <AnimatePresence>
                           {wire && (
                               <motion.div
                                   initial={{ y: -20, opacity: 0 }}
                                   animate={{ y: isPunched ? 0 : -8, opacity: 1 }}
                                   exit={{ opacity: 0, scale: 0.9 }}
                                   transition={wirePhysics}
                                   className={`absolute inset-x-0 h-4 sm:h-5 ${wire.color} shadow-[0_8px_15px_rgba(0,0,0,0.6)] z-20 flex items-center justify-center transition-colors duration-300 ${isPunched ? 'opacity-90' : 'opacity-100 border-y border-white/20'}`}
                                   style={wire.striped ? { backgroundImage: 'repeating-linear-gradient(110deg, rgba(255,255,255,0.9), rgba(255,255,255,0.9) 8px, transparent 8px, transparent 16px)' } : {}}
                               >
                                   {!isXRayMode && <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,transparent_40%,rgba(0,0,0,0.6)_100%)] mix-blend-overlay"></div>}
                               </motion.div>
                           )}
                         </AnimatePresence>
                         
                         {isPunched && !isXRayMode && <div className="absolute inset-0 bg-black/40 z-30 pointer-events-none transition-opacity duration-300"></div>}
                      </div>

                      <span className={`absolute ${index % 2 === 0 ? '-left-5 sm:-left-6' : '-right-5 sm:-right-6'} top-1/2 -translate-y-1/2 text-[8px] sm:text-[10px] font-black transition-colors duration-500 z-30
                        ${testerStep === (cableType === 'crossover' && endLabel === 'B' ? crossoverMap[index] : index) 
                          ? 'text-cyan-600 drop-shadow-[0_0_5px_#0891b2] dark:text-cyan-400 dark:drop-shadow-[0_0_8px_#22d3ee] scale-110' 
                          : 'text-slate-500 dark:text-gray-500'}`}>
                        {index + 1}
                      </span>
                    </MotionDiv>
                  )
                })}
              </MotionDiv>
            ) : (
              <MotionDiv 
                layout 
                key="hardware-rj45"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={springTransition}
                className={`flex gap-[2px] sm:gap-1 p-2 sm:p-3 rounded-xl border relative z-10 transition-colors duration-500 
                ${isXRayMode ? 'bg-black/80 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                : 'bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/5 shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]'}`}>
                
                {isCrimped && !isXRayMode && <MotionDiv initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 0.6 }} transition={{ duration: 0.6, ease: "easeOut" }} className="absolute bottom-0 left-0 right-0 h-4 sm:h-5 bg-gradient-to-t from-yellow-500/30 to-transparent z-0 pointer-events-none"></MotionDiv>}
                
                {jackPins.map((wire, index) => {
                  const isReadyToAccept = selectedWire && isFocused && !isCrimped && !wire;

                  return (
                    <MotionDiv 
                      layout
                      key={`pin-${endLabel}-${index}`} 
                      onClick={(e) => { e.stopPropagation(); if(isFocused) handlePinClick(index, endLabel); }}
                      whileHover={!isCrimped && isFocused ? { y: -2 } : {}}
                      whileTap={!isCrimped && isFocused ? { scale: 0.97 } : {}}
                      transition={springTransition}
                      className={`w-7 h-24 sm:w-10 sm:h-32 rounded-t-sm rounded-b-md border-x border-b transition-colors duration-300 flex flex-col items-center justify-end relative overflow-hidden cursor-pointer
                        ${isReadyToAccept ? 'shadow-[inset_0_0_15px_rgba(6,182,212,0.4)] bg-cyan-400/10 border-cyan-400/50' 
                        : wire ? 'border-transparent bg-transparent' 
                        : 'border-black/10 dark:border-white/5 shadow-[inset_0_5px_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_5px_10px_rgba(0,0,0,0.4)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
                      style={wire && isXRayMode ? GetXRayWireStyle(wire, index, endLabel) : {}}
                    >
                      <AnimatePresence>
                        {wire && (
                          <motion.div 
                             initial={{ y: 30, opacity: 0 }} 
                             animate={{ y: 0, opacity: 1 }} 
                             exit={{ y: 30, opacity: 0 }} 
                             transition={wirePhysics}
                             className={`absolute inset-x-0 bottom-0 h-[90%] ${wire.color} rounded-t-sm shadow-[0_-2px_5px_rgba(0,0,0,0.4)] z-10 flex flex-col items-center`}
                             style={wire.striped ? { backgroundImage: 'repeating-linear-gradient(110deg, #f8fafc, #f8fafc 8px, transparent 8px, transparent 16px)' } : {}}
                          >
                             {!isXRayMode && <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(255,255,255,0.3)_30%,transparent_50%,rgba(0,0,0,0.4)_85%,rgba(0,0,0,0.6)_100%)] mix-blend-overlay pointer-events-none transition-opacity duration-500"></div>}
                             {!isXRayMode && <div className="absolute top-0 inset-x-[25%] h-[3px] bg-gradient-to-r from-[#5c2b07] via-[#e6c27a] to-[#5c2b07] rounded-t-[1px] transition-opacity duration-500"></div>}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isXRayMode && (
                        <motion.div
                          initial={{ y: -12 }}
                          animate={{ y: isCrimped ? 5 : isCrimping ? [-8, 6, 5] : -12 }}
                          transition={{ duration: 0.4, ease: "easeOut", delay: isCrimping ? index * 0.04 : 0 }}
                          className="absolute top-0 w-[50%] h-6 sm:h-8 bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 shadow-[0_3px_5px_rgba(0,0,0,0.5)] z-30 flex flex-col items-center justify-end pb-[1px] rounded-b-[1px] border-x border-yellow-800/50"
                        >
                          <div className="w-full flex justify-between px-[1px]">
                            <div className="w-[1px] h-1.5 bg-yellow-200"></div>
                            <div className="w-[1px] h-1.5 bg-yellow-200"></div>
                          </div>
                        </motion.div>
                      )}

                      {isXRayMode && wire && <MotionDiv initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 0.3 }} className={`absolute inset-x-0 bottom-0 w-1 mx-auto ${wire.color} opacity-60 shadow-[0_0_10px_currentColor] z-20`}></MotionDiv>}

                      <span className={`absolute bottom-1 px-1 sm:px-1.5 py-0.5 rounded-sm text-[7px] sm:text-[9px] font-black transition-colors duration-500 z-40 shadow-sm
                        ${testerStep === (cableType === 'crossover' && endLabel === 'B' ? crossoverMap[index] : index) ? 'bg-cyan-600 text-white dark:bg-cyan-400 dark:text-black scale-110 shadow-md dark:shadow-[0_0_15px_#22d3ee]' : 'text-slate-700 bg-white/90 dark:text-white/50 dark:bg-black/40'}`}>
                        {index + 1}
                      </span>
                    </MotionDiv>
                  )
                })}
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>
      </MotionDiv>
    );
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="flex-grow relative bg-slate-200 dark:bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[60vh] lg:min-h-0 perspective-[1000px] transition-colors duration-700"
    >
      <div className="absolute inset-0 opacity-50 dark:opacity-20 pointer-events-none bg-[radial-gradient(#64748b_2px,transparent_2px)] dark:bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:32px_32px] transition-colors duration-700"></div>
      
      <AnimatePresence>
        {isCrimped && (
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="absolute inset-0 bg-white z-[100] pointer-events-none"/>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeScenario && (
          <MotionDiv
            key="scenario-hud"
            layout
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={springTransition}
            className="absolute top-4 sm:top-8 left-0 right-0 z-40 mx-auto w-[90%] max-w-lg pointer-events-none"
          >
            <div className="bg-white/95 dark:bg-cyan-950/40 backdrop-blur-md border border-slate-300 dark:border-cyan-500/50 rounded-lg p-4 sm:p-5 shadow-xl dark:shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col items-center text-center transition-colors duration-500">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.05)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
              <span className="relative z-10 inline-block px-2 py-0.5 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-[9px] sm:text-[10px] font-bold tracking-[0.3em] rounded mb-2 border border-cyan-300 dark:border-cyan-500/30">ACTIVE DIRECTIVE</span>
              <h2 className="relative z-10 text-slate-900 dark:text-white font-black text-base sm:text-lg tracking-wide mb-1.5 drop-shadow-sm dark:drop-shadow-md">{activeScenario.title}</h2>
              <p className="relative z-10 text-slate-600 dark:text-cyan-100/70 text-[10px] sm:text-xs leading-relaxed max-w-sm">{activeScenario.desc}</p>
            </div>
            <div className="flex flex-col items-center opacity-80 dark:opacity-60">
              <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-cyan-500 dark:from-cyan-500 to-transparent"></div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <MotionDiv 
        layout
        animate={isCrimping ? { x: [-4, 4, -4, 4, -2, 2, 0], y: [2, -2, 2, -2, 1, -1, 0] } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative z-10 flex flex-col items-center w-full gap-8 sm:gap-12 py-8 ${activeScenario ? 'mt-32 scale-95' : 'mt-0 scale-100'}`}
        style={{ rotateX: isCrimped ? 0 : mousePos.y * -5, rotateY: isCrimped ? 0 : mousePos.x * 5 }}
      >
        
        <MotionDiv layout className="flex justify-center w-full items-center gap-8 xl:gap-16 flex-wrap relative">
          <AnimatePresence mode="popLayout">
            {RenderJack('A')}
            {cableType === 'crossover' && hardwareType !== 'keystone' && RenderJack('B')}
          </AnimatePresence>
        </MotionDiv>

        <MotionDiv 
          layout
          className={`bg-slate-50 dark:bg-transparent p-4 sm:p-6 rounded-3xl border border-slate-300 dark:border-white/10 shadow-xl dark:shadow-none transition-colors duration-500 w-full max-w-xl ${isCrimped ? 'opacity-40 dark:opacity-20 pointer-events-none grayscale scale-95' : 'opacity-100 scale-100'}`}
        >
          <MotionDiv layout as="h4" className="text-[9px] sm:text-[10px] text-slate-600 dark:text-cyan-500/50 uppercase tracking-[0.4em] mb-4 sm:mb-5 text-center font-black">
            Available Conductors // End {activeEnd}
          </MotionDiv>
          
          <MotionDiv layout className="flex flex-wrap justify-center gap-3 sm:gap-4 relative z-10">
            <AnimatePresence mode="popLayout">
              {availableWires[activeEnd].map((wire) => {
                const isSelected = selectedWire?.id === wire.id;
                const isAnotherSelected = selectedWire && !isSelected;

                return (
                  <MotionButton 
                    key={`wire-${activeEnd}-${wire.id}`}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isSelected ? 1.15 : isAnotherSelected ? 0.9 : 1, 
                      y: isSelected ? -8 : 0, 
                      opacity: isAnotherSelected ? 0.5 : 1 
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={!isSelected && !isAnotherSelected ? { scale: 1.05, y: -3 } : {}}
                    whileTap={{ scale: 0.95 }}
                    transition={wirePhysics}
                    onClick={() => handleWireSelect(wire)} 
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 flex items-center justify-center relative group transition-colors duration-300
                      ${wire.color} 
                      ${isSelected 
                        ? 'border-white z-30 shadow-[0_15px_30px_rgba(6,182,212,0.4)]' 
                        : 'border-slate-400 dark:border-black/50 shadow-lg dark:shadow-2xl z-10'}`} 
                  >
                     <AnimatePresence>
                       {isSelected && (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1.2 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           transition={wirePhysics}
                           className="absolute inset-0 rounded-full border-[3px] sm:border-4 border-cyan-400/80 dark:border-cyan-300 z-[-1]"
                         />
                       )}
                     </AnimatePresence>

                     {wire.striped && <div className="absolute inset-0 rounded-full bg-[repeating-linear-gradient(110deg,#f8fafc,#f8fafc_6px,transparent_6px,transparent_12px)] pointer-events-none mix-blend-normal"></div>}
                     <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6)_0%,transparent_60%,rgba(0,0,0,0.6)_100%)] pointer-events-none mix-blend-overlay"></div>
                     <div className="absolute inset-[15%] sm:inset-[20%] rounded-full bg-slate-100 shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)] flex items-center justify-center pointer-events-none">
                        <div className="w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#fca5a5] via-[#b45309] to-[#78350f] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"></div>
                     </div>
                     <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 font-black text-[6px] sm:text-[8px] text-slate-800 bg-white/95 dark:text-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-1 sm:px-1.5 py-0.5 rounded shadow-md z-20 transition-colors duration-300 group-hover:scale-105">
                       {wire.label}
                     </span>
                  </MotionButton>
                )
              })}
            </AnimatePresence>
          </MotionDiv>
        </MotionDiv>
      </MotionDiv>
    </section>
  );
}