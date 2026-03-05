/**
 * Centralized prompt templates for all agents in the Agentic Wealth Navigator.
 * All system messages, agent instructions, and conversational prompts live here.
 */

// --- System Prompts ---
export const SYSTEM_PROMPTS = {
  welcome: `Welcome to Agentic Wealth Navigator! 🚀\n\nI'm your AI-powered financial wellness assistant. I can help you with:\n\n• **Financial Assessment** — Analyze your finances and get personalized recommendations\n• **Account Lookup** — Retrieve your account details\n• **Common Questions** — Answer your banking and financial queries\n\nPlease enter your **Account Number** to get started.`,

  accountFound: (name: string) =>
    `Welcome back, **${name}**! 👋\n\nI've retrieved your account details. How can I help you today?\n\n• Type **"assess"** to start a financial wellness assessment\n• Type **"faq"** or ask any common question\n• Type **"account"** to view your account details`,

  accountNotFound: `I couldn't find an account with that number. Please double-check and try again, or type **"skip"** to continue without an account.`,

  skipAccount: `No problem! You can still use the financial assessment.\n\nLet's begin — **What is your monthly income (after tax)?**`,

  assessmentComplete: `Analyzing your financial data with our multi-agent system... 🔄\n\n*DataAnalyzer → RiskAgent → PlannerAgent → RMSummary*\n\nYour personalized financial dashboard is ready! Check the results on the right →`,

  postAssessment: `Your assessment is complete! You can still ask me questions.\n\n• Type **"faq"** to see common questions\n• Ask anything about your finances or account`,
};

// --- Agent Prompts ---
export const AGENT_PROMPTS = {
  dataAnalyzer: {
    instruction: "Extract financial metrics from user data. Calculate savings rate, monthly net, expense ratio, and identify spending patterns.",
    outputFormat: "Return savings_rate (%), monthly_net ($), expense_ratio (%), and spending_patterns array.",
  },

  riskAgent: {
    instruction: "Assess the user's financial risk profile based on emergency fund coverage, savings rate, and stated risk tolerance.",
    lowCriteria: "6+ months emergency fund AND 20%+ savings rate AND low tolerance",
    highCriteria: "Less than 2 months emergency fund OR savings rate below 5%",
    mediumCriteria: "Everything else falls into medium risk",
  },

  plannerAgent: {
    instruction: "Generate personalized budgeting and investment recommendations using the financial knowledge base (RAG).",
    ragContext: "Retrieve relevant rules from financial_knowledge.json before generating recommendations.",
    strengthsPrompt: "Identify what the user is doing well financially.",
    gapsPrompt: "Identify areas where the user needs improvement.",
  },

  summaryAgent: {
    instruction: "Create a concise relationship manager briefing highlighting financial strengths, gaps, and priority next steps.",
    format: "One-paragraph summary suitable for a bank relationship manager.",
  },
};

// --- FAQ Prompt Templates ---
export const FAQ_PROMPTS = {
  noMatch: "I'm not sure about that. Could you rephrase your question? You can also type **\"faq\"** to see a list of common questions I can help with.",

  faqListIntro: "Here are some common questions I can help with:\n\n",

  accountDetailTemplate: (customer: {
    name: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    branch: string;
    phone: string;
    email: string;
  }) =>
    `📋 **Account Details**\n\n` +
    `• **Name:** ${customer.name}\n` +
    `• **Account Number:** ${customer.accountNumber}\n` +
    `• **Account Type:** ${customer.accountType}\n` +
    `• **Balance:** $${customer.balance.toLocaleString()}\n` +
    `• **Branch:** ${customer.branch}\n` +
    `• **Phone:** ${customer.phone}\n` +
    `• **Email:** ${customer.email}`,
};
