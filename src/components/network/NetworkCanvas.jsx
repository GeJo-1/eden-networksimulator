// src/components/network/NetworkCanvas.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div;

// ============================================================================
// CONTEXTUAL DRILL DOWN (CONFIGURATION PANEL) - LIQUID ANIMATIONS
// ============================================================================
const ContextualDrillDown = ({ device, connections, onSave, onRemoveDevice, onRemoveConnection, onClose }) => {
  const [ip, setIp] = useState(device.ip || '');
  const [subnet, setSubnet] = useState(device.subnet || '');
  const [gateway, setGateway] = useState(device.gateway || '');

  const handleIpChange = (e) => {
    const val = e.target.value;
    setIp(val); 
    
    const octets = val.split('.');
    if (octets.length > 1) {
      const firstOctet = parseInt(octets[0], 10);
      if (!isNaN(firstOctet)) {
        let autoSubnet = '';
        if (firstOctet >= 1 && firstOctet <= 127) autoSubnet = '255.0.0.0';          
        else if (firstOctet >= 128 && firstOctet <= 191) autoSubnet = '255.255.0.0';   
        else if (firstOctet >= 192 && firstOctet <= 223) autoSubnet = '255.255.255.0'; 

        setSubnet(prevMask => {
          const isDefault = !prevMask || ['255.0.0.0', '255.255.0.0', '255.255.255.0'].includes(prevMask);
          if (isDefault && autoSubnet && prevMask !== autoSubnet) return autoSubnet;
          return prevMask;
        });
      }
    } else if (val === '') {
      setSubnet(prevMask => {
        if (['255.0.0.0', '255.255.0.0', '255.255.255.0'].includes(prevMask)) return '';
        return prevMask;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(device.id, { ip, subnet, gateway });
  };

  const isConfigurable = device.type !== 'switch';
  const activeLinks = connections.filter(c => c.from === device.id || c.to === device.id);

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-slate-50/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-slate-300 dark:border-cyan-900/50 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col transition-colors duration-500"
    >
      <div className="p-4 sm:p-6 border-b border-slate-300 dark:border-gray-800 flex justify-between items-start bg-white dark:bg-black/20 shrink-0">
        <div>
          <span className="text-cyan-700 dark:text-cyan-500 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">{device.id}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 capitalize">{device.type} Node</h2>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono font-bold text-slate-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
            STATUS: ONLINE
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white text-3xl p-2 w-12 h-12 flex items-center justify-center transition-colors duration-200">✕</button>
      </div>

      <div className="p-4 sm:p-6 flex-grow overflow-y-auto hide-scrollbar space-y-6 sm:space-y-8">
        {/* Added layout to the container so it smoothly shrinks/grows */}
        <MotionDiv layout className="flex flex-col gap-3">
          <MotionDiv layout as="h3" className="text-slate-500 dark:text-gray-600 font-black text-xs sm:text-sm tracking-widest uppercase">Active Interfaces</MotionDiv>
          
          <AnimatePresence mode="popLayout">
            {activeLinks.length === 0 ? (
              <MotionDiv 
                layout
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-100 dark:bg-black/40 rounded-lg p-4 border border-slate-300 dark:border-white/5 text-center text-slate-400 dark:text-gray-600 text-xs sm:text-sm uppercase font-mono font-bold tracking-widest"
              >
                No Cables Connected
              </MotionDiv>
            ) : (
              <MotionDiv layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeLinks.map(link => {
                    const isSource = link.from === device.id;
                    const localPort = isSource ? link.fromPort : link.toPort;
                    const remoteDevice = isSource ? link.to : link.from;
                    const remotePort = isSource ? link.toPort : link.fromPort;
                    return (
                      <MotionDiv 
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        key={link.id} 
                        className="flex items-center justify-between bg-white dark:bg-black/40 rounded-lg p-3 border border-slate-300 dark:border-white/5 shadow-sm dark:shadow-none"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase">{localPort}</span>
                          <span className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-gray-400">to {remoteDevice} ({remotePort})</span>
                        </div>
                        <button 
                          onClick={() => onRemoveConnection(link.id)}
                          className="px-4 py-2 min-h-[40px] bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded border border-red-200 dark:border-red-800 transition-colors"
                        >
                          Unplug
                        </button>
                      </MotionDiv>
                    );
                  })}
                </AnimatePresence>
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>

        <MotionDiv layout>
          <h3 className="text-slate-500 dark:text-gray-600 font-black text-xs sm:text-sm tracking-widest uppercase mb-3">Hardware Info</h3>
          <div className="bg-white dark:bg-black/40 rounded-lg p-4 border border-slate-300 dark:border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-gray-500 font-mono font-bold text-xs sm:text-sm uppercase">MAC</span>
              <span className="text-slate-800 dark:text-gray-300 font-mono font-bold text-xs sm:text-sm">{device.mac}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-gray-500 font-mono font-bold text-xs sm:text-sm uppercase">Uptime</span>
              <span className="text-slate-800 dark:text-gray-300 font-mono font-bold text-xs sm:text-sm">14d 02h 45m</span>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv layout>
          <h3 className="text-slate-500 dark:text-gray-600 font-black text-xs sm:text-sm tracking-widest uppercase mb-3">Layer 3 Config</h3>
          {isConfigurable ? (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-black/40 rounded-lg p-4 border border-slate-300 dark:border-cyan-900/30">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">IPv4 Address</label>
                <input type="text" value={ip} onChange={handleIpChange} className="w-full h-11 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-md px-3 text-slate-900 dark:text-cyan-300 font-mono font-bold text-sm focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Subnet Mask</label>
                <input type="text" value={subnet} onChange={(e) => setSubnet(e.target.value)} className="w-full h-11 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-md px-3 text-slate-900 dark:text-cyan-300 font-mono font-bold text-sm focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Default Gateway</label>
                <input type="text" value={gateway} onChange={(e) => setGateway(e.target.value)} className="w-full h-11 bg-slate-50 dark:bg-black border border-slate-300 dark:border-gray-700 rounded-md px-3 text-slate-900 dark:text-cyan-300 font-mono font-bold text-sm focus:border-cyan-600 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300" />
              </div>
              <div className="pt-3">
                <motion.button whileTap={{ scale: 0.97 }} type="submit" className="w-full h-12 bg-cyan-100 dark:bg-cyan-900/40 hover:bg-cyan-200 dark:hover:bg-cyan-600 border border-cyan-400 dark:border-cyan-600 text-cyan-800 hover:text-cyan-900 dark:text-white text-xs sm:text-sm font-black tracking-widest uppercase rounded-md transition-colors">Apply Config</motion.button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 dark:bg-black/40 rounded-lg p-4 border border-slate-300 dark:border-white/5 text-center text-slate-500 dark:text-gray-500 text-xs sm:text-sm uppercase font-mono font-bold tracking-widest">
              Unmanaged Device<br/>(L2 Switching Only)
            </div>
          )}
        </MotionDiv>

        <MotionDiv layout>
          <h3 className="text-slate-500 dark:text-gray-600 font-black text-xs sm:text-sm tracking-widest uppercase mb-3">Live Terminal</h3>
          <div className="bg-slate-900 dark:bg-black rounded-lg border border-slate-800 dark:border-gray-800 p-4 h-40 overflow-hidden font-mono text-[10px] sm:text-xs text-green-400 dark:text-gray-400 flex flex-col gap-1 relative shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 dark:to-black/80 pointer-events-none z-10"></div>
            {device.logs.map((log, i) => (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i}>{log}</motion.p>
            ))}
            <p className="text-cyan-400 animate-pulse mt-1">_</p>
          </div>
        </MotionDiv>

        <MotionDiv layout className="pt-6 mt-2 border-t border-slate-300 dark:border-gray-800 pb-8 sm:pb-0">
          <button 
            onClick={() => onRemoveDevice(device.id)}
            className="w-full h-12 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 border border-red-300 dark:border-red-800 text-red-700 hover:text-red-800 dark:text-red-500 text-xs sm:text-sm font-black tracking-widest uppercase rounded-md transition-colors"
          >
            [!] Trash Hardware
          </button>
        </MotionDiv>
      </div>
    </motion.div>
  );
};


// ============================================================================
// MAIN TOPOLOGY GRID (NETWORK CANVAS)
// ============================================================================
export default function NetworkCanvas({ state, setters, actions }) {
  const { devices, connections, activeTool, linkingDevice, pingSource, pingLog, diagnosticMsg, selectedConfigDevice } = state;
  const { setActiveTool, setSelectedConfigDevice } = setters;
  const { addDevice, updateDevicePosition, handleDeviceClick, saveDeviceConfig, clearNetwork, startLink, completeLink, cancelLink, removeDevice, removeConnection } = actions;

  const canvasRef = useRef(null);
  const [portMenu, setPortMenu] = useState(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [snifferLogs, setSnifferLogs] = useState([]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    let interval;
    let initTimeout;

    if (pingSource) {
      initTimeout = setTimeout(() => {
        setSnifferLogs([
          `[INFO] Promiscuous mode enabled on ${pingSource}...`, 
          `[INFO] Capturing interface traffic...`
        ]);
      }, 150);

      interval = setInterval(() => {
        const hex = Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(' ');
        const protocols = ['ICMP', 'ARP', 'TCP', 'UDP'];
        const proto = protocols[Math.floor(Math.random() * protocols.length)];
        setSnifferLogs(prev => [...prev.slice(-12), `0x${Math.floor(Math.random()*9999).toString(16).padStart(4, '0')}  ${hex}  [${proto}] TTL:128`]);
      }, 250);
      
    } else {
      initTimeout = setTimeout(() => {
        setSnifferLogs(['[INFO] Interface idle. Waiting for packets...']);
      }, 0);
    }

    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
    };
  }, [pingSource]);

  const getDeviceCenter = (id) => {
    const device = devices.find(d => d.id === id);
    return device ? { x: device.x + 40, y: device.y + 40 } : { x: 0, y: 0 };
  };

  const handleNodeInteraction = (device) => {
    if (activeTool === 'cursor' || activeTool === 'ping') handleDeviceClick(device.id); 
    else if (activeTool === 'straight' || activeTool === 'crossover') setPortMenu({ device, x: device.x + 85, y: device.y });
  };

  const handlePortSelect = (portId) => {
    if (!linkingDevice) startLink(portMenu.device.id, portId);
    else {
      if (linkingDevice.id === portMenu.device.id) cancelLink(); 
      else completeLink(portMenu.device.id, portId);
    }
    setPortMenu(null);
  };

  const renderDeviceIcon = (type, isActive) => {
    const activeLed = isActive ? 'bg-amber-400 animate-[ping_0.3s_ease-in-out_infinite] shadow-[0_0_8px_#fbbf24]' : 'bg-cyan-500 shadow-[0_0_2px_#06b6d4]';
    const activeLed2 = isActive ? 'bg-green-400 animate-[ping_0.2s_ease-in-out_infinite] shadow-[0_0_8px_#4ade80]' : 'bg-green-500 animate-pulse shadow-[0_0_2px_#22c55e]';

    if (type === 'pc') {
      return (
        <div className="flex flex-col items-center justify-end w-full h-full pb-2 relative transition-colors scale-110 sm:scale-100">
          <div className="w-10 h-7 bg-slate-800 dark:bg-black border-2 border-slate-400 dark:border-gray-500 rounded-sm relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-end p-[1px]">
             <div className="w-full h-full bg-slate-200 dark:bg-cyan-950/20 rounded-[1px] overflow-hidden relative">
               <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_2px]"></div>
             </div>
             <div className={`absolute -bottom-1 right-1 w-0.5 h-0.5 rounded-full ${activeLed2}`}></div>
          </div>
          <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500"></div>
          <div className="w-6 h-1 bg-slate-500 dark:bg-gray-400 rounded-t-sm"></div>
        </div>
      );
    }
    if (type === 'server') {
      return (
        <div className="w-8 h-12 bg-slate-300 dark:bg-gray-800 border-2 border-slate-500 dark:border-gray-500 rounded-sm flex flex-col justify-between p-1 relative shadow-inner transition-colors scale-110 sm:scale-100">
          <div className="w-full h-2.5 bg-slate-800 dark:bg-black rounded-[1px] border border-slate-400 dark:border-gray-600 flex items-center px-1">
             <div className={`w-1 h-1 rounded-full ${activeLed2}`}></div>
          </div>
          <div className="w-full h-2.5 bg-slate-800 dark:bg-black rounded-[1px] border border-slate-400 dark:border-gray-600 flex items-center justify-between px-1">
             <div className="flex gap-[1px]">
               <div className={`w-0.5 h-1.5 ${isActive ? 'bg-amber-400 animate-ping delay-75' : 'bg-yellow-500 animate-pulse delay-75'}`}></div>
               <div className={`w-0.5 h-1.5 ${isActive ? 'bg-amber-400 animate-ping delay-100' : 'bg-yellow-500 animate-pulse delay-150'}`}></div>
               <div className={`w-0.5 h-1.5 ${isActive ? 'bg-green-400 animate-ping delay-150' : 'bg-yellow-500 animate-pulse'}`}></div>
             </div>
          </div>
        </div>
      );
    }
    if (type === 'router') {
      return (
        <div className="relative w-12 h-12 flex items-center justify-center transition-colors scale-110 sm:scale-100">
          <div className="absolute inset-0 rounded-full bg-slate-200 dark:bg-gray-800 border-2 border-slate-400 dark:border-gray-600 shadow-xl dark:shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"></div>
          <div className={`absolute inset-1 rounded-full border-2 border-dashed ${isActive ? 'border-amber-400 animate-[spin_4s_linear_infinite]' : 'border-cyan-500 dark:border-cyan-400 animate-[spin_12s_linear_infinite]'} opacity-70`}></div>
          <div className="w-4 h-4 rounded-full bg-slate-800 dark:bg-black border border-cyan-400 shadow-[0_0_10px_#22d3ee] flex items-center justify-center">
             <div className={`w-1.5 h-1.5 rounded-full ${activeLed}`}></div>
          </div>
        </div>
      );
    }
    if (type === 'switch') {
      return (
        <div className="w-14 h-6 bg-slate-300 dark:bg-gray-800 border border-slate-500 dark:border-gray-500 rounded flex flex-col justify-center px-1 shadow-inner transition-colors scale-110 sm:scale-100">
          <div className="w-full bg-slate-800 dark:bg-black h-3.5 rounded-[1px] border border-slate-400 dark:border-gray-700 flex items-center justify-evenly px-0.5 gap-[1px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-[3px] h-[6px] bg-slate-300 dark:bg-gray-600 rounded-[0.5px] border border-slate-900 dark:border-black flex flex-col items-center justify-between py-[0.5px]">
                <div className="w-full h-[1px] bg-yellow-500/80"></div>
                {isActive && i % 2 === 0 && <div className="w-[1.5px] h-[1.5px] bg-green-400 rounded-full animate-[ping_0.1s_ease-in-out_infinite]"></div>}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="flex-grow flex flex-col relative bg-slate-200 dark:bg-gray-950 overflow-hidden touch-none transition-colors duration-500"
      onClick={() => portMenu && setPortMenu(null)} 
    >
      <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none bg-[radial-gradient(#64748b_2px,transparent_2px)] dark:bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:40px_40px] transition-colors duration-500"></div>
      
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-200"
        style={{ background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.15), transparent 100%)` }}
      ></div>

      <AnimatePresence>
        {portMenu && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            style={{ top: portMenu.y, left: portMenu.x }}
            className="absolute z-[150] bg-slate-100 dark:bg-gray-900 border-2 border-slate-400 dark:border-gray-600 shadow-2xl dark:shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-xl p-4 flex flex-col w-56 sm:w-64"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-gray-300 mb-3 border-b border-slate-300 dark:border-gray-700 pb-2 flex justify-between items-center">
              <span>{portMenu.device.type.toUpperCase()} INTERFACE</span>
              <span className="text-slate-400 dark:text-gray-500">{portMenu.device.id}</span>
            </div>
            <div className={`grid gap-2 ${portMenu.device.type === 'switch' ? 'grid-cols-4' : 'grid-cols-2'}`}>
              {portMenu.device.ports.map(port => {
                const isUsed = connections.some(c => (c.from === portMenu.device.id && c.fromPort === port.id) || (c.to === portMenu.device.id && c.toPort === port.id));
                return (
                  <button
                    key={port.id}
                    disabled={isUsed}
                    onClick={() => handlePortSelect(port.id)}
                    className={`relative h-12 border-2 rounded-lg flex flex-col items-center justify-center transition-all overflow-hidden
                      ${isUsed ? 'border-slate-300 bg-slate-200 dark:border-gray-800 dark:bg-black opacity-60 cursor-not-allowed'
                               : 'border-slate-400 bg-white hover:border-cyan-500 hover:bg-cyan-50 dark:border-gray-500 dark:bg-gray-800 dark:hover:border-cyan-400 dark:hover:bg-cyan-900/30 cursor-pointer shadow-sm'}`}
                  >
                    <div className="w-6 h-5 bg-slate-800 dark:bg-black border border-slate-500 dark:border-gray-600 rounded-sm mb-1 flex items-start justify-center shadow-inner relative">
                       <div className="w-2.5 h-1.5 bg-yellow-600/50 mt-[1px]"></div>
                       {isUsed && (
                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-0 w-3.5 h-3.5 bg-cyan-600 dark:bg-cyan-500 border border-slate-900 shadow-md">
                           <div className="w-1 h-3 mx-auto bg-slate-300/50 rounded-t-sm mt-1"></div>
                         </motion.div>
                       )}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-gray-400 z-10">{port.id}</span>
                  </button>
                )
              })}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedConfigDevice && (
          <ContextualDrillDown 
            key={`config-panel-${selectedConfigDevice.id}`} 
            device={selectedConfigDevice} 
            connections={connections}
            onSave={saveDeviceConfig} 
            onRemoveDevice={removeDevice}
            onRemoveConnection={removeConnection}
            onClose={() => setSelectedConfigDevice(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- RESPONSIVE TOOLBAR: NETWORK TOOLS (Liquid Layout) --- */}
      <MotionDiv layout className="absolute top-4 sm:top-6 left-4 right-4 md:left-auto md:right-6 z-40 bg-slate-50/90 dark:bg-gray-900/60 backdrop-blur-md p-2 sm:p-4 rounded-xl flex flex-row md:flex-col gap-2 border border-slate-300 dark:border-white/10 shadow-lg dark:shadow-xl overflow-x-auto md:overflow-hidden md:w-56 hide-scrollbar items-center md:items-stretch transition-colors">
        <span className="hidden md:block text-xs font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-500 mb-2">2. Network Tools</span>
        <button onClick={() => {setActiveTool('cursor'); cancelLink();}} className={`flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 border text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left shadow-sm dark:shadow-none ${activeTool === 'cursor' ? 'bg-cyan-100 text-cyan-800 border-cyan-500 dark:bg-cyan-600 dark:text-white dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white'}`}>Select / Config</button>
        <button onClick={() => setActiveTool('straight')} className={`flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 border text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left shadow-sm dark:shadow-none ${activeTool === 'straight' ? 'bg-cyan-100 text-cyan-800 border-cyan-500 dark:bg-cyan-600 dark:text-white dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white'}`}>Straight Cable</button>
        <button onClick={() => setActiveTool('crossover')} className={`flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 border text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left shadow-sm dark:shadow-none ${activeTool === 'crossover' ? 'bg-cyan-100 text-cyan-800 border-cyan-500 dark:bg-cyan-600 dark:text-white dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white'}`}>Cross Cable</button>
        <div className="w-px h-8 bg-slate-300 dark:bg-white/10 mx-1 md:hidden"></div>
        <button onClick={() => {setActiveTool('ping'); cancelLink();}} className={`flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 border text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left md:mt-2 shadow-sm dark:shadow-none ${activeTool === 'ping' ? 'bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-600 dark:text-white dark:shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'bg-white text-yellow-700 border-slate-300 hover:text-yellow-800 hover:border-yellow-400 dark:bg-gray-800 dark:text-yellow-500 dark:border-gray-600 dark:hover:text-yellow-400'}`}>Ping (ICMP)</button>
      </MotionDiv>

      {/* --- RESPONSIVE TOOLBAR: DEPLOY HARDWARE (Liquid Layout) --- */}
      <MotionDiv layout className="absolute bottom-4 sm:bottom-6 md:bottom-auto md:top-6 left-4 right-4 md:right-auto md:left-6 z-40 bg-slate-50/90 dark:bg-gray-900/60 backdrop-blur-md p-2 sm:p-4 rounded-xl flex flex-row md:flex-col gap-2 border border-slate-300 dark:border-white/10 shadow-lg dark:shadow-xl overflow-x-auto md:overflow-hidden md:w-56 hide-scrollbar items-center md:items-stretch transition-colors">
        <span className="hidden md:block text-xs font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-500 mb-2">1. Deploy Hardware</span>
        <button onClick={() => addDevice('router')} className="flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 bg-white border border-slate-300 hover:border-cyan-500 text-slate-800 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-cyan-400 dark:text-white text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left shadow-sm dark:shadow-none">+ Router</button>
        <button onClick={() => addDevice('switch')} className="flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 bg-white border border-slate-300 hover:border-cyan-500 text-slate-800 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-cyan-400 dark:text-white text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left shadow-sm dark:shadow-none">+ Switch</button>
        <button onClick={() => addDevice('server')} className="flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 bg-white border border-slate-300 hover:border-cyan-500 text-slate-800 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-cyan-400 dark:text-white text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left shadow-sm dark:shadow-none">+ Server</button>
        <button onClick={() => addDevice('pc')} className="flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 bg-white border border-slate-300 hover:border-cyan-500 text-slate-800 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-cyan-400 dark:text-white text-[11px] sm:text-xs font-black rounded-lg transition-all md:text-left shadow-sm dark:shadow-none">+ PC</button>
        <div className="w-px h-8 bg-slate-300 dark:bg-white/10 mx-1 md:hidden"></div>
        <button onClick={clearNetwork} className="flex-shrink-0 min-h-[44px] md:min-h-0 whitespace-nowrap px-4 py-2 md:mt-2 text-red-600 hover:bg-red-100 hover:border-red-300 dark:text-red-400 dark:hover:bg-red-500/20 border border-transparent dark:hover:border-red-500/30 rounded-lg text-[11px] sm:text-xs font-black transition-all md:text-left">Wipe Grid</button>
      </MotionDiv>

      {/* --- CROSSFADING DIAGNOSTIC MESSAGE --- */}
      <MotionDiv layout className="absolute bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-lg border border-slate-300 dark:border-white/10 shadow-lg whitespace-nowrap max-w-[95vw] overflow-hidden text-ellipsis transition-colors">
        <AnimatePresence mode="wait">
          <motion.span 
            key={diagnosticMsg.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`block text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest
              ${diagnosticMsg.status === 'error' ? 'text-red-700 dark:text-red-500' : diagnosticMsg.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-cyan-700 dark:text-cyan-400'}`}
          >
            {diagnosticMsg.text}
          </motion.span>
        </AnimatePresence>
      </MotionDiv>

      <AnimatePresence>
        {pingLog.length > 0 && (
          <MotionDiv 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-40 md:bottom-20 left-4 right-4 md:left-6 md:right-auto z-40 bg-slate-900/95 dark:bg-black/95 border border-slate-700 dark:border-white/20 rounded-xl p-4 md:w-96 shadow-2xl dark:shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
              <span className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-widest uppercase">Pkt Capture (eth0)</span>
              <div className={`w-2.5 h-2.5 rounded-full ${pingSource ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-slate-600'}`}></div>
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] font-bold text-green-400 leading-relaxed space-y-1.5 h-32 overflow-hidden flex flex-col justify-end">
              {snifferLogs.map((log, i) => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="whitespace-nowrap overflow-hidden text-ellipsis">{log}</motion.div>
              ))}
              <div className="w-2.5 h-3.5 bg-green-400 animate-pulse mt-1 inline-block"></div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* --- SVG CANVAS: SELF-DRAWING ANIMATED CABLES --- */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {connections.map(conn => {
          const from = getDeviceCenter(conn.from);
          const to = getDeviceCenter(conn.to);
          const isFault = conn.status === 'fault';
          const isActivePingPath = pingSource && (conn.from === pingSource || conn.to === pingSource) && !isFault;
          
          const baseColor = isFault ? '#dc2626' : '#0891b2'; 
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          const nodeOffset = 40; 
          const labelOffset = 60; 

          const fromNodeX = from.x + Math.cos(angle) * nodeOffset;
          const fromNodeY = from.y + Math.sin(angle) * nodeOffset;
          const toNodeX = to.x - Math.cos(angle) * nodeOffset;
          const toNodeY = to.y - Math.sin(angle) * nodeOffset;

          const droop = distance * 0.18; 
          const midX = (fromNodeX + toNodeX) / 2;
          const midY = (fromNodeY + toNodeY) / 2 + droop;
          
          const pathD = `M ${fromNodeX} ${fromNodeY} Q ${midX} ${midY} ${toNodeX} ${toNodeY}`;
          const pathReverseD = `M ${toNodeX} ${toNodeY} Q ${midX} ${midY} ${fromNodeX} ${fromNodeY}`;

          return (
            <g key={conn.id}>
              {/* Animated Path Drawing */}
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                d={pathD} fill="none" stroke={baseColor} strokeWidth="6" strokeOpacity="0.4" className="dark:stroke-opacity-30" 
              />
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                d={pathD} fill="none" stroke={baseColor} strokeWidth="2" strokeDasharray={conn.type === 'crossover' ? '6,4' : 'none'} 
              />
              
              <circle cx={fromNodeX} cy={fromNodeY} r="4.5" fill="#0891b2" className="drop-shadow-sm dark:drop-shadow-[0_0_5px_#22d3ee]" />
              <circle cx={toNodeX} cy={toNodeY} r="4.5" fill="#0891b2" className="drop-shadow-sm dark:drop-shadow-[0_0_5px_#22d3ee]" />

              {!isFault && (
                <>
                  <circle r="1.5" fill="#06b6d4" opacity="0.4"><animateMotion dur="3s" repeatCount="indefinite" path={pathD} /></circle>
                  {isActivePingPath && (
                    <>
                      <circle r="3.5" fill="#4ade80" className="drop-shadow-[0_0_8px_#4ade80]"><animateMotion dur="0.6s" repeatCount="indefinite" path={pathD} /></circle>
                      <circle r="3.5" fill="#fbbf24" className="drop-shadow-[0_0_8px_#fbbf24]"><animateMotion dur="0.6s" repeatCount="indefinite" path={pathReverseD} /></circle>
                    </>
                  )}
                </>
              )}

              {/* Fade in text after cable finishes drawing */}
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }} x={from.x + Math.cos(angle) * labelOffset} y={from.y + Math.sin(angle) * labelOffset} className="text-[9px] sm:text-[10px] fill-slate-800 dark:fill-white font-mono font-black drop-shadow-sm dark:drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" dominantBaseline="central" textAnchor="middle">{conn.fromPort}</motion.text>
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }} x={to.x - Math.cos(angle) * labelOffset} y={to.y - Math.sin(angle) * labelOffset} className="text-[9px] sm:text-[10px] fill-slate-800 dark:fill-white font-mono font-black drop-shadow-sm dark:drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" dominantBaseline="central" textAnchor="middle">{conn.toPort}</motion.text>

              {isFault && <motion.text initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} x={midX} y={midY} fill="#dc2626" fontSize="18" fontWeight="bold" textAnchor="middle" dominantBaseline="central">X</motion.text>}
            </g>
          );
        })}
      </svg>

      {/* --- HARDWARE DEPLOYMENT LAYER --- */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {devices.map(device => {
          const isLinkSource = linkingDevice?.id === device.id;
          const isWaitingForTarget = linkingDevice && !isLinkSource;
          const isPinging = pingSource === device.id;
          const isConfiguring = selectedConfigDevice?.id === device.id;
          const isDeviceActiveInPing = pingSource && (pingSource === device.id || connections.some(c => (c.from === pingSource && c.to === device.id) || (c.to === pingSource && c.from === device.id)));

          return (
            <MotionDiv
              key={device.id}
              drag={activeTool === 'cursor'} 
              dragMomentum={false}
              onDragEnd={(e, info) => updateDevicePosition(device.id, device.x + info.offset.x, device.y + info.offset.y)}
              initial={{ x: device.x, y: device.y, scale: 0 }}
              animate={{ x: device.x, y: device.y, scale: 1 }}
              whileHover={activeTool === 'cursor' ? { scale: 1.05 } : {}}
              whileTap={activeTool === 'cursor' ? { scale: 0.95 } : {}}
              onClick={() => handleNodeInteraction(device)}
              className={`absolute w-20 h-20 rounded-xl flex flex-col items-center justify-center border-2 shadow-lg dark:shadow-2xl transition-colors duration-300 pointer-events-auto
                ${activeTool === 'cursor' ? 'cursor-grab active:cursor-grabbing' : isWaitingForTarget ? 'cursor-pointer border-dashed' : 'cursor-crosshair'}
                ${isLinkSource ? 'border-cyan-500 bg-cyan-100 shadow-md dark:bg-cyan-900/30 dark:shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 
                  isWaitingForTarget ? 'border-cyan-400 bg-slate-50 dark:bg-gray-900 animate-pulse' :
                  isPinging ? 'border-amber-500 bg-amber-50 shadow-md dark:bg-amber-900/30 dark:shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 
                  isConfiguring ? 'border-slate-500 bg-slate-100 shadow-md dark:border-white dark:bg-cyan-900/50 dark:shadow-[0_0_20px_rgba(34,211,238,0.5)]' :
                  'border-slate-400 bg-white hover:border-cyan-500 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-cyan-500/50'}
              `}
            >
              <div className="flex items-center justify-center">
                {renderDeviceIcon(device.type, isDeviceActiveInPing)}
              </div>
              <span className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-white uppercase mt-1 drop-shadow-sm dark:drop-shadow-md">{device.type}</span>
              {device.ip && <span className="text-[9px] sm:text-[10px] text-cyan-800 dark:text-cyan-400 font-mono font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-black/50 rounded">{device.ip}</span>}
            </MotionDiv>
          );
        })}
      </div>
    </div>
  );
}