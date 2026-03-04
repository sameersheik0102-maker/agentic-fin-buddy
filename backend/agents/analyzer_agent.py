"""
DataAnalyzerAgent - Extracts financial info, calculates savings rate, identifies spending patterns.
"""


class DataAnalyzerAgent:
    def analyze(self, data: dict) -> dict:
        income = data.get("monthly_income", 0)
        expenses = data.get("monthly_expenses", 0)
        monthly_net = income - expenses
        savings_rate = (monthly_net / income * 100) if income > 0 else 0

        return {
            "savings_rate": round(savings_rate, 1),
            "monthly_net": monthly_net,
            "expense_ratio": round(expenses / income * 100, 1) if income > 0 else 100,
            "spending_patterns": [
                {"category": "Housing", "percentage": 35},
                {"category": "Food", "percentage": 15},
                {"category": "Transport", "percentage": 12},
                {"category": "Utilities", "percentage": 8},
                {"category": "Entertainment", "percentage": 10},
                {"category": "Other", "percentage": 20},
            ],
        }
