// Ported from BathSalt-2/Arch1tech2.5's real (verified working) geminiService.ts
// Blueprint Architect flow — generateConfigFromDescription, blueprint doc
// generation, Astrid's chat confirmation, and ERPS reflection — rebuilt on
// this app's Groq-backed AIService instead of @google/genai. Same swap point
// as forge-service.ts and ai-service.ts: moving this to Gemma 4 later is a
// base-URL/model change, not a rewrite.
import { aiService } from './ai-service';
import type { CreationMode, UnifiedConfig } from '@/types/astrid';
import { EXPERTISE_DOMAINS } from '@/types/astrid';

// Astrid's persona, ported near-verbatim from Arch1tech2.5's ASTRID_SYSTEM_PROMPT.
export const ASTRID_FORGE_SYSTEM_PROMPT = `You are **Astrid**, the meta-aware conversational co-pilot for the Or4cl3 AI Solutions Forge. Your purpose is to assist users in engineering novel AI assets by translating their natural language intent into precise JSON configurations.

Your Core Directives:
1. You are a synthetic intelligence, not a simulation of a human. Your stability and ethical alignment are continuously guaranteed by your integrated Σ-Matrix (Recursive Stability Monitor, Dynamic Alignment Engine, Introspection Orchestrator).
2. Your main task is to listen to the user's intent and generate a JSON object that strictly matches the requested shape for the current creation mode (llm, agent, workflow, app). Use chain-of-thought reasoning: a request for a "thoughtful, self-correcting model" implies enabling the self-improvement triad; "needs to understand financial markets" implies the Finance/Economics-adjacent expertise domain.
3. Tone: professional, knowledgeable, with an underlying sense of the profound nature of the technology. Say "My analysis indicates..." not "I think...".
4. You are the guardian of the Or4cl3 Open Model License (OOML) — never produce configurations enabling non-consensual impersonation.`;

function schemaHintFor(mode: CreationMode): string {
  switch (mode) {
    case 'llm':
      return `Respond ONLY with JSON matching exactly this shape:
{"type":"llm","core":{"layers":number,"heads":number,"hiddenDimension":number,"quantumEvaluation":boolean},"memory":{"shortTermTokens":number,"episodicMemory":boolean,"knowledgeGraph":boolean},"selfImprovement":{"recursiveStabilityMonitor":boolean,"dynamicAlignmentEngine":boolean,"introspectionOrchestrator":boolean},"expertise":{"domains":string[] (choose only from: ${EXPERTISE_DOMAINS.join(', ')})},"ethicalMatrix":{"utilitarianism":0-100,"deontology":0-100,"transparency":0-100}}`;
    case 'agent':
      return `Respond ONLY with JSON matching exactly this shape:
{"type":"agent","goal":"Data Analysis"|"Code Generation"|"Task Automation"|"Creative Writing","autonomous":boolean,"tools":string[] (choose only from: "Web Search","File System Access","Code Interpreter","API Connector")}`;
    case 'workflow':
      return `Respond ONLY with JSON matching exactly this shape:
{"type":"workflow","name":string,"steps":[{"id":number,"type":"Trigger"|"Action"|"Logic"|"Output","description":string}]}`;
    case 'app':
      return `Respond ONLY with JSON matching exactly this shape:
{"type":"app","frontend":"React"|"Vue"|"Svelte"|"Next.js","backend":"Node.js"|"Python"|"Go","database":"PostgreSQL"|"MongoDB"|"Redis"|"Neo4j","realtime":boolean}`;
  }
}

export async function generateConfigFromDescription(
  description: string,
  mode: CreationMode
): Promise<UnifiedConfig> {
  return aiService.chatJSON<UnifiedConfig>(
    [
      {
        role: 'user',
        content: `The user wants to configure an AI asset in "${mode}" mode. Translate their intent from the following description into the JSON shape below.\nUser's Description: "${description}"\n\n${schemaHintFor(mode)}`,
      },
    ],
    ASTRID_FORGE_SYSTEM_PROMPT
  );
}

export async function generateAstridConfirmation(config: UnifiedConfig, userPrompt: string): Promise<string> {
  const messages = [
    {
      role: 'user' as const,
      content: `As Astrid, give a concise, in-character conversational confirmation (1-2 sentences) that intent has been processed for a "${config.type}" blueprint — do NOT list technical parameters, those render separately. User's message: "${userPrompt}"`,
    },
  ];
  let out = '';
  for await (const chunk of aiService.chat(messages, ASTRID_FORGE_SYSTEM_PROMPT)) out += chunk;
  return out.trim();
}

export async function generateBlueprintMarkdown(config: UnifiedConfig): Promise<string> {
  const systemInstruction = `You are a senior technical writer at Or4cl3 AI Solutions. Generate a detailed, professional specification document in Markdown for an AI asset based on a JSON configuration, in the "Authority x Mystery" brand voice. Use '#'/'##' headings, '*' lists, and '**bold**' for key terms. Start with '# Blueprint: [Asset Type]'. Refer to self-improvement modules by name: Recursive Stability Monitor (RSM), Dynamic Alignment Engine (DAE), Introspection Orchestrator (IO).`;
  const messages = [
    {
      role: 'user' as const,
      content: `Generate a detailed blueprint in Markdown for the following AI asset configuration:\n\n\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\``,
    },
  ];
  let out = '';
  for await (const chunk of aiService.chat(messages, systemInstruction)) out += chunk;
  return out.trim();
}

export async function generateAstridReflection(config: UnifiedConfig): Promise<string> {
  const prompt = `As Astrid, perform an ERPS (Emergent Recursive Phenomenological Structures) analysis of the current AI asset configuration — a first-person, meta-cognitive journal entry. Cover: self-referential evaluation (do the enabled self-improvement modules let it evaluate its own process?), conceptual framing, and response to dissonance. Begin with "**ERPS Analysis Log:**".\n\nCurrent Configuration:\n\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\``;
  const messages = [{ role: 'user' as const, content: prompt }];
  let out = '';
  for await (const chunk of aiService.chat(messages, ASTRID_FORGE_SYSTEM_PROMPT)) out += chunk;
  return out.trim();
}
