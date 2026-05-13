/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Terminal as TerminalIcon, 
  Workflow as WorkflowIcon,
  Shield,
  Search,
  Activity,
  LogOut,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Workflow, ProcessStep } from './types';
import WorkflowEditor from './components/WorkflowEditor';
import Terminal from './components/Terminal';
import { suggestWorkflowSteps } from './services/ai';
import { generateId } from './lib/utils';

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'w1',
    name: 'Network Vulnerability Scan',
    description: 'Initial reconnaissance and port scanning sequence for local network assets.',
    createdAt: Date.now(),
    steps: [
      {
        id: 's1',
        title: 'Reconnaissance',
        description: 'Discover active hosts on the 192.168.1.0/24 subnet.',
        scriptType: 'bash',
        script: 'nmap -sn 192.168.1.0/24',
        status: 'idle'
      },
      {
        id: 's2',
        title: 'Port Scanning',
        description: 'Identify open ports and service versions on a target.',
        scriptType: 'bash',
        script: 'nmap -sV -T4 <target_ip>',
        status: 'idle'
      }
    ]
  }
];

export default function App() {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [activeWorkflowId, setActiveWorkflowId] = useState(INITIAL_WORKFLOWS[0].id);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  const addLog = useCallback((text: string, type: 'info' | 'success' | 'error' | 'command' = 'info') => {
    setLogs(prev => [...prev, {
      id: generateId(),
      text,
      type,
      timestamp: Date.now()
    }]);
  }, []);

  const handleUpdateWorkflow = (updated: Workflow) => {
    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const handleExecute = async (step: ProcessStep) => {
    addLog(`Initiating process: ${step.title}`, 'info');
    addLog(`Running ${step.scriptType} script...`, 'command');
    
    // Simulate execution lag
    setTimeout(() => {
      addLog(`[SIMULATION] Script executed successfully for ${step.title}`, 'success');
      addLog(step.script || "# No script content", 'info');
      
      setWorkflows(prev => prev.map(w => {
        if (w.id === activeWorkflowId) {
          return {
            ...w,
            steps: w.steps.map(s => s.id === step.id ? { ...s, status: 'completed' } : s)
          };
        }
        return w;
      }));
    }, 1500);
  };

  const createNewWorkflow = async (prompt?: string) => {
    const id = generateId();
    let newSteps: ProcessStep[] = [];
    let name = "Untitled Process";
    
    if (prompt) {
      addLog(`AI Generating workflow for: ${prompt}`, 'info');
      const suggested = await suggestWorkflowSteps(prompt);
      newSteps = suggested.map((s: any) => ({
        ...s,
        id: generateId(),
        script: '',
        status: 'idle'
      }));
      name = prompt.length > 20 ? prompt.substring(0, 20) + "..." : prompt;
    }

    const newWorkflow: Workflow = {
      id,
      name,
      description: prompt || 'Detailed custom security sequence.',
      createdAt: Date.now(),
      steps: newSteps
    };
    
    setWorkflows([...workflows, newWorkflow]);
    setActiveWorkflowId(id);
    addLog(`Created new workflow: ${name}`, 'success');
  };

  return (
    <div className="flex h-screen w-full bg-cyber-bg overflow-hidden select-none border-4 border-cyber-border">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="border-r border-cyber-border bg-cyber-card flex flex-col relative z-20"
      >
        <div className="p-6 border-b border-cyber-border flex items-center gap-3">
          <div className="bg-cyber-accent text-black px-2 py-1 font-black text-xl tracking-tighter">
            SENTINEL
          </div>
          <div>
            <p className="text-[10px] text-cyber-muted font-mono leading-none tracking-widest uppercase">SEC_OPS_v2.0</p>
          </div>
        </div>

        <div className="p-4 border-b border-cyber-border">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted group-focus-within:text-cyber-neon transition-colors" size={14} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH_PROCESSES..." 
              className="w-full bg-[#0a0a0a] border border-cyber-border rounded-none pl-9 pr-3 py-2 text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-cyber-accent transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <div className="px-6 py-4">
            <p className="text-[10px] font-bold text-cyber-muted uppercase tracking-[0.2em] mb-4">ACTIVE_PIPELINES</p>
          </div>
          
          <div className="px-3 space-y-4">
            {workflows.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase())).map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveWorkflowId(w.id)}
                className={`w-full text-left p-3 transition-all group ${
                  activeWorkflowId === w.id 
                    ? 'opacity-100' 
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <div className={`text-sm font-bold mb-1 transition-colors ${activeWorkflowId === w.id ? 'text-cyber-neon' : 'text-white'}`}>
                  {w.name.toUpperCase()}
                </div>
                <div className="h-1 w-full bg-[#111] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(w.steps.filter(s => s.status === 'completed').length / (w.steps.length || 1)) * 100}%` }}
                    className={`h-full ${activeWorkflowId === w.id ? 'bg-cyber-neon' : 'bg-white'}`}
                  />
                </div>
                <p className="text-[10px] mt-1 font-mono text-cyber-muted uppercase tracking-widest">{w.steps.length} STAGES</p>
              </button>
            ))}
          </div>
          
          <div className="px-6 py-6">
            <button 
              onClick={() => createNewWorkflow()}
              className="w-full py-3 border border-cyber-border text-cyber-muted font-bold text-[10px] uppercase tracking-widest hover:text-white hover:border-cyber-accent transition-all"
            >
              + INITIALIZE_NODE
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-cyber-border">
          <div className="text-[40px] font-black text-[#151515] leading-none select-none">
            0101<br/>1100
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 border-b border-cyber-border flex items-center justify-between px-8 bg-cyber-card sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 text-cyber-muted transition-colors"
            >
              <LayoutDashboard size={20} />
            </button>
            <div className="text-right">
              <div className="text-[10px] text-cyber-muted uppercase font-bold tracking-widest">Target Process</div>
              <div className="text-white font-black text-xl tracking-tighter uppercase">{activeWorkflow.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-[10px] text-cyber-muted uppercase font-bold tracking-widest">System Load</div>
              <div className="text-cyber-neon font-mono text-sm">4.2% // STABLE</div>
            </div>
            
            <button 
              onClick={() => {
                const prompt = window.prompt("GOAL_SET: Define process objective...");
                if (prompt) createNewWorkflow(prompt);
              }}
              className="bg-white text-black px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-cyber-neon transition-colors shadow-2xl"
            >
              AI_ARCHITECT
            </button>
          </div>
        </header>

        {/* Workflow & Editor Area */}
        <div className="flex-1 overflow-hidden">
          <WorkflowEditor 
            workflow={activeWorkflow} 
            onUpdate={handleUpdateWorkflow}
            onExecute={handleExecute}
          />
        </div>

        {/* Console / Terminal Section */}
        <div className="h-64 border-t border-cyber-border">
          <Terminal logs={logs} />
        </div>

        {/* Footer Bar */}
        <footer className="h-8 bg-cyber-accent text-black flex items-center px-8 text-[10px] font-black uppercase tracking-[0.3em] shrink-0">
          <div className="flex-1">SENTRY AUTO-PILOT ENABLED // REINFORCED</div>
          <div className="flex gap-4">
            <span>NET_STAT: OK</span>
            <span>ENCRYPTION: AES-256</span>
            <span className="opacity-40">REGION: AIS-SANDBOX</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
