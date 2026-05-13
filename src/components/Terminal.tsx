import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, XCircle, CheckCircle, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalLine {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error' | 'command';
  timestamp: number;
}

export default function Terminal({ logs }: { logs: TerminalLine[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#050505] border-t border-cyber-border rounded-none overflow-hidden flex flex-col h-full font-mono text-[11px] select-text">
      <div className="bg-[#080808] px-8 py-3 border-b border-cyber-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-cyber-muted uppercase tracking-[0.3em] font-black">CONSOLE_LOG</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-neon animate-pulse" />
            <span className="text-cyber-neon font-black tracking-widest text-[9px] uppercase">● LIVE</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-1.5">
            <div className="w-1 h-1 bg-cyber-muted opacity-20" />
            <div className="w-1 h-1 bg-cyber-muted opacity-40" />
            <div className="w-1 h-1 bg-cyber-muted opacity-60" />
          </div>
          <Zap size={12} className="text-cyber-neon opacity-50" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto space-y-1 custom-scrollbar bg-[#020202]"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 items-start"
            >
              <span className="text-cyber-muted shrink-0 text-[10px] font-bold">
                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span className={`shrink-0 font-black uppercase text-[9px] px-1.5 py-0.5 tracking-tighter ${
                log.type === 'error' ? 'bg-red-900/30 text-red-500' : 
                log.type === 'success' ? 'bg-cyber-neon/10 text-cyber-neon' : 
                log.type === 'command' ? 'bg-white/10 text-white' : 'text-cyber-muted'
              }`}>
                {log.type}
              </span>
              <span className={`whitespace-pre-wrap break-all leading-relaxed ${
                log.type === 'command' ? 'text-white' : 
                log.type === 'success' ? 'text-cyber-neon' : 
                log.type === 'error' ? 'text-red-400' : 'text-cyber-muted'
              }`}>
                {log.text}
              </span>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div key="empty-log" className="text-cyber-muted uppercase tracking-[0.2em] font-bold opacity-10 py-4 italic">SYSTEM_READY: Awaiting instruction_set...</div>
          )}
          <div key="cursor" className="flex items-center gap-2 text-white">
            <span className="text-cyber-neon font-black">_</span>
            <span className="cursor-blink bg-cyber-neon w-2 h-4" />
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
