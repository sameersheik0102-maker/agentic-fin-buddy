"""
RAG Service - Retrieves relevant financial knowledge from the knowledge base.
"""

import json
import os


class RAGService:
    def __init__(self):
        kb_path = os.path.join(os.path.dirname(__file__), "..", "database", "financial_knowledge.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r") as f:
                self.knowledge = json.load(f)
        else:
            self.knowledge = {}

    def retrieve(self, risk_profile: str, savings_rate: float) -> list:
        """Retrieve relevant recommendations based on user context."""
        recs = []

        # Budgeting rules
        if savings_rate < 20:
            recs.append("Apply the 50/30/20 rule: 50% needs, 30% wants, 20% savings")

        # Risk-based allocation
        allocations = self.knowledge.get("investment_allocations", {})
        if risk_profile.lower() in allocations:
            alloc = allocations[risk_profile.lower()]
            recs.append(f"Suggested allocation: {alloc}")

        # General guidance
        for rule in self.knowledge.get("savings_benchmarks", []):
            if savings_rate < rule.get("threshold", 0):
                recs.append(rule.get("advice", ""))

        recs.append("Review recurring subscriptions quarterly")
        return recs
