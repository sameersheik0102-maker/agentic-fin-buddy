"""
Orchestrator - Calls agents in sequence:
User Input → DataAnalyzer → RiskAgent → PlannerAgent → RMSummary → Final Response
"""

from agents.analyzer_agent import DataAnalyzerAgent
from agents.risk_agent import RiskAnalysisAgent
from agents.planner_agent import WellnessPlannerAgent
from agents.summary_agent import RMSummaryAgent


class Orchestrator:
    def __init__(self):
        self.analyzer = DataAnalyzerAgent()
        self.risk_agent = RiskAnalysisAgent()
        self.planner = WellnessPlannerAgent()
        self.summarizer = RMSummaryAgent()

    def process(self, user_data: dict) -> dict:
        """
        Multi-agent orchestration pipeline:
        1. DataAnalyzer extracts metrics
        2. RiskAgent determines risk profile
        3. PlannerAgent generates recommendations (with RAG)
        4. RMSummary creates relationship manager briefing
        """
        # Step 1: Analyze financial data
        analysis = self.analyzer.analyze(user_data)

        # Step 2: Assess risk profile
        risk_profile = self.risk_agent.assess(user_data, analysis)

        # Step 3: Generate recommendations
        plan = self.planner.plan(user_data, analysis, risk_profile)

        # Step 4: Create RM summary
        rm_summary = self.summarizer.summarize(user_data, analysis, risk_profile, plan)

        return {
            "savings_rate": analysis["savings_rate"],
            "monthly_net": analysis["monthly_net"],
            "spending_patterns": analysis["spending_patterns"],
            "risk_profile": risk_profile,
            "financial_strengths": plan["strengths"],
            "financial_gaps": plan["gaps"],
            "recommendations": plan["recommendations"],
            "rm_summary": rm_summary,
        }
