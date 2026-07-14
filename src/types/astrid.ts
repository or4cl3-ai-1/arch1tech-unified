// Ported from BathSalt-2/Arch1tech2.5's types.ts (Blueprint Architect types),
// trimmed to what forge-blueprint-service.ts / AstridForge.tsx actually use.

export type CreationMode = 'llm' | 'agent' | 'workflow' | 'app';

export interface CoreArchitecture {
  layers: number;
  heads: number;
  hiddenDimension: number;
  quantumEvaluation: boolean;
}
export interface MemoryContext {
  shortTermTokens: number;
  episodicMemory: boolean;
  knowledgeGraph: boolean;
}
export interface SelfImprovement {
  recursiveStabilityMonitor: boolean;
  dynamicAlignmentEngine: boolean;
  introspectionOrchestrator: boolean;
}
export interface Expertise {
  domains: string[];
}
export interface EthicalMatrix {
  utilitarianism: number; // 0-100
  deontology: number; // 0-100
  transparency: number; // 0-100
}
export interface ModelConfig {
  type: 'llm';
  core: CoreArchitecture;
  memory: MemoryContext;
  selfImprovement: SelfImprovement;
  expertise: Expertise;
  ethicalMatrix: EthicalMatrix;
}

export type AgentGoal = 'Data Analysis' | 'Code Generation' | 'Task Automation' | 'Creative Writing';
export type AgentTool = 'Web Search' | 'File System Access' | 'Code Interpreter' | 'API Connector';
export interface AgentConfig {
  type: 'agent';
  goal: AgentGoal;
  autonomous: boolean;
  tools: AgentTool[];
}

export interface WorkflowStep {
  id: number;
  type: 'Trigger' | 'Action' | 'Logic' | 'Output';
  description: string;
}
export interface WorkflowConfig {
  type: 'workflow';
  name: string;
  steps: WorkflowStep[];
}

export type FrontendFramework = 'React' | 'Vue' | 'Svelte' | 'Next.js';
export type BackendFramework = 'Node.js' | 'Python' | 'Go';
export type DatabaseType = 'PostgreSQL' | 'MongoDB' | 'Redis' | 'Neo4j';
export interface AppConfig {
  type: 'app';
  frontend: FrontendFramework;
  backend: BackendFramework;
  database: DatabaseType;
  realtime: boolean;
}

export type UnifiedConfig = ModelConfig | AgentConfig | WorkflowConfig | AppConfig;

// Trimmed from Arch1tech2.5's constants.tsx DOMAINS (icons dropped — not needed here).
export const EXPERTISE_DOMAINS = [
  'Computer Science',
  'AI / ML',
  'Neuroscience / Psychology',
  'Music Theory / Composition',
  'Quantum Physics / Advanced Math',
  'Philosophy / Ethics',
] as const;
