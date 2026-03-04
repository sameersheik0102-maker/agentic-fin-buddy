"""
RMSummaryAgent - Generates concise summary for relationship managers.
"""


class RMSummaryAgent:
    def summarize(self, data: dict, analysis: dict, risk_profile: str, plan: dict) -> str:
        return (
            f"Client earns ${data['monthly_income']:,.0f}/mo with a {analysis['savings_rate']}% savings rate. "
            f"Risk profile: {risk_profile}. "
            f"{len(plan['strengths'])} strengths, {len(plan['gaps'])} gaps identified. "
            f"Primary recommendation: {plan['recommendations'][0] if plan['recommendations'] else 'Maintain trajectory.'}"
        )
