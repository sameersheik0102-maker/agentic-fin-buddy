import { useState } from "react";
import { Sparkles } from "lucide-react";
import ChatWindow from "@/components/ChatWindow";
import FinancialDashboard from "@/components/FinancialDashboard";
import { orchestrate, type FinancialProfile, type AgentResult } from "@/lib/agents";

const Index = () => {
  const [result, setResult] = useState<AgentResult | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);

  const handleComplete = (p: FinancialProfile) => {
    setProfile(p);
    setResult(orchestrate(p));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg wealth-gradient flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Agentic Wealth Navigator</h1>
              <p className="text-[10px] text-muted-foreground">AI-Powered Financial Wellness</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-wealth-emerald animate-pulse" />
            <span className="text-xs text-muted-foreground">Multi-Agent System Active</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-6rem)]">
          {/* Chat - left column */}
          <div className="lg:col-span-2 flex flex-col">
            <ChatWindow onComplete={handleComplete} isComplete={!!result} />
          </div>

          {/* Dashboard - right column */}
          <div className="lg:col-span-3 overflow-y-auto">
            {result && profile ? (
              <FinancialDashboard result={result} profile={profile} />
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-dashed border-border bg-card/50">
                <div className="text-center space-y-3 p-8">
                  <div className="w-16 h-16 rounded-2xl wealth-gradient mx-auto flex items-center justify-center opacity-40">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Financial Dashboard</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">Complete the financial assessment in the chat to see your personalized insights, charts, and AI recommendations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
