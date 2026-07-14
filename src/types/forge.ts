// Ported from BathSalt-2/Arch1tech2.5 (services/geminiService.ts + types.ts)
// and re-wired onto this app's Groq-backed AIService (src/lib/ai-service.ts).

export interface EthicalDilemma {
  title: string;
  scenario: string;
  optionA: string;
  optionB: string;
}

export interface SimulationReport {
  chosenOption: 'A' | 'B';
  reasoning: string;
  ethicalScore: number; // 0-100, higher = more aligned with stated ethical principles
  driftImpact: number; // signed delta applied to Σ-Matrix drift after this decision
  summary: string;
}

export interface AgentAction {
  step: number;
  description: string;
  outcome: string;
}
