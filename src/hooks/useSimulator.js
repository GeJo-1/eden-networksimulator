// src/hooks/useSimulator.js
import { useState, useEffect } from 'react';
import { INITIAL_WIRES, STANDARDS } from '../constants/networkData';

const getWire = (id) => INITIAL_WIRES.find(w => w.id === id);

const SCENARIOS = [
  {
    id: 'split-pair-keystone',
    title: "CRITICAL: Split Pair Detected",
    desc: "A junior tech completely butchered this T568B wall jack. The Green and Brown pairs are split. Grab the Puller Tool, rip out the bad conductors, and re-punch them correctly.",
    reward: 150,
    timed: true,
    forcedHardware: 'keystone',
    forcedCableType: 'straight',
    forcedStandard: 'T568B',
    initialSetup: {
      pinsA: [
        getWire('ow'), getWire('o'), getWire('gw'), 
        getWire('br'), // WRONG (Should be b)
        getWire('bw'), getWire('g'), getWire('brw'), 
        getWire('b')   // WRONG (Should be br)
      ],
      punchedPinsA: [true, true, true, true, true, true, true, true],
    }
  },
  {
    id: 'crossover-catastrophe',
    title: "Crossover Catastrophe",
    desc: "We need a crossover cable to link these two legacy switches, but End B is wired straight-through. Rip the RJ45 off, re-order to T568A, and re-crimp.",
    reward: 200,
    timed: true,
    forcedHardware: 'rj45',
    forcedCableType: 'crossover',
    forcedStandard: 'T568B', 
    initialSetup: {
      pinsA: [
        getWire('ow'), getWire('o'), getWire('gw'), getWire('b'),
        getWire('bw'), getWire('g'), getWire('brw'), getWire('br')
      ],
      pinsB: [
        getWire('ow'), getWire('o'), getWire('gw'), getWire('b'),
        getWire('bw'), getWire('g'), getWire('brw'), getWire('br')
      ],
      punchedPinsA: [false, false, false, false, false, false, false, false],
      punchedPinsB: [false, false, false, false, false, false, false, false],
      isCrimped: true 
    }
  }
];

export const useSimulator = () => {
  const [hardwareType, setHardwareType] = useState('rj45'); 
  const [cableType, setCableType] = useState('straight'); 
  const [activeEnd, setActiveEnd] = useState('A'); 
  
  const [availableWires, setAvailableWires] = useState({ A: INITIAL_WIRES, B: INITIAL_WIRES });
  const [selectedWire, setSelectedWire] = useState(null);
  const [pins, setPins] = useState({ A: Array(8).fill(null), B: Array(8).fill(null) }); 
  const [punchedPins, setPunchedPins] = useState({ A: Array(8).fill(false), B: Array(8).fill(false) });
  
  const [history, setHistory] = useState([]);
  
  const [activeStandard, setActiveStandard] = useState('T568B');
  const [activeMode, setActiveMode] = useState('learn'); 
  const [examTime, setExamTime] = useState(60); 
  const [activeScenario, setActiveScenario] = useState(null);
  const [userXP, setUserXP] = useState(0);
  
  const [isCrimping, setIsCrimping] = useState(false);
  const [isCrimped, setIsCrimped] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testerStep, setTesterStep] = useState(-1);
  const [isXRayMode, setIsXRayMode] = useState(false);
  
  const [isPullerActive, setIsPullerActive] = useState(false);
  const [diagnosticMsg, setDiagnosticMsg] = useState({ status: 'idle', text: 'System ready. Select a wire.' });

  const [isTrainingWheels, setIsTrainingWheels] = useState(true);
  const [isRefOpen, setIsRefOpen] = useState(false);

  const crossoverMap = { 0: 2, 1: 5, 2: 0, 3: 3, 4: 4, 5: 1, 6: 6, 7: 7 };

  const playSound = (type) => {
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.5; 
      audio.play().catch((e) => { console.warn("Audio blocked:", e); });
    } catch (error) {
      console.log(`Audio missing for: ${type}`, error);
    }
  };

  const getRank = (xp) => {
    if (xp >= 1000) return { title: 'Network Engineer', color: 'text-purple-400', badge: 'bg-purple-900 border-purple-500' };
    if (xp >= 400) return { title: 'Technician', color: 'text-blue-400', badge: 'bg-blue-900 border-blue-500' };
    return { title: 'Beginner', color: 'text-gray-400', badge: 'bg-gray-800 border-gray-600' };
  };

  const currentRank = getRank(userXP);

  useEffect(() => {
    let timer;
    if ((activeMode === 'exam' || activeScenario?.timed) && examTime > 0 && !isCrimped) {
      timer = setInterval(() => setExamTime(prev => prev - 1), 1000);
    } else if (examTime === 0 && !isCrimped && activeScenario) {
      playSound('error_buzz');
      setDiagnosticMsg({ status: 'error', text: 'TIME EXPIRED. MISSION FAILED.' });
      setIsCrimped(true);
    }
    return () => clearInterval(timer);
  }, [activeMode, examTime, isCrimped, activeScenario]);

  const saveHistory = (currentAvailable, currentPins, currentPunched) => {
    setHistory([...history, { 
      available: { A: [...currentAvailable.A], B: [...currentAvailable.B] }, 
      pins: { A: [...currentPins.A], B: [...currentPins.B] },
      punchedPins: { A: [...currentPunched.A], B: [...currentPunched.B] }
    }]);
  };

  const handleUndo = () => {
    if (history.length === 0 || isCrimped) return;
    playSound('undo_click');
    const previousState = history[history.length - 1];
    setAvailableWires(previousState.available);
    setPins(previousState.pins);
    setPunchedPins(previousState.punchedPins || { A: Array(8).fill(false), B: Array(8).fill(false) });
    setHistory(history.slice(0, -1));
    setSelectedWire(null);
    setIsPullerActive(false);
  };

  const generateScenario = () => {
    playSound('reset');
    
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setActiveScenario(randomScenario);

    setHardwareType(randomScenario.forcedHardware || 'rj45');
    setCableType(randomScenario.forcedCableType || 'straight');
    setActiveStandard(randomScenario.forcedStandard || 'T568B');
    setActiveMode('exam');
    setExamTime(60); 
    setIsTrainingWheels(false); 
    setIsPullerActive(false);
    setActiveEnd('A');
    setSelectedWire(null);
    setHistory([]);

    if (randomScenario.initialSetup) {
      const newPinsA = randomScenario.initialSetup.pinsA || Array(8).fill(null);
      const newPinsB = randomScenario.initialSetup.pinsB || Array(8).fill(null);
      
      setPins({ A: newPinsA, B: newPinsB });

      setPunchedPins({
        A: randomScenario.initialSetup.punchedPinsA || Array(8).fill(false),
        B: randomScenario.initialSetup.punchedPinsB || Array(8).fill(false)
      });

      const injectedIdsA = newPinsA.filter(w => w !== null).map(w => w.id);
      const injectedIdsB = newPinsB.filter(w => w !== null).map(w => w.id);
      
      setAvailableWires({
        A: INITIAL_WIRES.filter(wire => !injectedIdsA.includes(wire.id)),
        B: INITIAL_WIRES.filter(wire => !injectedIdsB.includes(wire.id))
      });

      setIsCrimped(!!randomScenario.initialSetup.isCrimped);
    } else {
      setPins({ A: Array(8).fill(null), B: Array(8).fill(null) });
      setAvailableWires({ A: INITIAL_WIRES, B: INITIAL_WIRES });
      setPunchedPins({ A: Array(8).fill(false), B: Array(8).fill(false) });
      setIsCrimped(false);
    }

    setDiagnosticMsg({ status: 'idle', text: 'Scenario loaded. Awaiting repairs...' });
  };

  const handleWireSelect = (wire) => {
    if (isCrimped) return; 
    playSound('tap');
    setSelectedWire(selectedWire?.id === wire.id ? null : wire);
    setIsPullerActive(false); 
  };

  const handlePinClick = (index, end) => {
    if (isCrimped) return; 
    if (end !== activeEnd) {
      setActiveEnd(end);
      setSelectedWire(null); 
      return; 
    }

    if (selectedWire) {
      if (isTrainingWheels && activeMode !== 'exam') {
        let targetStandard = activeStandard;
        if (cableType === 'crossover' && end === 'B') {
           targetStandard = activeStandard === 'T568A' ? 'T568B' : 'T568A';
        }
        if (selectedWire.id !== STANDARDS[targetStandard][index]) {
          playSound('error_buzz');
          setDiagnosticMsg({ status: 'error', text: `ASSIST: Incorrect wire. Pin ${index + 1} requires a different color.` });
          setSelectedWire(null); 
          return; 
        }
      }

      playSound('snap_in');
      saveHistory(availableWires, pins, punchedPins); 
      const newPins = { ...pins, [end]: [...pins[end]] };
      let newAvailable = availableWires[end].filter(w => w.id !== selectedWire.id);
      
      if (newPins[end][index]) newAvailable.push(newPins[end][index]);
      newPins[end][index] = selectedWire;
      
      setPins(newPins);
      setAvailableWires({ ...availableWires, [end]: newAvailable });
      setSelectedWire(null); 
      
      if (isTrainingWheels) setDiagnosticMsg({ status: 'success', text: 'Wire seated. Awaiting termination.' });
      
    } else if (pins[end][index]) {
      
      if (punchedPins[end][index]) {
        if (isPullerActive) {
          playSound('snap_out'); 
          saveHistory(availableWires, pins, punchedPins);
          const newPins = { ...pins, [end]: [...pins[end]] };
          const newPunched = { ...punchedPins, [end]: [...punchedPins[end]] };
          const returnedWire = pins[end][index];

          newPins[end][index] = null;
          newPunched[end][index] = false;

          setPins(newPins);
          setPunchedPins(newPunched);
          setAvailableWires({ ...availableWires, [end]: [...availableWires[end], returnedWire] });
          setDiagnosticMsg({ status: 'success', text: 'Wire extracted using Puller Tool.' });
          setIsPullerActive(false); 
        } else {
          setDiagnosticMsg({ status: 'error', text: 'Wire is punched down! Use the Puller Tool to extract it.' });
          playSound('error_buzz');
        }
      } else {
        playSound('snap_out');
        saveHistory(availableWires, pins, punchedPins);
        const newPins = { ...pins, [end]: [...pins[end]] };
        const returnedWire = pins[end][index];
        newPins[end][index] = null;
        setPins(newPins);
        setAvailableWires({ ...availableWires, [end]: [...availableWires[end], returnedWire] });
      }
    }
  };

  const handlePunchDown = () => {
    const unpunchedIndices = pins[activeEnd].map((w, i) => (w && !punchedPins[activeEnd][i]) ? i : null).filter(i => i !== null);
    
    if (unpunchedIndices.length === 0) {
      setDiagnosticMsg({ status: 'error', text: 'No loose wires to punch down on this block.' });
      return;
    }

    setIsCrimping(true); 
    setDiagnosticMsg({ status: 'testing', text: 'Punching down wires...' });

    unpunchedIndices.forEach((pinIndex, sequence) => {
      setTimeout(() => {
        playSound('crimp_tool'); 
        setPunchedPins(prev => {
          const newPunched = { ...prev };
          newPunched[activeEnd][pinIndex] = true;
          return newPunched;
        });
      }, sequence * 300); 
    });

    setTimeout(() => {
      setIsCrimping(false);
      const isFullyPunched = pins[activeEnd].every((w, i) => w && punchedPins[activeEnd][i]);
      if (isFullyPunched && (!pins.B.includes(null) || cableType === 'straight')) {
         setIsCrimped(true);
         setDiagnosticMsg({ status: 'idle', text: 'Termination complete. Ready for signal test.' });
      } else {
         setDiagnosticMsg({ status: 'success', text: 'Wires terminated into IDC block.' });
      }
    }, unpunchedIndices.length * 300 + 500);
  };

  const handleCrimp = () => {
    const aFull = !pins.A.includes(null);
    const bFull = !pins.B.includes(null);
    if (!aFull || (cableType === 'crossover' && !bFull)) {
      setDiagnosticMsg({ status: 'error', text: 'FAULT: Missing wires on active configuration.' });
      playSound('error_buzz');
      return;
    }
    playSound('crimp_tool');
    setIsCrimping(true);
    setDiagnosticMsg({ status: 'testing', text: 'Crimping cable...' });
    setTimeout(() => {
      setIsCrimping(false);
      setIsCrimped(true);
      setDiagnosticMsg({ status: 'idle', text: 'Cable locked. Run tester.' });
    }, 1200);
  };

  const runTester = () => {
    playSound('tester_start');
    setIsTesting(true);
    setDiagnosticMsg({ status: 'testing', text: `Testing signal integrity...`, errors: null });
    let step = 0;
    setTesterStep(step);
    
    const interval = setInterval(() => {
      playSound('tester_beep');
      step++;
      if (step > 7) {
        clearInterval(interval);
        setTimeout(() => {
          setTesterStep(-1);
          setIsTesting(false);
          validateWiring(); 
        }, 800);
      } else {
        setTesterStep(step);
      }
    }, 400); 
  };

  const checkPinsMatch = (pinArray, standardKey) => pinArray.every((wire, index) => wire && wire.id === STANDARDS[standardKey][index]);

  const validateWiring = () => {
    let isCorrect = false;
    let errors = [];

    if (cableType === 'straight') {
      isCorrect = checkPinsMatch(pins.A, activeStandard);
      if (!isCorrect) errors.push(`End A failed ${activeStandard} specification.`);
    } else {
      const aIsA = checkPinsMatch(pins.A, 'T568A');
      const aIsB = checkPinsMatch(pins.A, 'T568B');
      const bIsA = checkPinsMatch(pins.B, 'T568A');
      const bIsB = checkPinsMatch(pins.B, 'T568B');
      if ((aIsA && bIsB) || (aIsB && bIsA)) {
        isCorrect = true;
      } else {
        errors.push("Crossover failed: One end must be T568A and the other T568B.");
      }
    }

    if (isCorrect) {
      playSound('success_chime');
      setUserXP(prev => prev + (activeScenario ? activeScenario.reward : (cableType === 'crossover' ? 100 : 50)));
      setDiagnosticMsg({ status: 'success', text: `VALIDATED. Link established.` });
      setActiveScenario(null);
    } else {
      playSound('error_buzz');
      setDiagnosticMsg({ status: 'error', text: 'WIRE FAULT DETECTED.', errors });
    }
  };

  const resetLab = () => {
    playSound('reset');
    setAvailableWires({ A: INITIAL_WIRES, B: INITIAL_WIRES });
    setPins({ A: Array(8).fill(null), B: Array(8).fill(null) });
    setPunchedPins({ A: Array(8).fill(false), B: Array(8).fill(false) });
    setSelectedWire(null);
    setIsCrimped(false);
    setIsTesting(false);
    setTesterStep(-1);
    setHistory([]);
    setActiveScenario(null);
    setActiveEnd('A');
    setActiveMode('learn');
    setIsPullerActive(false);
    setDiagnosticMsg({ status: 'idle', text: `Lab reset.` });
  };

  return {
    state: { hardwareType, punchedPins, cableType, activeEnd, availableWires, selectedWire, pins, history, activeStandard, activeMode, examTime, activeScenario, userXP, isCrimping, isCrimped, isTesting, testerStep, isXRayMode, isPullerActive, diagnosticMsg, currentRank, crossoverMap, isTrainingWheels, isRefOpen },
    setters: { setHardwareType, setActiveStandard, setIsXRayMode, setCableType, setActiveEnd, setActiveMode, setIsTrainingWheels, setIsRefOpen, setIsPullerActive },
    actions: { handlePunchDown, handleWireSelect, handlePinClick, handleCrimp, runTester, resetLab, generateScenario, handleUndo }
  };
};