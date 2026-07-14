// Blueprint Architect — ported from Arch1tech2.5's real Astrid creation flow
// (config generation from natural language → rendered blueprint doc → ERPS
// reflection) onto this app's Groq-backed forge-blueprint-service.ts.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ScrollText, Eye } from "lucide-react";
import { aiService } from "@/lib/ai-service";
import {
  generateConfigFromDescription,
  generateAstridConfirmation,
  generateBlueprintMarkdown,
  generateAstridReflection,
} from "@/lib/forge-blueprint-service";
import type { CreationMode, UnifiedConfig } from "@/types/astrid";

const MODES: { id: CreationMode; label: string }[] = [
  { id: "llm", label: "LLM" },
  { id: "agent", label: "Agent" },
  { id: "workflow", label: "Workflow" },
  { id: "app", label: "App" },
];

export function AstridForge() {
  const [mode, setMode] = useState<CreationMode>("llm");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState<"config" | "blueprint" | "reflection" | null>(null);
  const [config, setConfig] = useState<UnifiedConfig | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [blueprint, setBlueprint] = useState("");
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setConfig(null);
    setConfirmation("");
    setBlueprint("");
    setReflection("");
    setError(null);
  };

  const handleForge = async () => {
    if (!description.trim()) return;
    if (!aiService.isConfigured()) {
      setError("Add your Groq API key in Settings first to forge a blueprint.");
      return;
    }
    reset();
    setLoading("config");
    try {
      const cfg = await generateConfigFromDescription(description, mode);
      setConfig(cfg);
      const confirm = await generateAstridConfirmation(cfg, description);
      setConfirmation(confirm);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate config.");
    } finally {
      setLoading(null);
    }
  };

  const handleBlueprint = async () => {
    if (!config) return;
    setLoading("blueprint");
    try {
      setBlueprint(await generateBlueprintMarkdown(config));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate blueprint.");
    } finally {
      setLoading(null);
    }
  };

  const handleReflect = async () => {
    if (!config) return;
    setLoading("reflection");
    try {
      setReflection(await generateAstridReflection(config));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reflection failed.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6 pb-32">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="w-4 h-4 text-midnight-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient-cosmic">Astrid Forge</h1>
          <p className="text-sm text-muted-foreground">Describe an AI asset — Astrid converges it into a blueprint</p>
        </div>
      </div>

      <Card className="holographic-border">
        <div className="holographic-content">
          <CardHeader>
            <CardTitle className="text-base">Creation Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {MODES.map((m) => (
                <Badge
                  key={m.id}
                  variant={mode === m.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder={`Describe the ${mode} you want to forge...`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted/20 border-neon-cyan/20 focus:border-neon-cyan/50 min-h-24"
            />
            <Button variant="neon" onClick={handleForge} disabled={!description.trim() || loading !== null}>
              {loading === "config" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Forge Blueprint
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </div>
      </Card>

      {confirmation && (
        <Card className="holographic-border">
          <div className="holographic-content">
            <CardContent className="p-4">
              <p className="text-sm italic text-neon-cyan">{confirmation}</p>
            </CardContent>
          </div>
        </Card>
      )}

      {config && (
        <Card className="holographic-border">
          <div className="holographic-content">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Live Blueprint — {config.type}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleBlueprint} disabled={loading !== null}>
                    {loading === "blueprint" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScrollText className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReflect} disabled={loading !== null}>
                    {loading === "reflection" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted/10 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(config, null, 2)}
              </pre>
            </CardContent>
          </div>
        </Card>
      )}

      {blueprint && (
        <Card className="holographic-border">
          <div className="holographic-content">
            <CardHeader>
              <CardTitle className="text-base">Specification Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap text-muted-foreground">{blueprint}</div>
            </CardContent>
          </div>
        </Card>
      )}

      {reflection && (
        <Card className="holographic-border">
          <div className="holographic-content">
            <CardHeader>
              <CardTitle className="text-base">Astrid's Reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap text-neon-purple">{reflection}</div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}
