// Ported from BathSalt-2/arch1tech-platform's real WorkflowBuilder.tsx (text-to-
// workflow generation, node CRUD, run tracking) onto this app's shadcn/ui design
// system and shared workflow-forge-service.ts, replacing @phosphor-icons with
// lucide-react and the bespoke Groq fetch with aiService.chatJSON.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Play,
  GitBranch,
  Clock,
  Zap,
  Trash2,
  Copy,
  Code,
  Workflow as WorkflowIcon,
  Loader2,
} from "lucide-react";
import { aiService } from "@/lib/ai-service";
import { generateWorkflow, type WorkflowNode, type WorkflowNodeType } from "@/lib/workflow-forge-service";

interface StoredWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  status: "active" | "draft" | "paused";
  createdAt: string;
  lastRun?: string;
  runCount: number;
}

const STORAGE_KEY = "arch1tech-forged-workflows";

const nodeTypeMeta: Record<WorkflowNodeType, { label: string; color: string }> = {
  trigger: { label: "Trigger", color: "text-yellow-400" },
  action: { label: "Action", color: "text-neon-green" },
  condition: { label: "Condition", color: "text-neon-purple" },
  llm: { label: "LLM Call", color: "text-neon-cyan" },
  agent: { label: "Agent", color: "text-blue-400" },
  delay: { label: "Delay", color: "text-orange-400" },
};

function loadWorkflows(): StoredWorkflow[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function WorkflowForge() {
  const [workflows, setWorkflows] = useState<StoredWorkflow[]>(loadWorkflows);
  const [selected, setSelected] = useState<StoredWorkflow | null>(null);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);

  const persist = (next: StoredWorkflow[]) => {
    setWorkflows(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    if (!aiService.isConfigured()) {
      toast.error("Add your Groq API key in Settings first.");
      return;
    }
    setGenerating(true);
    try {
      const wf = await generateWorkflow(description);
      const workflow: StoredWorkflow = {
        id: Date.now().toString(),
        name: wf.name,
        description: wf.description,
        nodes: wf.nodes,
        status: "draft",
        createdAt: new Date().toISOString(),
        runCount: 0,
      };
      const next = [workflow, ...workflows];
      persist(next);
      setSelected(workflow);
      setDescription("");
      toast.success("Workflow generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const deleteWorkflow = (id: string) => {
    const next = workflows.filter((w) => w.id !== id);
    persist(next);
    if (selected?.id === id) setSelected(null);
    toast.success("Workflow deleted");
  };

  const duplicateWorkflow = (workflow: StoredWorkflow) => {
    const dup: StoredWorkflow = {
      ...workflow,
      id: Date.now().toString(),
      name: `${workflow.name} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      runCount: 0,
    };
    persist([dup, ...workflows]);
    toast.success("Workflow duplicated");
  };

  const runWorkflow = (id: string) => {
    const next = workflows.map((w) =>
      w.id === id ? { ...w, lastRun: new Date().toISOString(), runCount: w.runCount + 1 } : w
    );
    persist(next);
    if (selected?.id === id) setSelected(next.find((w) => w.id === id) ?? null);
    toast.success("Workflow marked as run");
  };

  const toggleStatus = (id: string) => {
    const next = workflows.map((w) =>
      w.id === id ? { ...w, status: (w.status === "active" ? "paused" : "active") as StoredWorkflow["status"] } : w
    );
    persist(next);
    if (selected?.id === id) setSelected(next.find((w) => w.id === id) ?? null);
  };

  return (
    <div className="min-h-screen p-4 space-y-6 pb-32">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full flex items-center justify-center">
          <WorkflowIcon className="w-4 h-4 text-midnight-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient-neon">Workflow Forge</h1>
          <p className="text-sm text-muted-foreground">Describe a pipeline in plain language — Astrid builds the steps</p>
        </div>
      </div>

      <Card className="holographic-border">
        <div className="holographic-content">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span>Text-to-Workflow</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="e.g. When a new customer signs up, send a welcome email, wait 24 hours, then assign to sales if onboarding isn't complete"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 bg-muted/20 border-neon-cyan/20 focus:border-neon-cyan/50"
            />
            <Button variant="neon" onClick={handleGenerate} disabled={!description.trim() || generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Workflow
            </Button>
          </CardContent>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground">YOUR WORKFLOWS ({workflows.length})</h3>
        {workflows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No workflows yet — describe one above.
            </CardContent>
          </Card>
        ) : (
          workflows.map((wf) => (
            <Card
              key={wf.id}
              className={`holographic-border cursor-pointer ${selected?.id === wf.id ? "ring-2 ring-neon-cyan" : ""}`}
              onClick={() => setSelected(wf)}
            >
              <div className="holographic-content">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm">{wf.name}</h4>
                    <Badge variant={wf.status === "active" ? "default" : "outline"} className="text-xs">
                      {wf.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{wf.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{wf.nodes.length} nodes</span>
                    <span>{wf.runCount} runs</span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>

      {selected && (
        <Card className="holographic-border">
          <div className="holographic-content">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{selected.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => runWorkflow(selected.id)}>
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleStatus(selected.id)}>
                    <Zap className={`w-4 h-4 ${selected.status === "active" ? "text-neon-green" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => duplicateWorkflow(selected)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteWorkflow(selected.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected.nodes.map((node, idx) => {
                const meta = nodeTypeMeta[node.type] ?? { label: node.type, color: "text-muted-foreground" };
                return (
                  <div key={node.id ?? idx} className="flex gap-2 items-start">
                    <div className="flex-1 bg-muted/10 rounded-lg p-3 border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {node.type === "trigger" ? (
                            <Zap className={`w-4 h-4 ${meta.color}`} />
                          ) : node.type === "condition" ? (
                            <GitBranch className={`w-4 h-4 ${meta.color}`} />
                          ) : node.type === "delay" ? (
                            <Clock className={`w-4 h-4 ${meta.color}`} />
                          ) : (
                            <Code className={`w-4 h-4 ${meta.color}`} />
                          )}
                          <span className="text-sm font-medium">{node.label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{meta.label}</Badge>
                      </div>
                      {node.config && Object.keys(node.config).length > 0 && (
                        <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(node.config, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                <span>Created {new Date(selected.createdAt).toLocaleDateString()}</span>
                {selected.lastRun && <span>Last run {new Date(selected.lastRun).toLocaleString()}</span>}
                <span>{selected.runCount} runs</span>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}
