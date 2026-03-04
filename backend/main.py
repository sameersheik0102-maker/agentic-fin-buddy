"""
Agentic Wealth Navigator - FastAPI Backend (Reference Code)
==========================================================
This is reference code for running a Python backend separately.
It is NOT executed by Lovable — run with: uvicorn main:app --reload

Architecture:
  User Input → DataAnalyzer → RiskAgent → PlannerAgent → RMSummary → Response
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.orchestrator import Orchestrator
from models.schemas import ChatRequest, FeedbackRequest
import json, os

app = FastAPI(title="Agentic Wealth Navigator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()

DB_DIR = os.path.join(os.path.dirname(__file__), "database")


def load_json(filename):
    path = os.path.join(DB_DIR, filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []


def save_json(filename, data):
    path = os.path.join(DB_DIR, filename)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


@app.post("/chat")
async def chat(request: ChatRequest):
    """Process user financial data through the multi-agent pipeline."""
    result = orchestrator.process(request.dict())
    # Save conversation
    convos = load_json("conversations.json")
    convos.append({"user_id": request.user_id, "input": request.dict(), "result": result})
    save_json("conversations.json", convos)
    return result


@app.get("/summary/{user_id}")
async def get_summary(user_id: str):
    """Return the latest financial wellness summary for a user."""
    convos = load_json("conversations.json")
    user_convos = [c for c in convos if c.get("user_id") == user_id]
    if not user_convos:
        return {"error": "No data found"}
    return user_convos[-1]["result"]


@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Store user feedback on recommendations."""
    feedback = load_json("feedback.json")
    feedback.append(request.dict())
    save_json("feedback.json", feedback)
    return {"status": "saved"}


@app.get("/history/{user_id}")
async def get_history(user_id: str):
    """Return conversation history for a user."""
    convos = load_json("conversations.json")
    return [c for c in convos if c.get("user_id") == user_id]
