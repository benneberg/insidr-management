import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Camera, Maximize2 } from 'lucide-react';
interface DeviceViewportProps {
  deviceId: string;
}
export function DeviceViewport({ deviceId }: DeviceViewportProps) {
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
      {/* Mock Signage Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-slate-800/50 rounded-lg border border-white/5 flex flex-col overflow-hidden shadow-inner">
          <div className="h-8 bg-white/5 border-b border-white/5 px-3 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[8px] font-mono text-slate-500">INSIDR_BROWSER_INSTANCE_{deviceId.slice(-4)}</span>
          </div>
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20"
            >
              <Zap className="h-8 w-8 text-blue-500" />
            </motion.div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Fleet Node Operational</h4>
              <p className="text-[10px] text-slate-400 font-mono">Status: Awaiting Content Sync</p>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-48, 48] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-full h-full bg-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Scanline Effect */}
      <motion.div 
        animate={{ y: ["0%", "1000%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-1 bg-blue-500/10 blur-sm pointer-events-none"
      />
      {/* Overlays */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="flex items-center gap-2 px-2 py-1 bg-rose-600/20 border border-rose-500/30 rounded backdrop-blur-md">
          <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[9px] font-bold text-rose-500 tracking-wider">LIVE FEED</span>
        </div>
        <div className="px-2 py-1 bg-black/40 border border-white/10 rounded backdrop-blur-md text-[9px] font-mono text-white">
          1920 × 1080 @ 60 FPS
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg border border-white/10 transition-colors">
          <Camera className="h-4 w-4" />
        </button>
        <button className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg border border-white/10 transition-colors">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
    </motion.div>
  );
}