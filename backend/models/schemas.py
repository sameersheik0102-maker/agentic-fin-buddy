"""Pydantic schemas for API request/response models."""

from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    user_id: str
    monthly_income: float
    monthly_expenses: float
    savings: float
    investment_goals: str
    risk_tolerance: str  # "low", "medium", "high"


class FeedbackRequest(BaseModel):
    user_id: str
    recommendation_id: Optional[str] = None
    rating: int  # 1-5
    comment: Optional[str] = None
