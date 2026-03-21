import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTelemetryStore } from '@/lib/store';
export function ConsentBanner() {
  const consentGiven = useTelemetryStore(s => s.consentGiven);
  const setConsent = useTelemetryStore(s => s.setConsent);
  if (consentGiven !== null) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
      >
        <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Telemetry Compliance</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Insidr collects anonymous telemetry (logs, performance metrics) to enable remote debugging.
                Enable protocol version 2.6 to continue.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold uppercase h-8"
              onClick={() => setConsent(true)}
            >
              <Check className="h-3 w-3 mr-2" /> ACCEPT_ALL
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-white/10 text-slate-400 text-[10px] font-bold uppercase h-8"
              onClick={() => setConsent(false)}
            >
              <X className="h-3 w-3 mr-2" /> RESTRICT
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}