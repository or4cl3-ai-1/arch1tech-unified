import { Button } from "@/components/ui/button";
import { 
  Home, 
  Lightbulb, 
  Brain, 
  Workflow, 
  Bot, 
  Database,
  ShoppingBag,
  Settings,
  LogOut,
  Rocket,
  Upload,
  FlaskConical,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { signOut } = useAuth();
  
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'capture', icon: Lightbulb, label: 'Capture' },
    { id: 'vibe', icon: Brain, label: 'VibeAI' },
    { id: 'logic', icon: Workflow, label: 'Logic' },
    { id: 'deploy', icon: Rocket, label: 'Deploy' },
    { id: 'files', icon: Upload, label: 'Files' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Market' },
    { id: 'custom-llm', icon: Database, label: 'LLM' },
    { id: 'sdg', icon: FlaskConical, label: 'DataForge' },
    { id: 'astrid', icon: Bot, label: 'Astrid' },
    { id: 'forge', icon: Sparkles, label: 'Forge' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-4 mobile-safe-area">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-4 gap-3">
          {navItems.slice(0, 4).map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "neon" : "ghost"}
              size="sm"
              className="flex-col touch-target p-3 touch-feedback"
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {navItems.slice(4, 8).map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "neon" : "ghost"}
              size="sm"
              className="flex-col touch-target p-3 touch-feedback"
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {navItems.slice(8, 12).map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "neon" : "ghost"}
              size="sm"
              className="flex-col touch-target p-3 touch-feedback"
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="flex-col touch-target p-3 text-destructive hover:text-destructive touch-feedback"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs mt-1">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
