export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  scriptType: 'python' | 'bash' | 'powershell' | 'yaml';
  script: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  targetSystem?: string;
  createdAt: number;
}
