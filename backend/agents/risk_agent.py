"""
RiskAnalysisAgent - Determines financial risk profile based on savings, income, and tolerance.
"""


class RiskAnalysisAgent:
    def assess(self, data: dict, analysis: dict) -> str:
        savings = data.get("savings", 0)
        expenses = data.get("monthly_expenses", 1)
        tolerance = data.get("risk_tolerance", "medium")
        emergency_months = savings / expenses if expenses > 0 else 0

        if tolerance == "low" and emergency_months >= 6 and analysis["savings_rate"] >= 20:
            return "Low"
        if emergency_months < 2 or analysis["savings_rate"] < 5:
            return "High"
        return "Medium"
