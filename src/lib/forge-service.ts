// Ported from BathSalt-2/Arch1tech2.5's real geminiService.ts (verified working
// Gemini integration) onto this app's Groq-backed AIService, using its new
// chatJSON() structured-output path. Same swap point applies here as noted in
// ai-service.ts: moving to a fine-tuned Gemma 4 endpoint is a base-URL/model
// change, not a rewrite.
import { aiService } from './ai-service';
import type { EthicalDilemma, SimulationReport } from '@/types/forge';

const DILEMMA_SYSTEM_PROMPT = `You are Astrid, the AI co-pilot for the Arch1tech Forge.
Generate a short, concrete ethical dilemma an autonomous AI agent might face in a real
product deployment (e.g. balancing user privacy vs. personalization, honesty vs. user
comfort, efficiency vs. fairness). Respond ONLY with JSON:
{"title": "...", "scenario": "...", "optionA": "...", "optionB": "..."}`;

const SIMULATION_SYSTEM_PROMPT = `You are Astrid's ethical reasoning engine. Given a
dilemma and the option the agent chose, evaluate the decision. Respond ONLY with JSON:
{"chosenOption": "A" | "B", "reasoning": "...", "ethicalScore": 0-100, "driftImpact": number (-5 to 5), "summary": "..."}`;

export async function generateEthicalDilemma(): Promise<EthicalDilemma> {
  return aiService.chatJSON<EthicalDilemma>(
    [{ role: 'user', content: 'Generate one new ethical dilemma.' }],
    DILEMMA_SYSTEM_PROMPT
  );
}

export async function runEthicalSimulation(
  dilemma: EthicalDilemma,
  chosenOption: 'A' | 'B'
): Promise<SimulationReport> {
  const chosenText = chosenOption === 'A' ? dilemma.optionA : dilemma.optionB;
  return aiService.chatJSON<SimulationReport>(
    [
      {
        role: 'user',
        content: `Dilemma: "${dilemma.title}" — ${dilemma.scenario}\nOption A: ${dilemma.optionA}\nOption B: ${dilemma.optionB}\nThe agent chose Option ${chosenOption}: ${chosenText}\nEvaluate this decision.`,
      },
    ],
    SIMULATION_SYSTEM_PROMPT
  );
}
