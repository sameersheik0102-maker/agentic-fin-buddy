import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASSESSMENT_QUESTIONS, type FinancialProfile } from "@/lib/agents";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface ChatWindowProps {
  onComplete: (profile: FinancialProfile) => void;
  isComplete: boolean;
}

export default function ChatWindow({ onComplete, isComplete }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to Agentic Wealth Navigator! 🚀\n\nI'll ask you a few questions to assess your financial wellness and provide personalized recommendations.\n\nLet's start — **What is your monthly income (after tax)?**" },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isComplete) return;
    const currentQ = ASSESSMENT_QUESTIONS[step];
    const userMsg = input.trim();
    setInput("");

    const newAnswers = { ...answers, [currentQ.id]: userMsg };
    setAnswers(newAnswers);

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];

    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      const nextQ = ASSESSMENT_QUESTIONS[step + 1];
      newMessages.push({ role: "assistant", content: nextQ.question });
      setMessages(newMessages);
      setStep(step + 1);
    } else {
      newMessages.push({ role: "assistant", content: "Analyzing your financial data with our multi-agent system... 🔄\n\n*DataAnalyzer → RiskAgent → PlannerAgent → RMSummary*\n\nYour personalized financial dashboard is ready! Check the results on the right →" });
      setMessages(newMessages);

      const riskMap: Record<string, "low" | "medium" | "high"> = {
        "Low — I prefer safety": "low",
        "Medium — balanced approach": "medium",
        "High — I can handle volatility": "high",
      };

      const profile: FinancialProfile = {
        monthlyIncome: parseFloat(newAnswers.income) || 5000,
        monthlyExpenses: parseFloat(newAnswers.expenses) || 3000,
        savings: parseFloat(newAnswers.savings) || 10000,
        investmentGoals: newAnswers.goals || "General wealth building",
        riskTolerance: riskMap[newAnswers.risk] || "medium",
      };
      onComplete(profile);
    }
  };

  const handleChoice = (choice: string) => {
    setInput(choice);
    setTimeout(() => {
      const currentQ = ASSESSMENT_QUESTIONS[step];
      const newAnswers = { ...answers, [currentQ.id]: choice };
      setAnswers(newAnswers);
      setInput("");

      const newMessages: Message[] = [...messages, { role: "user", content: choice }];
      newMessages.push({ role: "assistant", content: "Analyzing your financial data with our multi-agent system... 🔄\n\n*DataAnalyzer → RiskAgent → PlannerAgent → RMSummary*\n\nYour personalized financial dashboard is ready! Check the results on the right →" });
      setMessages(newMessages);

      const riskMap: Record<string, "low" | "medium" | "high"> = {
        "Low — I prefer safety": "low",
        "Medium — balanced approach": "medium",
        "High — I can handle volatility": "high",
      };

      const profile: FinancialProfile = {
        monthlyIncome: parseFloat(newAnswers.income) || 5000,
        monthlyExpenses: parseFloat(newAnswers.expenses) || 3000,
        savings: parseFloat(newAnswers.savings) || 10000,
        investmentGoals: newAnswers.goals || "General wealth building",
        riskTolerance: riskMap[choice] || "medium",
      };
      onComplete(profile);
    }, 100);
  };

  const currentQ = step < ASSESSMENT_QUESTIONS.length ? ASSESSMENT_QUESTIONS[step] : null;

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card wealth-shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-border wealth-gradient">
        <h2 className="text-sm font-semibold text-primary-foreground flex items-center gap-2">
          <Bot className="w-4 h-4" /> Financial Assessment Chat
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} animate-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full wealth-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}>
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1" : ""}>{line.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")}</p>
              ))}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {currentQ?.type === "choice" && !isComplete && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {currentQ.options?.map((opt) => (
            <Button key={opt} variant="outline" size="sm" onClick={() => handleChoice(opt)} className="text-xs">
              {opt}
            </Button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-border">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isComplete ? "Assessment complete" : currentQ?.placeholder || "Type your answer..."}
            disabled={isComplete || currentQ?.type === "choice"}
            className="text-sm"
          />
          <Button type="submit" size="icon" disabled={isComplete || !input.trim()} className="wealth-gradient border-0">
            <Send className="w-4 h-4 text-primary-foreground" />
          </Button>
        </form>
      </div>
    </div>
  );
}
