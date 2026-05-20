import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LandingPage } from "@/components/LandingPage";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Splash } from "@/components/Splash";
import { Dashboard } from "@/components/Dashboard";
import { IdeaCapture } from "@/components/IdeaCapture";
import { VibeCodeAI } from "@/components/VibeCodeAI";
import { VisualLogicDesigner } from "@/components/VisualLogicDesigner";
import ProjectDeployment from "@/components/ProjectDeployment";
import FileUploadManager from "@/components/FileUploadManager";
import { AIMarketplace } from "@/components/AIMarketplace";
import { CustomLLMBuilder } from "@/components/CustomLLMBuilder";
import { SyntheticDataGenerator } from "@/components/SyntheticDataGenerator";
import { Astrid } from "@/components/Astrid";
import { Settings } from "@/components/Settings";
import { Navigation } from "@/components/Navigation";
import { AIInitializer } from "@/components/AIInitializer";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in and we're past the landing page
  useEffect(() => {
    if (!loading && !user && !showLanding) {
      navigate('/auth');
    }
  }, [user, loading, navigate, showLanding]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'capture':
        return <IdeaCapture />;
      case 'vibe':
        return <VibeCodeAI />;
      case 'logic':
        return <VisualLogicDesigner />;
      case 'deploy':
        return <ProjectDeployment />;
      case 'files':
        return <FileUploadManager />;
      case 'marketplace':
        return <AIMarketplace />;
      case 'custom-llm':
        return <CustomLLMBuilder />;
      case 'sdg':
        return <SyntheticDataGenerator onViewChange={setCurrentView} />;
      case 'astrid':
        return <Astrid />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  // Landing page flow - show to everyone first
  if (showLanding) {
    return (
      <LandingPage 
        onEnter={() => {
          setShowLanding(false);
          // If not authenticated, go to auth page
          if (!user && !loading) {
            navigate('/auth');
          } else if (user) {
            // If already authenticated, go to loading screen
            setShowLoading(true);
          }
        }} 
      />
    );
  }

  // Show loading spinner while checking auth (after landing page dismissed)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render anything if user is not logged in (will redirect to auth)
  if (!user) {
    navigate('/auth');
    return null;
  }

  if (showLoading) {
    return (
      <LoadingScreen 
        onComplete={() => {
          setShowLoading(false);
          setShowSplash(true);
        }} 
      />
    );
  }

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <AIInitializer>
      <div className="min-h-screen bg-background">
        {renderCurrentView()}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </AIInitializer>
  );
};

export default Index;
