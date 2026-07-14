// Ported from BathSalt-2/arch1tech-platform's real (Groq-backed) WorkflowBuilder.tsx
// text-to-workflow generator, rebuilt on this app's shared ai-service.ts instead
// of a bespoke localStorage-keyed fetch.
import { aiService } from './ai-service';

export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'llm' | 'agent' | 'delay';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  config: Record<string, unknown>;
}

export interface WorkflowConnection {
  from: string;
  to: string;
  condition?: string;
}

export interface GeneratedWorkflow {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

const WORKFLOW_SYSTEM_PROMPT = `You are a workflow architect. Generate a workflow specification as JSON with these fields:
- name (string): Clear workflow name
- description (string): What it does
- nodes (array): Each node has: id (string), type (trigger|action|condition|llm|agent|delay), label (string), config (object with relevant settings like prompt, condition, delayMs, etc)
- connections (array): Each has: from (node id), to (node id), condition (optional, for branching)

Example node configs:
- trigger: { "eventType": "schedule|webhook|manual", "schedule": "daily" }
- action: { "actionType": "sendEmail|apiCall|saveData", "details": "..." }
- condition: { "expression": "value > 100", "trueLabel": "Yes", "falseLabel": "No" }
- llm: { "prompt": "Analyze this...", "model": "gpt-4o" }
- agent: { "agentName": "Support Agent", "task": "..." }
- delay: { "delayMs": 5000, "reason": "Wait for processing" }

Respond ONLY with a JSON object matching: {"name":string,"description":string,"nodes":[...],"connections":[...]}`;

export async function generateWorkflow(description: string): Promise<GeneratedWorkflow> {
  const parsed = await aiService.chatJSON<Partial<GeneratedWorkflow>>(
    [{ role: 'user', content: description }],
    WORKFLOW_SYSTEM_PROMPT
  );
  return {
    name: parsed.name || 'New Workflow',
    description: parsed.description || description,
    nodes: parsed.nodes || [],
    connections: parsed.connections || [],
  };
}
