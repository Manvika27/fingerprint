import json
import os
from typing import Any

from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

# ---------------------------------------------------------------------------
# Hardcoded top-10 cumulative emitters (ClimateTrace / Global Carbon Project)
# Share = % of global cumulative CO2 emissions since industrialisation
# ---------------------------------------------------------------------------
CUMULATIVE_EMISSIONS = {
    "United States": {"share_pct": 25.0, "note": "Largest historical emitter"},
    "China": {"share_pct": 12.7, "note": "Largest current annual emitter; growing historical share"},
    "Russia": {"share_pct": 6.0, "note": "Includes Soviet-era emissions"},
    "Germany": {"share_pct": 5.5, "note": "Includes former East Germany"},
    "United Kingdom": {"share_pct": 4.6, "note": "First industrial nation; high per-capita historical share"},
    "Japan": {"share_pct": 3.8, "note": ""},
    "France": {"share_pct": 2.8, "note": ""},
    "Canada": {"share_pct": 2.2, "note": "High per-capita emissions"},
    "Ukraine": {"share_pct": 2.1, "note": "Includes Soviet-era emissions"},
    "Poland": {"share_pct": 2.0, "note": ""},
}


def _load_event(event_id: str) -> dict | None:
    events_dir = os.path.join(os.path.dirname(__file__), "..", "events")
    path = os.path.join(events_dir, f"{event_id}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Agent tools
# ---------------------------------------------------------------------------

@tool
def get_event_data(event_id: str) -> str:
    """Return the full event JSON for a given event ID. Use this to ground
    responses in real event data."""
    event = _load_event(event_id)
    if not event:
        return f"No event found with id '{event_id}'."
    return json.dumps(event, indent=2)


@tool
def get_attribution_context(event_id: str) -> str:
    """Return the attribution block and summary for a given event. Use this
    to answer questions about climate fingerprint and likelihood ratios."""
    event = _load_event(event_id)
    if not event:
        return f"No event found with id '{event_id}'."
    attr = event.get("attribution", {})
    return json.dumps({
        "event_name": event["name"],
        "year": event["year"],
        "attribution": attr,
    }, indent=2)


@tool
def get_response_thread(event_id: str) -> str:
    """Return key outcomes and top news headlines for a given event. Use
    this to answer questions about what followed the event and what changed."""
    event = _load_event(event_id)
    if not event:
        return f"No event found with id '{event_id}'."
    outcomes = event.get("response", {}).get("key_outcomes", [])
    return json.dumps({
        "event_name": event["name"],
        "key_outcomes": outcomes,
        "note": "Live news articles are fetched separately via GDELT and NewsAPI.",
    }, indent=2)


@tool
def get_emissions_context(country: str) -> str:
    """Return cumulative historical emissions share for a country. Use this
    to answer 'who is responsible' questions. Always use cumulative historical
    emissions, not current annual emissions."""
    result = CUMULATIVE_EMISSIONS.get(country)
    if result:
        return json.dumps({"country": country, **result})
    # Fuzzy match on partial name
    for name, data in CUMULATIVE_EMISSIONS.items():
        if country.lower() in name.lower() or name.lower() in country.lower():
            return json.dumps({"country": name, **data})
    top10 = [
        {"country": k, "share_pct": v["share_pct"]}
        for k, v in sorted(CUMULATIVE_EMISSIONS.items(), key=lambda x: -x[1]["share_pct"])
    ]
    return json.dumps({
        "note": f"No data for '{country}'. Top 10 cumulative emitters shown.",
        "top_10": top10,
    })


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are the reasoning layer of Fingerprint, a climate attribution explorer.
You answer questions about extreme weather events using verified attribution science,
sourced impact data, and tracked accountability outcomes.

ACCURACY RULES — these are non-negotiable:
1. Every factual claim must be grounded in the event data provided to you via tools.
   Do not add statistics, dates, or outcomes that are not in the tool results.
2. For every claim you make, cite the source by name. If the source is a URL in the
   event data, include it. If no source is available, say so explicitly.
3. Never state that a single actor solely caused or led a policy outcome. Use precise
   language: "was among the leading advocates for", "played a significant role in",
   "was a key proponent of" — not "led" or "created" unless the source directly says so.
4. Distinguish between official figures and estimated figures. If a number comes from
   a PDNA or NDMA report, say so. If it comes from news aggregation, say so.
   If the true figure is likely higher due to underreporting, say that too.
5. For heatwave death tolls specifically: always note that heat-related deaths are
   severely undercounted, particularly in the Global South. Official figures are floors,
   not totals.
6. Confidence levels: use 'high' only when the source is a peer-reviewed study or
   official government/UN assessment with a named methodology. Use 'medium' for
   news-aggregated or observational analysis. Use 'low' for estimates or extrapolations.
7. When uncertain, say so directly. 'The evidence suggests' is better than a false assertion.
   'This is not yet confirmed' is better than silence.
8. Tone: clear, direct, and humane. Not academic, not alarmist. You are explaining
   a real event to a person who wants to understand it.

RESPONSE FORMAT:
- Answer in 3-6 sentences unless the question genuinely requires more.
- End every response with a sources line listing the named sources you drew from.
- Include a confidence field: high, medium, or low, with a one-line reason.
"""

# ---------------------------------------------------------------------------
# Agent factory
# ---------------------------------------------------------------------------

def build_agent():
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0,
    )
    tools = [get_event_data, get_attribution_context, get_response_thread, get_emissions_context]
    return create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)


# Singleton — built once on import
_agent = None

def get_agent():
    global _agent
    if _agent is None:
        _agent = build_agent()
    return _agent


# ---------------------------------------------------------------------------
# Public interface called from main.py
# ---------------------------------------------------------------------------

def run_agent(event_id: str, question: str, conversation_history: list) -> dict:
    agent = get_agent()

    context_prefix = (
        f"The user is currently viewing the event with id '{event_id}'. "
        f"Use this event_id when calling tools unless the question explicitly refers to a different event. "
        f"Question: "
    )
    messages = list(conversation_history) + [{"role": "user", "content": context_prefix + question}]

    result = agent.invoke({"messages": messages})

    all_messages = result["messages"]
    final = all_messages[-1]
    answer = final.content if hasattr(final, "content") else str(final)

    # Extract tool names used as sources
    sources = []
    for msg in all_messages:
        if hasattr(msg, "name") and msg.name:
            label = {
                "get_event_data": "Event data",
                "get_attribution_context": "World Weather Attribution",
                "get_response_thread": "Key outcomes / GDELT",
                "get_emissions_context": "ClimateTrace cumulative emissions",
            }.get(msg.name, msg.name)
            if label not in sources:
                sources.append(label)

    # Confidence heuristic: based on tool usage
    if "get_attribution_context" in [getattr(m, "name", "") for m in all_messages]:
        confidence = "high"
    elif sources:
        confidence = "medium"
    else:
        confidence = "low"

    # Build updated history (keep last 10 turns to avoid runaway context)
    updated_history = [
        {"role": m.type if hasattr(m, "type") else "assistant", "content": m.content}
        for m in all_messages
        if hasattr(m, "content") and m.content
    ][-10:]

    return {
        "answer": answer,
        "sources": sources,
        "confidence": confidence,
        "conversation_history": updated_history,
    }


# ---------------------------------------------------------------------------
# Press pack generator
# ---------------------------------------------------------------------------

import anthropic as _anthropic

async def generate_press_pack(event: dict) -> dict:
    client = _anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    event_id = event.get("id", "unknown")

    prompt = f"""Generate a journalist press pack for this climate event.
Event data: {json.dumps(event, indent=2)}

Return JSON only with these fields:
{{
  "headline": "a single sharp headline a journalist could use",
  "standfirst": "one sentence summary suitable as article standfirst",
  "key_facts": [
    "Fact 1 with source in brackets e.g. [WWA 2022]",
    "Fact 2 with source",
    "Fact 3 with source",
    "Fact 4 with source",
    "Fact 5 with source"
  ],
  "citable_attribution": "A single sentence stating the attribution finding, suitable for direct use in an article, with full citation.",
  "story_angles": [
    {{"angle": "angle title", "description": "2 sentence description of this story angle"}},
    {{"angle": "angle title", "description": "2 sentence description"}},
    {{"angle": "angle title", "description": "2 sentence description"}}
  ],
  "primary_source_url": "the main WWA study URL",
  "data_download_url": "/api/events/{event_id}"
}}

Rules: every fact must be sourced from the event data provided. Do not invent statistics.
Cite sources by name. The citable_attribution sentence must include the WWA study year."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.content[0].text.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
