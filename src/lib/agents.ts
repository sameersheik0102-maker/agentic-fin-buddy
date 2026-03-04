/**
 * Client-side simulation of the multi-agent orchestration system.
 * In production, these would be Python FastAPI endpoints.
 * 
 * Flow: User Input → DataAnalyzer → RiskAgent → PlannerAgent → RMSummary → Response
 */

export interface FinancialProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  investmentGoals: string;
  riskTolerance: "low" | "medium" | "high";
}

export interface AgentResult {
  savingsRate: number;
  monthlyNet: number;
  riskProfile: "Low" | "Medium" | "High";
  financialStrengths: string[];
  financialGaps: string[];
  recommendations: string[];
  rmSummary: string;
  spendingPatterns: { category: string; percentage: number }[];
}

// --- DataAnalyzerAgent ---
function analyzeData(profile: FinancialProfile) {
  const monthlyNet = profile.monthlyIncome - profile.monthlyExpenses;
  const savingsRate = profile.monthlyIncome > 0 ? (monthlyNet / profile.monthlyIncome) * 100 : 0;
  const expenseRatio = profile.monthlyIncome > 0 ? (profile.monthlyExpenses / profile.monthlyIncome) * 100 : 100;

  const spendingPatterns = [
    { category: "Housing", percentage: Math.round(expenseRatio * 0.35) },
    { category: "Food", percentage: Math.round(expenseRatio * 0.15) },
    { category: "Transport", percentage: Math.round(expenseRatio * 0.12) },
    { category: "Utilities", percentage: Math.round(expenseRatio * 0.08) },
    { category: "Entertainment", percentage: Math.round(expenseRatio * 0.10) },
    { category: "Other", percentage: Math.round(expenseRatio * 0.20) },
  ];

  return { savingsRate: Math.round(savingsRate * 10) / 10, monthlyNet, spendingPatterns };
}

// --- RiskAnalysisAgent ---
function assessRisk(profile: FinancialProfile, savingsRate: number): "Low" | "Medium" | "High" {
  const emergencyMonths = profile.savings / (profile.monthlyExpenses || 1);
  if (profile.riskTolerance === "low" && emergencyMonths >= 6 && savingsRate >= 20) return "Low";
  if (emergencyMonths < 2 || savingsRate < 5) return "High";
  return "Medium";
}

// --- WellnessPlannerAgent (with RAG knowledge) ---
function generateRecommendations(profile: FinancialProfile, riskProfile: string, savingsRate: number): { strengths: string[]; gaps: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];
  const emergencyMonths = profile.savings / (profile.monthlyExpenses || 1);

  if (savingsRate >= 20) strengths.push("Excellent savings rate above 20%");
  else if (savingsRate >= 10) strengths.push("Decent savings rate above 10%");
  else gaps.push(`Low savings rate of ${savingsRate}% — aim for at least 20%`);

  if (emergencyMonths >= 6) strengths.push(`Strong emergency fund covering ${Math.round(emergencyMonths)} months`);
  else if (emergencyMonths >= 3) strengths.push("Adequate emergency fund");
  else gaps.push(`Emergency fund only covers ${Math.round(emergencyMonths * 10) / 10} months — build to 6 months`);

  if (profile.monthlyIncome > profile.monthlyExpenses * 1.5) strengths.push("Healthy income-to-expense ratio");

  // RAG-based recommendations from financial_knowledge
  if (savingsRate < 20) recommendations.push("Apply the 50/30/20 rule: 50% needs, 30% wants, 20% savings");
  if (emergencyMonths < 6) recommendations.push(`Increase emergency fund by $${Math.round((6 * profile.monthlyExpenses - profile.savings) / 12)}/month over 12 months`);
  if (riskProfile === "Low" || riskProfile === "Medium") recommendations.push("Consider diversified index fund investments for long-term growth");
  if (profile.investmentGoals.toLowerCase().includes("retire")) recommendations.push("Max out retirement account contributions (401k/IRA)");
  recommendations.push("Review and optimize recurring subscriptions quarterly");
  if (riskProfile === "High") recommendations.push("Prioritize debt reduction before aggressive investing");

  return { strengths, gaps, recommendations };
}

// --- RMSummaryAgent ---
function generateSummary(profile: FinancialProfile, result: Omit<AgentResult, "rmSummary">): string {
  return `Client earns $${profile.monthlyIncome.toLocaleString()}/mo with a ${result.savingsRate}% savings rate. Risk profile: ${result.riskProfile}. ` +
    `${result.financialStrengths.length} strengths identified, ${result.financialGaps.length} areas need attention. ` +
    `Primary recommendation: ${result.recommendations[0] || "Maintain current trajectory."}`;
}

// --- Orchestrator ---
export function orchestrate(profile: FinancialProfile): AgentResult {
  const { savingsRate, monthlyNet, spendingPatterns } = analyzeData(profile);
  const riskProfile = assessRisk(profile, savingsRate);
  const { strengths, gaps, recommendations } = generateRecommendations(profile, riskProfile, savingsRate);

  const partial: Omit<AgentResult, "rmSummary"> = {
    savingsRate, monthlyNet, riskProfile,
    financialStrengths: strengths,
    financialGaps: gaps,
    recommendations,
    spendingPatterns,
  };

  return { ...partial, rmSummary: generateSummary(profile, partial) };
}

// Chat question flow
export const ASSESSMENT_QUESTIONS = [
  { id: "income", question: "What is your monthly income (after tax)?", type: "number" as const, placeholder: "e.g. 5000" },
  { id: "expenses", question: "What are your total monthly expenses?", type: "number" as const, placeholder: "e.g. 3200" },
  { id: "savings", question: "How much do you currently have in savings?", type: "number" as const, placeholder: "e.g. 15000" },
  { id: "goals", question: "What are your investment goals?", type: "text" as const, placeholder: "e.g. Retirement, buying a home, building wealth" },
  { id: "risk", question: "What's your risk tolerance?", type: "choice" as const, options: ["Low — I prefer safety", "Medium — balanced approach", "High — I can handle volatility"] },
];
