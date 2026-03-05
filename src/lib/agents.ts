/**
 * Client-side simulation of the multi-agent orchestration system.
 * Uses internal JSON data sources — no external APIs.
 * 
 * Flow: Account Lookup → User Input → DataAnalyzer → RiskAgent → PlannerAgent → RMSummary → Response
 */

import customersData from "@/data/customers.json";
import faqsData from "@/data/faqs.json";
import financialKnowledge from "../../backend/database/financial_knowledge.json";

export interface CustomerRecord {
  accountNumber: string;
  name: string;
  email: string;
  phone: string;
  accountType: string;
  balance: number;
  branch: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  investmentGoals: string;
  riskTolerance: string;
}

export interface FAQEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

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

// --- Account Lookup (from customers.json) ---
export function lookupCustomer(accountNumber: string): CustomerRecord | null {
  return (customersData as CustomerRecord[]).find(
    (c) => c.accountNumber === accountNumber.trim()
  ) || null;
}

// --- FAQ Lookup (from faqs.json) ---
export function findFAQ(query: string): FAQEntry | null {
  const lower = query.toLowerCase();
  const faqs = faqsData as FAQEntry[];

  // Direct keyword match
  for (const faq of faqs) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq;
    }
  }
  return null;
}

export function getAllFAQs(): FAQEntry[] {
  return faqsData as FAQEntry[];
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

// --- WellnessPlannerAgent (RAG from financial_knowledge.json) ---
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

  // RAG: pull from financial_knowledge.json
  const knowledge = financialKnowledge as any;

  // Savings benchmarks
  for (const bench of knowledge.savings_benchmarks || []) {
    if (savingsRate < bench.threshold) {
      recommendations.push(bench.advice);
      break; // only the most relevant
    }
  }

  // Budgeting rules
  if (savingsRate < 20) {
    const rule5030 = (knowledge.budgeting_rules || []).find((r: any) => r.name === "50/30/20 Rule");
    if (rule5030) recommendations.push(`${rule5030.name}: ${rule5030.description}`);
  }

  // Investment allocations
  const allocations = knowledge.investment_allocations || {};
  const riskKey = riskProfile.toLowerCase();
  if (allocations[riskKey]) {
    recommendations.push(`Suggested allocation for ${riskProfile} risk: ${allocations[riskKey]}`);
  }

  // Risk guidance
  const guidance = knowledge.risk_profile_guidance || {};
  if (guidance[riskKey]) {
    recommendations.push(guidance[riskKey]);
  }

  if (emergencyMonths < 6) {
    recommendations.push(`Increase emergency fund by $${Math.round((6 * profile.monthlyExpenses - profile.savings) / 12)}/month over 12 months`);
  }

  if (profile.investmentGoals.toLowerCase().includes("retire")) {
    recommendations.push("Max out retirement account contributions (401k/IRA)");
  }

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
