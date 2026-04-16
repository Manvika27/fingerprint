from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from typing import Optional
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Fingerprint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fingerprint-seven.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EVENTS_DIR = os.path.join(os.path.dirname(__file__), "..", "events")

def load_event(event_id: str) -> dict:
    path = os.path.join(EVENTS_DIR, f"{event_id}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


@app.get("/api/events")
def list_events():
    events = []
    for filename in sorted(os.listdir(EVENTS_DIR)):
        if not filename.endswith(".json") or filename.endswith("_enrichment.json") or filename == "stubs.json":
            continue
        path = os.path.join(EVENTS_DIR, filename)
        try:
            with open(path) as f:
                event = json.load(f)
            events.append({
                "id": event["id"],
                "name": event["name"],
                "year": event["year"],
                "hazard_type": event["hazard_type"],
                "country": event["country"],
                "center": event.get("center"),
            })
        except Exception:
            continue

    stubs_path = os.path.join(EVENTS_DIR, "stubs.json")
    if os.path.exists(stubs_path):
        try:
            with open(stubs_path) as f:
                stubs = json.load(f)
            events.extend(stubs)
        except Exception:
            pass

    return events


@app.get("/api/events/{event_id}")
def get_event(event_id: str):
    event = load_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
    return event


@app.get("/api/events/{event_id}/response")
def get_event_response(event_id: str):
    event = load_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
    key_outcomes = event.get("response", {}).get("key_outcomes", [])
    return {
        "key_outcomes": key_outcomes,
        "news_articles": [],
        "humanitarian_reports": [],
    }


class AskRequest(BaseModel):
    event_id: str
    question: str
    conversation_history: Optional[list] = []


@app.post("/api/ask")
def ask(body: AskRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")
    from llm_agent import run_agent
    return run_agent(body.event_id, body.question, body.conversation_history)


@app.post("/api/press-pack")
async def press_pack(request: Request):
    body = await request.json()
    event_id = body.get("event_id")
    event = load_event(event_id)
    if not event:
        return JSONResponse({"error": "Event not found"}, status_code=404)
    from llm_agent import generate_press_pack
    result = await generate_press_pack(event)
    return JSONResponse(result)


@app.get("/api/events/{event_id}/download")
def download_event(event_id: str):
    event = load_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
    return Response(
        content=json.dumps(event, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={event_id}.json"},
    )
