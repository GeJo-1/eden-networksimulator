// src/hooks/useNetwork.js
import { useState, useCallback } from 'react';

// --- THE MATH ENGINE: True IP & Subnet Calculations ---
const ipToLong = (ip) => {
  if (!ip) return 0;
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

const isSameSubnet = (ip1, mask1, ip2) => {
  if (!ip1 || !mask1 || !ip2) return false;
  const ip1Long = ipToLong(ip1);
  const ip2Long = ipToLong(ip2);
  const maskLong = ipToLong(mask1);
  return (ip1Long & maskLong) === (ip2Long & maskLong);
};

const generateMac = () => "XX:XX:XX:XX:XX:XX".replace(/X/g, () => "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16)));

export const useNetwork = () => {
  const [devices, setDevices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeTool, setActiveTool] = useState('cursor');
  
  const [linkingDevice, setLinkingDevice] = useState(null);
  const [pingSource, setPingSource] = useState(null);
  const [selectedConfigDevice, setSelectedConfigDevice] = useState(null);
  
  const [pingLog, setPingLog] = useState([]);
  const [diagnosticMsg, setDiagnosticMsg] = useState({ text: 'SYSTEM READY', status: 'idle' });

  // --- 1. HARDWARE GENERATION ---
  const addDevice = useCallback((type) => {
    const id = `${type}-${Date.now().toString().slice(-4)}`;
    
    let baseConfig = { ip: '', subnet: '', gateway: '' };
    let ports = [];

    if (type === 'pc' || type === 'server') {
      baseConfig = { ip: type === 'server' ? '192.168.1.100' : '192.168.1.10', subnet: '255.255.255.0', gateway: '192.168.1.1' };
      ports = [{ id: 'Eth0' }];
    } else if (type === 'router') {
      baseConfig = { ip: '192.168.1.1', subnet: '255.255.255.0', gateway: '' };
      ports = [{ id: 'Gig0/0' }, { id: 'Gig0/1' }]; 
    } else if (type === 'switch') {
      ports = Array.from({ length: 8 }, (_, i) => ({ id: `Fa0/${i + 1}` })); 
    }

    const newDevice = {
      id,
      type,
      x: window.innerWidth / 2 - 40 + (Math.random() * 40 - 20),
      y: window.innerHeight / 2 - 40 + (Math.random() * 40 - 20),
      mac: generateMac(),
      logs: [`[${new Date().toLocaleTimeString()}] Boot sequence initiated...`, 'Loading kernel...', 'Hardware interfaces up.'],
      ...baseConfig,
      ports
    };

    setDevices(prev => [...prev, newDevice]);
    setDiagnosticMsg({ text: `DEPLOYED: ${id.toUpperCase()}`, status: 'success' });
    setActiveTool('cursor');
  }, []);

  const updateDevicePosition = useCallback((id, x, y) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, x, y } : d));
  }, []);

  const saveDeviceConfig = useCallback((id, config) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        return { 
          ...d, 
          ...config, 
          logs: [...d.logs, `[${new Date().toLocaleTimeString()}] IP Config updated: ${config.ip}`].slice(-5) 
        };
      }
      return d;
    }));
    setSelectedConfigDevice(null);
    setDiagnosticMsg({ text: `CONFIG SAVED: ${id}`, status: 'success' });
  }, []);

  const clearNetwork = useCallback(() => {
    setDevices([]);
    setConnections([]);
    setPingLog([]);
    setDiagnosticMsg({ text: 'GRID WIPED', status: 'idle' });
  }, []);

  // --- NEW: DECOMMISSION HARDWARE & CABLES ---
  const removeDevice = useCallback((id) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    
    setDiagnosticMsg({ text: `DEVICE REMOVED: ${id.toUpperCase()}`, status: 'idle' });
    if (selectedConfigDevice?.id === id) {
      setSelectedConfigDevice(null);
    }
  }, [selectedConfigDevice]);

  const removeConnection = useCallback((connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    setDiagnosticMsg({ text: 'CABLE UNPLUGGED', status: 'idle' });
  }, []);

  // --- 2. LAYER 2 PATHFINDING ---
  const checkPhysicalPath = useCallback((startId, targetId) => {
    const queue = [startId];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === targetId) return true;

      const linkedEdges = connections.filter(c => c.from === current || c.to === current);
      
      for (let edge of linkedEdges) {
        if (edge.status === 'fault') continue; 

        const neighbor = edge.from === current ? edge.to : edge.from;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const neighborDevice = devices.find(d => d.id === neighbor);
          if (neighbor === targetId || neighborDevice?.type === 'switch') {
            queue.push(neighbor);
          }
        }
      }
    }
    return false;
  }, [connections, devices]); 

  // --- 3. THE LAYER 3 ROUTING ENGINE ---
  const executePing = useCallback((sourceNode, targetIp) => {
    if (!targetIp) {
      setPingLog(prev => [...prev, 'Ping request could not find host.']);
      return;
    }

    setPingLog(prev => [...prev, `Pinging ${targetIp} with 32 bytes of data:`]);
    setDiagnosticMsg({ text: 'TRANSMITTING ICMP ECHO...', status: 'testing' });

    setTimeout(() => {
      const targetNode = devices.find(d => d.ip === targetIp);
      
      if (!targetNode) {
        setPingLog(prev => [...prev, 'Request timed out.', 'Request timed out.', 'Request timed out.', 'Request timed out.']);
        setDiagnosticMsg({ text: 'DESTINATION HOST UNREACHABLE', status: 'error' });
        return;
      }

      const isLocal = isSameSubnet(sourceNode.ip, sourceNode.subnet, targetIp);
      let pathExists = false;

      if (isLocal) {
        pathExists = checkPhysicalPath(sourceNode.id, targetNode.id);
      } else {
        if (!sourceNode.gateway) {
          setPingLog(prev => [...prev, `Reply from ${sourceNode.ip}: Destination host unreachable.`]);
          setDiagnosticMsg({ text: 'NO GATEWAY CONFIGURED', status: 'error' });
          return;
        }

        const gatewayNode = devices.find(d => d.ip === sourceNode.gateway && d.type === 'router');
        
        if (!gatewayNode) {
          setPingLog(prev => [...prev, `Reply from ${sourceNode.ip}: Destination host unreachable.`]);
          setDiagnosticMsg({ text: 'GATEWAY UNREACHABLE', status: 'error' });
          return;
        }

        const canReachGateway = checkPhysicalPath(sourceNode.id, gatewayNode.id);
        if (!canReachGateway) {
          setPingLog(prev => [...prev, 'Request timed out. (Gateway unreachable)']);
          setDiagnosticMsg({ text: 'GATEWAY LINK DOWN', status: 'error' });
          return;
        }

        if (checkPhysicalPath(gatewayNode.id, targetNode.id)) {
          pathExists = true;
        }
      }

      if (pathExists) {
        setPingLog(prev => [
          ...prev, 
          `Reply from ${targetIp}: bytes=32 time<1ms TTL=128`,
          `Reply from ${targetIp}: bytes=32 time<1ms TTL=128`,
          `Reply from ${targetIp}: bytes=32 time<1ms TTL=128`,
          `Reply from ${targetIp}: bytes=32 time<1ms TTL=128`
        ]);
        setDiagnosticMsg({ text: 'ICMP ECHO REPLY RECEIVED', status: 'success' });
      } else {
        setPingLog(prev => [...prev, 'Request timed out.', 'Request timed out.', 'Request timed out.', 'Request timed out.']);
        setDiagnosticMsg({ text: 'PHYSICAL LINK SEVERED', status: 'error' });
      }
    }, 1500); 
  }, [devices, checkPhysicalPath]); 

  // --- 4. EXPOSED ACTIONS ---
  const handleDeviceClick = useCallback((id) => {
    if (activeTool === 'cursor') {
      const device = devices.find(d => d.id === id);
      setSelectedConfigDevice(device);
      return;
    }

    if (activeTool === 'ping') {
      if (!pingSource) {
        setPingSource(id);
        setDiagnosticMsg({ text: `PING SOURCE SET: ${id.toUpperCase()}`, status: 'idle' });
      } else {
        if (pingSource === id) {
          setPingSource(null);
          setDiagnosticMsg({ text: 'PING CANCELLED', status: 'idle' });
          return;
        }
        const sourceNode = devices.find(d => d.id === pingSource);
        const targetNode = devices.find(d => d.id === id);
        
        setPingLog([]); 
        executePing(sourceNode, targetNode?.ip);
        setPingSource(null);
      }
    }
  }, [activeTool, pingSource, devices, executePing]); 

  const startLink = useCallback((deviceId, portId) => {
    setLinkingDevice({ id: deviceId, port: portId });
    setDiagnosticMsg({ text: `LINKING FROM ${deviceId.toUpperCase()} (${portId})...`, status: 'idle' });
  }, []);

  const completeLink = useCallback((targetId, targetPort) => {
    const newConnection = {
      id: `conn-${Date.now()}`,
      from: linkingDevice.id,
      fromPort: linkingDevice.port,
      to: targetId,
      toPort: targetPort,
      type: activeTool,
      status: 'active'
    };
    setConnections(prev => [...prev, newConnection]);
    setLinkingDevice(null);
    setDiagnosticMsg({ text: 'LINK ESTABLISHED', status: 'success' });
    setActiveTool('cursor');
  }, [linkingDevice, activeTool]);

  const cancelLink = useCallback(() => {
    setLinkingDevice(null);
    setDiagnosticMsg({ text: 'LINK CANCELLED', status: 'idle' });
  }, []);

  return {
    state: {
      devices,
      connections,
      activeTool,
      linkingDevice,
      pingSource,
      pingLog,
      diagnosticMsg,
      selectedConfigDevice
    },
    setters: {
      setActiveTool,
      setSelectedConfigDevice
    },
    actions: {
      addDevice,
      updateDevicePosition,
      handleDeviceClick,
      saveDeviceConfig,
      clearNetwork,
      startLink,
      completeLink,
      cancelLink,
      removeDevice,
      removeConnection
    }
  };
};