import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ASSESSMENT_QUESTIONS,
  lookupCustomer,
  findFAQ,
  getAllFAQs,
  type FinancialProfile,
  type CustomerRecord,
} from "@/lib/agents";
import { SYSTEM_PROMPTS, FAQ_PROMPTS } from "@/lib/prompts";

interface Message {
  role: "assistant" | "user";
  content: string;
}

type ChatPhase = "account_lookup" | "menu" | "assessment" | "post_complete";

interface ChatWindowProps {
  onComplete: (profile: FinancialProfile) => void;
  isComplete: boolean;
}

export default function ChatWindow({ onComplete, isComplete }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: SYSTEM_PROMPTS.welcome },
  ]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<ChatPhase>("account_lookup");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const addMessages = (msgs: Message[]) => setMessages((prev) => [...prev, ...msgs]);

  const handleAccountLookup = (userMsg: string) => {
    if (userMsg.toLowerCase() === "skip") {
      setPhase("assessment");
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: SYSTEM_PROMPTS.skipAccount },
      ]);
      return;
    }

    const found = lookupCustomer(userMsg);
    if (found) {
      setCustomer(found);
      setPhase("menu");
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: SYSTEM_PROMPTS.accountFound(found.name) },
      ]);
    } else {
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: SYSTEM_PROMPTS.accountNotFound },
      ]);
    }
  };

  const handleMenu = (userMsg: string) => {
    const lower = userMsg.toLowerCase().trim();

    if (lower === "assess" || lower === "assessment") {
      setPhase("assessment");
      if (customer) {
        // Pre-fill from customer data and auto-start
        const profile: FinancialProfile = {
          monthlyIncome: customer.monthlyIncome,
          monthlyExpenses: customer.monthlyExpenses,
          savings: customer.savings,
          investmentGoals: customer.investmentGoals,
          riskTolerance: customer.riskTolerance as "low" | "medium" | "high",
        };
        addMessages([
          { role: "user", content: userMsg },
          { role: "assistant", content: `Using your account data to run the financial assessment...\n\n• Income: $${customer.monthlyIncome.toLocaleString()}\n• Expenses: $${customer.monthlyExpenses.toLocaleString()}\n• Savings: $${customer.savings.toLocaleString()}\n• Goals: ${customer.investmentGoals}\n• Risk: ${customer.riskTolerance}\n\n${SYSTEM_PROMPTS.assessmentComplete}` },
        ]);
        setPhase("post_complete");
        onComplete(profile);
        return;
      }
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: ASSESSMENT_QUESTIONS[0].question },
      ]);
      return;
    }

    if (lower === "account" || lower === "details") {
      if (customer) {
        addMessages([
          { role: "user", content: userMsg },
          { role: "assistant", content: FAQ_PROMPTS.accountDetailTemplate(customer) },
        ]);
      }
      return;
    }

    if (lower === "faq" || lower === "help") {
      const faqs = getAllFAQs();
      const faqList = faqs.map((f, i) => `${i + 1}. ${f.question}`).join("\n");
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: FAQ_PROMPTS.faqListIntro + faqList + "\n\nAsk any of these or type your own question!" },
      ]);
      return;
    }

    // Try FAQ match
    const faq = findFAQ(lower);
    if (faq) {
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: faq.answer },
      ]);
      return;
    }

    addMessages([
      { role: "user", content: userMsg },
      { role: "assistant", content: FAQ_PROMPTS.noMatch },
    ]);
  };

  const handleAssessment = (userMsg: string) => {
    const currentQ = ASSESSMENT_QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: userMsg };
    setAnswers(newAnswers);

    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      const nextQ = ASSESSMENT_QUESTIONS[step + 1];
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: nextQ.question },
      ]);
      setStep(step + 1);
    } else {
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: SYSTEM_PROMPTS.assessmentComplete },
      ]);
      setPhase("post_complete");

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

  const handlePostComplete = (userMsg: string) => {
    const lower = userMsg.toLowerCase().trim();

    if (lower === "account" || lower === "details") {
      if (customer) {
        addMessages([
          { role: "user", content: userMsg },
          { role: "assistant", content: FAQ_PROMPTS.accountDetailTemplate(customer) },
        ]);
        return;
      }
    }

    if (lower === "faq" || lower === "help") {
      const faqs = getAllFAQs();
      const faqList = faqs.map((f, i) => `${i + 1}. ${f.question}`).join("\n");
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: FAQ_PROMPTS.faqListIntro + faqList },
      ]);
      return;
    }

    const faq = findFAQ(lower);
    if (faq) {
      addMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: faq.answer },
      ]);
      return;
    }

    addMessages([
      { role: "user", content: userMsg },
      { role: "assistant", content: FAQ_PROMPTS.noMatch },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");

    switch (phase) {
      case "account_lookup":
        handleAccountLookup(userMsg);
        break;
      case "menu":
        handleMenu(userMsg);
        break;
      case "assessment":
        handleAssessment(userMsg);
        break;
      case "post_complete":
        handlePostComplete(userMsg);
        break;
    }
  };

  const handleChoice = (choice: string) => {
    const currentQ = ASSESSMENT_QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: choice };
    setAnswers(newAnswers);

    addMessages([
      { role: "user", content: choice },
      { role: "assistant", content: SYSTEM_PROMPTS.assessmentComplete },
    ]);
    setPhase("post_complete");

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
  };

  const currentQ = phase === "assessment" && step < ASSESSMENT_QUESTIONS.length ? ASSESSMENT_QUESTIONS[step] : null;

  const getPlaceholder = () => {
    if (phase === "account_lookup") return "Enter account number (e.g. 1001) or type 'skip'";
    if (phase === "menu" || phase === "post_complete") return "Type 'assess', 'faq', 'account', or ask a question...";
    if (currentQ?.type === "choice") return "Select an option below";
    return currentQ?.placeholder || "Type your answer...";
  };

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
                <p key={j} className={j > 0 ? "mt-1" : ""}>
                  {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                    part.startsWith("**") && part.endsWith("**")
                      ? <strong key={k}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                </p>
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

      {currentQ?.type === "choice" && phase === "assessment" && (
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
            placeholder={getPlaceholder()}
            disabled={currentQ?.type === "choice"}
            className="text-sm"
          />
          <Button type="submit" size="icon" disabled={!input.trim()} className="wealth-gradient border-0">
            <Send className="w-4 h-4 text-primary-foreground" />
          </Button>
        </form>
      </div>
    </div>
  );
}
