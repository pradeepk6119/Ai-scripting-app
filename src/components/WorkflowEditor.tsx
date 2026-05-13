import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Trash2, 
  Settings2, 
  Code2, 
  Plus, 
  GripVertical,
  ChevronRight,
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { Workflow, ProcessStep } from '../types';
import { generateSecurityScript } from '../services/ai';
import { generateId } from '../lib/utils';

interface WorkflowEditorProps {
  workflow: Workflow;
  onUpdate: (workflow: Workflow) => void;
  onExecute: (step: ProcessStep) => void;
}

export default function WorkflowEditor({ workflow, onUpdate, onExecute }: WorkflowEditorProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const addStep = () => {
    const newStep: ProcessStep = {
      id: generateId(),
      title: 'NEW_SECURITY_TASK',
      description: 'Describe security objective...',
      scriptType: 'python',
      script: '',
      status: 'idle',
    };
    onUpdate({
      ...workflow,
      steps: [...workflow.steps, newStep]
    });
    setSelectedStepId(newStep.id);
  };

  const removeStep = (id: string) => {
    onUpdate({
      ...workflow,
      steps: workflow.steps.filter(s => s.id !== id)
    });
    if (selectedStepId === id) setSelectedStepId(null);
  };

  const updateStep = (id: string, updates: Partial<ProcessStep>) => {
    onUpdate({
      ...workflow,
      steps: workflow.steps.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const handleGenerateScript = async (step: ProcessStep) => {
    setIsGenerating(step.id);
    const script = await generateSecurityScript(step.description, step.title, step.scriptType);
    updateStep(step.id, { script });
    setIsGenerating(null);
  };

  const selectedStep = workflow.steps.find(s => s.id === selectedStepId);

  return (
    <div className="flex bg-cyber-bg h-full">
      {/* Steps List */}
      <div className="w-64 border-r border-cyber-border flex flex-col bg-[#080808]">
        <div className="p-6 flex items-center justify-between border-b border-cyber-border">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-cyber-muted font-bold">PIPELINE_STAGES</h3>
          <button 
            onClick={addStep}
            className="text-cyber-neon hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {workflow.steps.map((step, index) => (
            <motion.div
              layout
              key={step.id}
              onClick={() => setSelectedStepId(step.id)}
              className={`group cursor-pointer border-l-4 transition-all pb-2 ${
                selectedStepId === step.id 
                  ? 'border-cyber-neon' 
                  : 'border-transparent hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`text-xs font-bold tracking-tight uppercase ${selectedStepId === step.id ? 'text-cyber-neon' : 'text-white/80'}`}>
                  {step.title}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                  className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="h-[2px] w-full bg-[#111] overflow-hidden">
                <div className={`h-full transition-all duration-500 ${step.status === 'completed' ? 'w-full bg-cyber-neon' : 'w-0 bg-white'}`} />
              </div>
            </motion.div>
          ))}
          {workflow.steps.length === 0 && (
            <div className="text-center py-10 opacity-30">
              <p className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">No stages initialized.</p>
            </div>
          )}
        </div>

        <div className="p-6 mt-auto">
          <button 
            onClick={addStep}
            className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-cyber-neon transition-colors"
          >
            COMMIT_SCRIPT
          </button>
        </div>
      </div>

      {/* Step Detail / Editor */}
      <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute top-12 left-12 opacity-[0.03] text-[180px] font-black leading-none tracking-tighter select-none pointer-events-none uppercase">
          SECURE
        </div>

        <AnimatePresence mode="wait">
          {selectedStep ? (
            <motion.div 
              key={selectedStep.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full relative z-10"
            >
              <div className="p-12 pb-8">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <input 
                        value={selectedStep.title} 
                        onChange={(e) => updateStep(selectedStep.id, { title: e.target.value.toUpperCase() })}
                        className="bg-transparent text-5xl font-black tracking-tighter uppercase focus:outline-none w-full border-b-4 border-transparent focus:border-cyber-accent mb-4 text-white"
                        placeholder="PROTOCOL_NAME"
                      />
                      <textarea 
                        value={selectedStep.description} 
                        onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                        className="bg-transparent text-sm text-cyber-muted uppercase tracking-wide font-medium focus:outline-none w-full resize-none h-16 leading-relaxed max-w-xl"
                        placeholder="Define the security objective for this script engine..."
                      />
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <select
                        value={selectedStep.scriptType}
                        onChange={(e) => updateStep(selectedStep.id, { scriptType: e.target.value as any })}
                        className="bg-[#0a0a0a] border border-cyber-border rounded-none px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-cyber-accent outline-none text-white"
                      >
                        <option value="python">PYTHON_ENV</option>
                        <option value="bash">BASH_SHELL</option>
                        <option value="powershell">POWERSHELL</option>
                        <option value="yaml">YAML_CONFIG</option>
                      </select>
                      <button 
                        onClick={() => onExecute(selectedStep)}
                        className="flex items-center gap-3 bg-cyber-accent hover:bg-white text-black px-8 py-4 transition-all text-xs font-black tracking-[0.2em] uppercase"
                      >
                        <Play size={16} fill="currentColor" />
                        EXECUTE_LOCAL
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-12">
                    <div className="border-l-4 border-cyber-neon bg-[#0A0A0A] p-6">
                      <div className="text-[10px] uppercase tracking-widest text-[#666] mb-1 font-bold">Node Identity</div>
                      <div className="text-2xl font-black uppercase tracking-tight truncate">{selectedStep.id}</div>
                    </div>
                    <div className="border-l-4 border-white/20 bg-[#0A0A0A] p-6">
                      <div className="text-[10px] uppercase tracking-widest text-[#666] mb-1 font-bold">Confidence</div>
                      <div className="text-2xl font-black text-cyber-neon">99.2%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col mt-8 border-t border-cyber-border">
                <div className="bg-[#080808] px-8 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 opacity-60">
                    <Code2 size={14} className="text-cyber-neon" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] leading-none text-white">SOURCE_BUFFER</span>
                  </div>
                  <button 
                    onClick={() => handleGenerateScript(selectedStep)}
                    disabled={isGenerating === selectedStep.id}
                    className="text-[10px] font-black uppercase tracking-widest text-cyber-neon hover:text-white flex items-center gap-2"
                  >
                    {isGenerating === selectedStep.id ? <Sparkles size={12} className="animate-pulse" /> : <Sparkles size={12} />}
                    {isGenerating === selectedStep.id ? 'GENERATING...' : 'AI_REFACTOR'}
                  </button>
                </div>
                <textarea
                  value={selectedStep.script}
                  onChange={(e) => updateStep(selectedStep.id, { script: e.target.value })}
                  className="flex-1 w-full bg-[#030303] p-8 font-mono text-[13px] text-cyber-neon focus:outline-none resize-none custom-scrollbar leading-relaxed scroll-smooth"
                  spellCheck={false}
                  placeholder="# SENTINEL ENGINE AWAITING SOURCE INPUT..."
                />
              </div>
            </motion.div>
          ) : (
            <div key="empty-editor" className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-10">
              <div className="w-16 h-16 border-2 border-dashed border-cyber-border rounded-full flex items-center justify-center mb-6 opacity-20">
                <Settings2 size={32} />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">Awaiting Allocation</h2>
              <p className="text-xs uppercase tracking-widest text-cyber-muted font-bold">Select pipeline node to initialize interface.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
