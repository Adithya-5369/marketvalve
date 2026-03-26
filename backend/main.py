from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.market_agent import run_agent

app = FastAPI(title="MarketValve API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str
    portfolio: list = []

@app.post("/chat")
async def chat(query: Query):
    response = run_agent(query.message, query.portfolio)
    return {"response": response}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "MarketValve API"}