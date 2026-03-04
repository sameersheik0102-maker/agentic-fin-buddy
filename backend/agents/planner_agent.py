"""
WellnessPlannerAgent - Generates budgeting and investment recommendations using RAG knowledge.
"""

from services.rag_service import RAGService


class WellnessPlannerAgent:
    def __init__(self):
        self.rag = RAGService()

    def plan(self, data: dict, analysis: dict, risk_profile: str) -> dict:
        strengths, gaps, recommendations = [], [], []
        savings_rate = analysis["savings_rate"]
        emergency_months = data.get("savings", 0) / max(data.get("monthly_expenses", 1), 1)

        if savings_rate >= 20:
            strengths.append("Excellent savings rate above 20%")
        elif savings_rate >= 10:
            strengths.append("Decent savings rate above 10%")
        else:
            gaps.append(f"Low savings rate of {savings_rate}%")

        if emergency_months >= 6:
            strengths.append(f"Strong emergency fund ({round(emergency_months)} months)")
        else:
            gaps.append(f"Emergency fund only covers {round(emergency_months, 1)} months")

        # RAG-enhanced recommendations
        knowledge = self.rag.retrieve(risk_profile, savings_rate)
        recommendations.extend(knowledge)

        return {"strengths": strengths, "gaps": gaps, "recommendations": recommendations}
