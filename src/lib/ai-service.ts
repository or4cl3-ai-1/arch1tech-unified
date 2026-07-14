// LLM-powered AI Service.
// Backed by Groq today; both Groq and Google's Gemma 4 API speak the same
// OpenAI-compatible chat-completions shape, so swapping LLM_API_URL / LLM_MODEL
// (and the Authorization scheme) is the only change needed to move to a
// fine-tuned Gemma 4 endpoint later — see forge-service.ts for the structured
// JSON generation path this unlocks.
import { getGroqApiKey as readGroqApiKey, setGroqApiKey as writeGroqApiKey } from '@/lib/groq-key-storage';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  getGroqApiKey(): string | null {
    return readGroqApiKey();
  }

  setGroqApiKey(key: string): void {
    writeGroqApiKey(key);
  }

  isConfigured(): boolean {
    const key = this.getGroqApiKey();
    return !!key && key.trim().length > 0;
  }

  private async callGroq(messages: ChatMessage[], stream = false): Promise<string> {
    const key = this.getGroqApiKey();
    if (!key) {
      return 'No Groq API key configured. Please add your key in Settings to enable AI features. Get a free key at console.groq.com.';
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        stream,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  // Keyword-based sentiment analysis (no API needed)
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const lower = text.toLowerCase();
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'wonderful', 'fantastic', 'happy', 'love', 'like', 'best', 'helpful', 'nice', 'perfect', 'thanks', 'thank', 'please', 'yes', 'sure', 'absolutely'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'worst', 'broken', 'error', 'fail', 'problem', 'issue', 'bug', 'wrong', 'no', 'not', 'never', 'stop', 'crash', 'slow'];

    let score = 0;
    positiveWords.forEach(word => { if (lower.includes(word)) score++; });
    negativeWords.forEach(word => { if (lower.includes(word)) score--; });

    const total = positiveWords.length + negativeWords.length;
    const normalizedScore = score / Math.max(1, Math.abs(score));
    const confidence = 0.5 + Math.min(Math.abs(score) / 5, 0.4);

    if (score > 0) return { sentiment: 'positive', confidence };
    if (score < 0) return { sentiment: 'negative', confidence };
    return { sentiment: 'neutral', confidence: 0.5 };
  }

  async refinePrompt(prompt: string): Promise<string> {
    if (!this.isConfigured()) {
      return `To refine prompts with AI, please add your Groq API key in Settings. Original prompt: "${prompt}"`;
    }
    return this.callGroq([
      { role: 'system', content: 'You are an expert prompt engineer. Refine and expand the given prompt into a detailed, clear specification. Be concise but comprehensive.' },
      { role: 'user', content: `Refine this prompt into a detailed spec: ${prompt}` },
    ]);
  }

  async enhanceIdea(idea: string): Promise<string> {
    if (!this.isConfigured()) {
      return `To enhance ideas with AI, please add your Groq API key in Settings. Your idea: "${idea}"`;
    }
    return this.callGroq([
      { role: 'system', content: 'You are an AI product strategist. Enhance and expand AI project ideas with practical implementation details, potential use cases, and technical considerations.' },
      { role: 'user', content: `Enhance this AI project idea: ${idea}` },
    ]);
  }

  async generateCode(description: string, nodeType?: string): Promise<string> {
    if (!this.isConfigured()) {
      return `// To generate code with AI, please add your Groq API key in Settings.\n// Description: ${description}`;
    }
    const systemMsg = nodeType
      ? `You are an expert ${nodeType} developer. Generate clean, production-ready code for the described functionality. Return only the code, no explanations.`
      : 'You are an expert developer. Generate clean, production-ready code for the described functionality. Return only the code, no explanations.';
    return this.callGroq([
      { role: 'system', content: systemMsg },
      { role: 'user', content: `Generate code for: ${description}` },
    ]);
  }

  /**
   * Structured JSON generation — used by forge-service.ts for anything that
   * needs a parseable object back (ethical dilemmas, simulation reports,
   * agent configs) instead of free text. Groq's OpenAI-compatible endpoint
   * supports response_format: json_object on llama-3.3-70b-versatile.
   */
  async chatJSON<T>(messages: ChatMessage[], systemPrompt?: string): Promise<T> {
    const key = this.getGroqApiKey();
    if (!key) {
      throw new Error('No Groq API key configured. Add one in Settings to enable AI generation.');
    }

    const fullMessages: ChatMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages,
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: fullMessages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '{}';
    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error('Model returned malformed JSON — try again.');
    }
  }

  async *chat(messages: ChatMessage[], systemPrompt?: string): AsyncGenerator<string> {
    const key = this.getGroqApiKey();
    if (!key) {
      yield 'No Groq API key configured. Please add your key in Settings to enable AI chat. Get a free key at console.groq.com.';
      return;
    }

    const fullMessages: ChatMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages,
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      yield `API error ${response.status}. Please check your API key in Settings.`;
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.slice(6);
        if (jsonStr === '[DONE]') return;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // skip malformed
        }
      }
    }
  }
}

export const aiService = new AIService();
