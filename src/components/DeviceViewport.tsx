import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Camera, Maximize2, Clock } from 'lucide-react';
interface DeviceViewportProps {
  deviceId: string;
}
const VIEWPORT_CONTENTS = ['Ad Loop: Summer Promo', 'Weather: Sunny 24°C', 'System Health: OK'];
export function DeviceViewport({ deviceId }: DeviceViewportProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [contentIndex, setContentIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const loop = setInterval(() => {
      setContentIndex(prev => (prev + 1) % VIEWPORT_CONTENTS.length);
    }, 5000);
    return () => {
      clearInterval(timer);
      clearInterval(loop);
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl group"
    >
      {/* Background Simulation Grid */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />
      {/* Occasional Glitch Overlay */}
      <motion.div
        animate={{
          opacity: [0, 0, 0.05, 0, 0.1, 0],
          x: [0, 0, 2, -2, 0, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          times: [0, 0.8, 0.82, 0.84, 0.86, 1]
        }}
        className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none"
      />
      {/* Mock Signage Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-slate-800/50 rounded-lg border border-white/5 flex flex-col overflow-hidden shadow-inner backdrop-blur-sm">
          <div className="h-8 bg-white/5 border-b border-white/5 px-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-2.5 w-2.5 text-slate-500" />
              <span className="text-[8px] font-mono text-slate-500">
                {currentTime.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <Zap className="h-8 w-8 text-blue-500" />
            </motion.div>
            <div className="h-8 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={contentIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider"
                >
                  {VIEWPORT_CONTENTS[contentIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Fleet Node Operational</h4>
              <p className="text-[10px] text-slate-500 font-mono">NODE_ID: {deviceId.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Scanline Effect */}
      <motion.div
        animate={{ y: ["-100%", "1000%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-2 bg-blue-500/5 blur-md pointer-events-none"
      />
      {/* Overlays */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="flex items-center gap-2 px-2 py-1 bg-rose-600/20 border border-rose-500/30 rounded backdrop-blur-md">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]"
          />
          <span className="text-[9px] font-bold text-rose-500 tracking-wider">LIVE FEED</span>
        </div>
        <div className="px-2 py-1 bg-black/40 border border-white/10 rounded backdrop-blur-md text-[9px] font-mono text-white">
          1920 × 1080 @ 60 FPS
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg border border-white/10 transition-colors shadow-lg">
          <Camera className="h-4 w-4" />
        </button>
        <button className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg border border-white/10 transition-colors shadow-lg">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />
    </motion.div>
  );
}