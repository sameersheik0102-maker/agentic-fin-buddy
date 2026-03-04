import { TrendingUp, TrendingDown, Shield, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AgentResult, FinancialProfile } from "@/lib/agents";

interface Props {
  result: AgentResult;
  profile: FinancialProfile;
}

const COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#a3a3a3"];

export default function FinancialDashboard({ result, profile }: Props) {
  const incomeExpenseData = [
    { name: "Income", amount: profile.monthlyIncome },
    { name: "Expenses", amount: profile.monthlyExpenses },
    { name: "Net Savings", amount: result.monthlyNet },
  ];

  const riskColor = result.riskProfile === "Low" ? "text-wealth-emerald" : result.riskProfile === "Medium" ? "text-wealth-gold" : "text-wealth-coral";
  const riskBg = result.riskProfile === "Low" ? "bg-accent" : result.riskProfile === "Medium" ? "bg-wealth-gold/10" : "bg-destructive/10";

  return (
    <div className="space-y-4 animate-fade-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 wealth-card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Savings Rate</span>
            {result.savingsRate >= 20 ? <TrendingUp className="w-4 h-4 text-wealth-emerald" /> : <TrendingDown className="w-4 h-4 text-wealth-coral" />}
          </div>
          <p className="text-2xl font-bold wealth-gradient-text">{result.savingsRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Target: 20%+</p>
        </div>

        <div className={`rounded-lg border border-border bg-card p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Risk Profile</span>
            <Shield className={`w-4 h-4 ${riskColor}`} />
          </div>
          <p className={`text-2xl font-bold ${riskColor}`}>{result.riskProfile}</p>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${riskBg} ${riskColor}`}>
            {result.riskProfile === "Low" ? "Conservative" : result.riskProfile === "Medium" ? "Balanced" : "Aggressive"}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Monthly Net</span>
            <Target className="w-4 h-4 text-wealth-teal" />
          </div>
          <p className={`text-2xl font-bold ${result.monthlyNet >= 0 ? "text-wealth-emerald" : "text-wealth-coral"}`}>
            ${Math.abs(result.monthlyNet).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{result.monthlyNet >= 0 ? "Surplus" : "Deficit"}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {incomeExpenseData.map((_, i) => (
                  <Cell key={i} fill={["#0d9488", "#f97316", "#14b8a6"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Spending Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={result.spendingPatterns} dataKey="percentage" nameKey="category" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={2}>
                {result.spendingPatterns.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-wealth-emerald" /> Strengths
          </h3>
          <ul className="space-y-1.5">
            {result.financialStrengths.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-wealth-emerald mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
            {result.financialStrengths.length === 0 && <li className="text-xs text-muted-foreground italic">Areas to develop identified</li>}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-wealth-gold" /> Gaps
          </h3>
          <ul className="space-y-1.5">
            {result.financialGaps.map((g, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-wealth-gold mt-1.5 flex-shrink-0" />
                {g}
              </li>
            ))}
            {result.financialGaps.length === 0 && <li className="text-xs text-muted-foreground italic">No major gaps detected</li>}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">AI Recommendations</h3>
        <div className="grid gap-2">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-md bg-muted/50">
              <span className="w-5 h-5 rounded-full wealth-gradient flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-foreground leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RM Summary */}
      <div className="rounded-lg border border-border bg-card p-4 wealth-card-glow">
        <h3 className="text-sm font-semibold mb-2">RM Summary</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-mono">{result.rmSummary}</p>
      </div>
    </div>
  );
}
