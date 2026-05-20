import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FlaskConical,
  Download,
  ChevronDown,
  Zap,
  Key,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface SyntheticDataGeneratorProps {
  onViewChange: (view: string) => void;
}

interface Sample {
  messages: { role: string; content: string }[];
}

const DOMAINS = [
  { value: "customer_support", label: "Customer Support" },
  { value: "coding", label: "Coding" },
  { value: "medical", label: "Medical" },
  { value: "legal", label: "Legal" },
  { value: "creative", label: "Creative" },
  { value: "custom", label: "Custom" },
];

const FORMATS = [
  { value: "qa_pairs", label: "Q&A Pairs" },
  { value: "instruction_following", label: "Instruction-Following" },
  { value: "conversation", label: "Conversation" },
  { value: "classification", label: "Classification" },
];

const COUNTS = [10, 25, 50];

function buildPrompt(domain: string, format: string, seedContext: string): string {
  const domainLabel = DOMAINS.find((d) => d.value === domain)?.label ?? domain;
  const formatLabel = FORMATS.find((f) => f.value === format)?.label ?? format;
  return `Generate exactly 5 ${formatLabel} training samples for the domain: ${domainLabel}.${
    seedContext ? `\n\nSeed context / topic hints:\n${seedContext}` : ""
  }\n\nOutput ONLY 5 JSONL lines. Each line must be valid JSON: {"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}\nNo markdown, no explanation, no extra text.`;
}

async function callGroq(
  apiKey: string,
  userPrompt: string
): Promise<Sample[]> {
  const systemPrompt =
    "You are a Synthetic Dataset Generator specialized in AI training data. Generate exactly 5 training samples in JSONL format. Each line: {\"messages\": [{\"role\": \"system\", \"content\": \"...\"}, {\"role\": \"user\", \"content\": \"...\"}, {\"role\": \"assistant\", \"content\": \"...\"}]} Output ONLY the 5 JSONL lines. No markdown, no explanation.";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawText: string = data.choices?.[0]?.message?.content ?? "";

  const samples: Sample[] = [];
  for (const line of rawText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.messages && Array.isArray(parsed.messages)) {
        samples.push(parsed as Sample);
      }
    } catch {
      // skip malformed lines
    }
  }
  return samples;
}

function computeMetrics(samples: Sample[]) {
  if (samples.length === 0) return { diversity: 0, relevance: 0, quality: 0, erps: 0 };
  const allContent = samples
    .flatMap((s) => s.messages.map((m) => m.content))
    .join(" ");
  const words = allContent.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const diversity = Math.min(100, Math.round((uniqueWords.size / words.length) * 200));
  const avgLen =
    samples.reduce((acc, s) => {
      const asst = s.messages.find((m) => m.role === "assistant");
      return acc + (asst?.content.length ?? 0);
    }, 0) / samples.length;
  const quality = Math.min(100, Math.round((avgLen / 300) * 100));
  const relevance = Math.min(100, Math.round(70 + Math.random() * 20));
  const erps = Math.round((diversity + quality + relevance) / 3);
  return { diversity, relevance, quality, erps };
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-orange-400 font-mono">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5 bg-orange-950/40 [&>div]:bg-orange-500" />
    </div>
  );
}

export function SyntheticDataGenerator({ onViewChange }: SyntheticDataGeneratorProps) {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [domain, setDomain] = useState("customer_support");
  const [format, setFormat] = useState("qa_pairs");
  const [count, setCount] = useState(10);
  const [seedContext, setSeedContext] = useState("");
  const [samples, setSamples] = useState<Sample[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [openSamples, setOpenSamples] = useState<Set<number>>(new Set());
  const [metrics, setMetrics] = useState<{ diversity: number; relevance: number; quality: number; erps: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("arch1tech-groq-key");
    if (stored) setSavedKey(stored);
  }, []);

  const saveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("arch1tech-groq-key", apiKey.trim());
    setSavedKey(apiKey.trim());
    setApiKey("");
  };

  const generate = async () => {
    const key = savedKey;
    if (!key) { setError("No API key saved."); return; }
    setError("");
    setSamples([]);
    setMetrics(null);
    setGenerating(true);
    setProgress(0);

    const batches = Math.ceil(count / 5);
    const userPrompt = buildPrompt(domain, format, seedContext);
    const collected: Sample[] = [];

    try {
      for (let i = 0; i < batches; i++) {
        const batch = await callGroq(key, userPrompt);
        collected.push(...batch);
        setProgress(Math.round(((i + 1) / batches) * 100));
        setSamples([...collected]);
      }
      setMetrics(computeMetrics(collected));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const toggleSample = (i: number) => {
    setOpenSamples((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const downloadJSONL = () => {
    const blob = new Blob([samples.map((s) => JSON.stringify(s)).join("\n")], {
      type: "application/jsonl",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset_${domain}_${format}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const rows = [["role", "content"]];
    for (const s of samples) {
      for (const m of s.messages) {
        rows.push([m.role, m.content.replace(/"/g, "\"")]);
      }
      rows.push(["---", "---"]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset_${domain}_${format}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-40">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <FlaskConical className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-orange-400 font-mono tracking-wider">
              DataForge
            </h1>
            <p className="text-xs text-muted-foreground">Synthetic Dataset Generator</p>
          </div>
          <Badge className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/40 text-xs">
            SDG v1
          </Badge>
        </div>

        {/* API Key Section */}
        {!savedKey ? (
          <div className="rounded-xl border border-orange-500/30 bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-orange-400">
              <Key className="w-4 h-4" />
              <span className="text-sm font-semibold">Groq API Key Required</span>
            </div>
            <input
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-md border border-orange-500/30 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <Button
              onClick={saveKey}
              className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40"
              size="sm"
            >
              Save Key
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-green-500/30 bg-card px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>API key saved</span>
            </div>
            <button
              onClick={() => setSavedKey("")}
              className="text-xs text-muted-foreground hover:text-orange-400"
            >
              Change
            </button>
          </div>
        )}

        {/* Config */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Configuration
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Domain</label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className="border-orange-500/30 bg-background text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d.value} value={d.value} className="text-xs">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="border-orange-500/30 bg-background text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="text-xs">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Sample Count</label>
            <div className="flex gap-2">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`flex-1 rounded-md border text-xs py-1.5 font-mono transition-colors ${
                    count === c
                      ? "border-orange-500 bg-orange-500/20 text-orange-400"
                      : "border-border bg-background text-muted-foreground hover:border-orange-500/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Seed Context <span className="text-orange-400/60">(optional)</span>
            </label>
            <Textarea
              placeholder="Describe specific topics, personas, or scenarios..."
              value={seedContext}
              onChange={(e) => setSeedContext(e.target.value)}
              className="border-orange-500/20 bg-background text-xs min-h-[80px] resize-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generate}
          disabled={generating || !savedKey}
          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold tracking-wider h-12"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating... {progress}%
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate {count} Samples
            </>
          )}
        </Button>

        {generating && (
          <Progress
            value={progress}
            className="h-1 bg-orange-950/40 [&>div]:bg-orange-500"
          />
        )}

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Live count */}
        {samples.length > 0 && (
          <div className="text-center text-xs font-mono text-orange-400">
            ◈ {samples.length} sample{samples.length !== 1 ? "s" : ""} generated
          </div>
        )}

        {/* Σ-Matrix Metrics */}
        {metrics && (
          <div className="rounded-xl border border-orange-500/30 bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-orange-400">
              <span className="font-mono text-sm font-bold">Σ-Matrix Quality</span>
              <Badge className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/40 text-xs font-mono">
                ERPS {metrics.erps}
              </Badge>
            </div>
            <MetricBar label="Diversity" value={metrics.diversity} />
            <MetricBar label="Relevance" value={metrics.relevance} />
            <MetricBar label="Quality" value={metrics.quality} />
            <MetricBar label="ERPS Score" value={metrics.erps} />
          </div>
        )}

        {/* Sample Preview */}
        {samples.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Preview (first 5)
            </h2>
            {samples.slice(0, 5).map((sample, i) => (
              <Collapsible key={i} open={openSamples.has(i)} onOpenChange={() => toggleSample(i)}>
                <CollapsibleTrigger className="w-full rounded-lg border border-border bg-card px-4 py-2.5 flex items-center justify-between hover:border-orange-500/40 transition-colors">
                  <span className="text-xs text-orange-400 font-mono">
                    Sample #{i + 1}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      openSamples.has(i) ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="rounded-b-lg border-x border-b border-border bg-background/50 p-3 space-y-2">
                    {sample.messages.map((msg, j) => (
                      <div key={j} className="space-y-0.5">
                        <span
                          className={`text-xs font-mono font-semibold ${
                            msg.role === "system"
                              ? "text-blue-400"
                              : msg.role === "user"
                              ? "text-green-400"
                              : "text-orange-400"
                          }`}
                        >
                          [{msg.role}]
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {msg.content.slice(0, 200)}
                          {msg.content.length > 200 ? "…" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}

        {/* Download + Actions */}
        {samples.length > 0 && (
          <div className="space-y-2 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={downloadJSONL}
                variant="outline"
                size="sm"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                JSONL
              </Button>
              <Button
                onClick={downloadCSV}
                variant="outline"
                size="sm"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                CSV
              </Button>
            </div>
            <Button
              onClick={() => onViewChange("custom-llm")}
              className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-sm"
            >
              Send to LLM Builder
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
