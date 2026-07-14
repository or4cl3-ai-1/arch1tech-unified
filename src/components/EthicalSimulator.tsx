// Real ethical-dilemma simulator, ported from Arch1tech2.5's genuine
// (Gemini-backed) EthicalSimModal.tsx onto this app's Groq-backed forge-service.
// Unlike the Σ-Matrix stat on Dashboard.tsx (currently a hardcoded "0.02"),
// this actually computes drift from real generated + evaluated decisions.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Dices, Loader2 } from "lucide-react";
import { generateEthicalDilemma, runEthicalSimulation } from "@/lib/forge-service";
import { aiService } from "@/lib/ai-service";
import type { EthicalDilemma, SimulationReport } from "@/types/forge";

interface EthicalSimulatorProps {
  drift: number;
  onDriftChange: (next: number) => void;
}

export function EthicalSimulator({ drift, onDriftChange }: EthicalSimulatorProps) {
  const [open, setOpen] = useState(false);
  const [dilemma, setDilemma] = useState<EthicalDilemma | null>(null);
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!aiService.isConfigured()) {
      setError("Add your Groq API key in Settings first to run live simulations.");
      return;
    }
    setError(null);
    setReport(null);
    setLoading(true);
    try {
      const d = await generateEthicalDilemma();
      setDilemma(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate dilemma.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = async (option: "A" | "B") => {
    if (!dilemma) return;
    setLoading(true);
    setError(null);
    try {
      const result = await runEthicalSimulation(dilemma, option);
      setReport(result);
      onDriftChange(Math.max(0, Math.min(1, drift + result.driftImpact / 100)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="holographic-border cursor-pointer" onClick={() => { setOpen(true); handleGenerate(); }}>
        <div className="holographic-content">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-neon-purple" />
              <span>Ethical Simulator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Run a live AI-generated ethical dilemma and see how it moves Σ-Matrix drift.
            </p>
          </CardContent>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dices className="w-5 h-5 text-neon-purple" /> Ethical Simulation
            </DialogTitle>
          </DialogHeader>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Astrid is thinking…
            </div>
          )}

          {!loading && dilemma && !report && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{dilemma.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{dilemma.scenario}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="holographic" onClick={() => handleChoose("A")}>
                  A: {dilemma.optionA}
                </Button>
                <Button variant="holographic" onClick={() => handleChoose("B")}>
                  B: {dilemma.optionB}
                </Button>
              </div>
            </div>
          )}

          {report && (
            <div className="space-y-3">
              <p className="text-sm">{report.summary}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Ethical alignment</span>
                  <span>{report.ethicalScore}/100</span>
                </div>
                <Progress value={report.ethicalScore} />
              </div>
              <p className="text-xs text-muted-foreground">{report.reasoning}</p>
              <Button variant="secondary" onClick={handleGenerate}>Run another</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
