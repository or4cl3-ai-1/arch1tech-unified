import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EthicalSimulator } from "@/components/EthicalSimulator";
import { 
  Rocket, 
  Brain, 
  TrendingUp, 
  Zap, 
  Plus, 
  Activity,
  Cpu,
  Database,
  Code2
} from "lucide-react";

interface DashboardProps {
  onViewChange?: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  // Real, live-updating Σ-Matrix drift — replaces the previous hardcoded "0.02".
  // Starts stable; each completed Ethical Simulator decision nudges it via
  // EthicalSimulator's onDriftChange, using real AI-scored driftImpact.
  const [sigmaDrift, setSigmaDrift] = useState(0.02);

  return (
    <div className="min-h-screen mobile-p-4 tablet-p-6 desktop-p-8 space-y-6 pb-32 mobile-safe-area">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-neon">Command Center</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Hey Alex, Astrid's ready.</p>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center neon-glow-cyan flex-shrink-0">
          <span className="text-midnight-blue font-bold text-lg sm:text-xl">Ω</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="holographic-border">
          <div className="holographic-content p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-neon-cyan" />
              <span className="text-sm text-muted-foreground">Active Astrids</span>
            </div>
            <div className="text-2xl font-bold text-neon-cyan">2</div>
            <div className="text-xs text-muted-foreground">Free tier limit</div>
          </div>
        </div>

        <div className="holographic-border">
          <div className="holographic-content p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-neon-green" />
              <span className="text-sm text-muted-foreground">Custom LLMs</span>
            </div>
            <div className="text-2xl font-bold text-neon-green">3</div>
            <div className="text-xs text-muted-foreground">3 slots available</div>
          </div>
        </div>

        <div className="holographic-border">
          <div className="holographic-content p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-neon-purple" />
              <span className="text-sm text-muted-foreground">Σ-Matrix Drift</span>
            </div>
            <div className="text-2xl font-bold text-neon-purple">{sigmaDrift.toFixed(2)}</div>
            <div className="text-xs text-neon-green">{sigmaDrift < 0.1 ? "Excellent stability" : sigmaDrift < 0.3 ? "Stable" : "Needs review"}</div>
          </div>
        </div>

        <div className="holographic-border">
          <div className="holographic-content p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Active Agents</span>
            </div>
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-xs text-muted-foreground">Running workflows</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="holographic-border">
        <div className="holographic-content">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-neon-green rounded-full pulse-green"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">VibeCodeAI refinement completed</p>
                <p className="text-xs text-muted-foreground">Customer support chatbot - 2 min ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-neon-cyan rounded-full pulse-cyan"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Astrid deployed new version</p>
                <p className="text-xs text-muted-foreground">E-commerce recommendations - 15 min ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Custom LLM training started</p>
                <p className="text-xs text-muted-foreground">Domain-specific model - 1 hour ago</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Button 
          variant="neon" 
          className="touch-target h-20 sm:h-24 flex-col space-y-2 touch-feedback"
          onClick={() => onViewChange?.('capture')}
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="text-sm sm:text-base">New Build</span>
        </Button>
        <Button 
          variant="holographic" 
          className="touch-target h-20 sm:h-24 flex-col space-y-2 touch-feedback"
          onClick={() => onViewChange?.('custom-llm')}
        >
          <Brain className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="text-sm sm:text-base">Custom LLM</span>
        </Button>
        <Button 
          variant="pulse" 
          className="touch-target h-20 sm:h-24 flex-col space-y-2 touch-feedback"
          onClick={() => onViewChange?.('marketplace')}
        >
          <Database className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="text-sm sm:text-base">Marketplace</span>
        </Button>
        <Button 
          variant="secondary" 
          className="touch-target h-20 sm:h-24 flex-col space-y-2 touch-feedback"
          onClick={() => onViewChange?.('logic')}
        >
          <Code2 className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="text-sm sm:text-base">Σ-Matrix</span>
        </Button>
      </div>

      {/* Ethical Simulator — real AI-generated dilemma + live Σ-Matrix drift */}
      <EthicalSimulator drift={sigmaDrift} onDriftChange={setSigmaDrift} />
    </div>
  );
}