// src/constants/networkData.js

export const INITIAL_WIRES = [
  { id: 'bl', color: 'bg-blue-500', label: 'B', name: 'Blue', striped: false, pair: 'blue' },
  { id: 'ow', color: 'bg-orange-300', label: 'O/W', name: 'Orange/White', striped: true, pair: 'orange' },
  { id: 'br', color: 'bg-amber-800', label: 'Br', name: 'Brown', striped: false, pair: 'brown' },
  { id: 'gw', color: 'bg-green-300', label: 'G/W', name: 'Green/White', striped: true, pair: 'green' },
  { id: 'g', color: 'bg-green-500', label: 'G', name: 'Green', striped: false, pair: 'green' },
  { id: 'brw', color: 'bg-amber-600', label: 'Br/W', name: 'Brown/White', striped: true, pair: 'brown' },
  { id: 'o', color: 'bg-orange-500', label: 'O', name: 'Orange', striped: false, pair: 'orange' },
  { id: 'blw', color: 'bg-blue-300', label: 'B/W', name: 'Blue/White', striped: true, pair: 'blue' },
];

export const STANDARDS = {
  T568A: ['gw', 'g', 'ow', 'bl', 'blw', 'o', 'brw', 'br'],
  T568B: ['ow', 'o', 'gw', 'bl', 'blw', 'g', 'brw', 'br']
};