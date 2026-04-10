import json, sys, os, httpx
from pathlib import Path
from dotenv import load_dotenv
# .env lives in backend/, one level above this script
load_dotenv(Path(__file__).parent.parent / ".env")

event_id = sys.argv[1]
event_path = Path(f"../events/{event_id}.json")
event = json.loads(event_path.read_text())
print(f"Loaded event: {event['name']} {event['year']}")


# ---------------------------------------------------------------------------
# Step 2 — Curated coverage fetch
# ---------------------------------------------------------------------------

def fetch_gdelt_impact(event):
    curated = event.get("curated_coverage", [])
    if not curated:
        print("  No curated_coverage entries in event JSON")
        return []

    results = []
    for entry in curated:
        url = entry.get("url", "")
        domain = url.split("/")[2] if url.startswith("http") else ""
        text = None
        try:
            resp = httpx.get(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; fingerprint-enrichment/1.0)"},
                follow_redirects=True,
                timeout=10,
            )
            if resp.status_code == 200:
                # Strip HTML tags with a simple regex to get readable text
                import re
                raw = resp.text
                # Remove scripts and styles entirely
                raw = re.sub(r"<(script|style)[^>]*>.*?</(script|style)>", "", raw, flags=re.S | re.I)
                # Strip remaining tags
                raw = re.sub(r"<[^>]+>", " ", raw)
                # Collapse whitespace
                text = re.sub(r"\s+", " ", raw).strip()[:3000]
                print(f"  Fetched: {domain} ({len(text)} chars)")
            else:
                print(f"  {domain}: HTTP {resp.status_code}")
        except Exception as e:
            print(f"  {domain}: {e}")

        results.append({
            "title": entry.get("title") or entry.get("headline"),
            "url": url,
            "domain": domain,
            "seendate": None,
            "body_text": text,
        })

    return results


# ---------------------------------------------------------------------------
# Step 3 — ReliefWeb
# ---------------------------------------------------------------------------

def fetch_reliefweb_updates(event):
    appname = os.getenv("RELIEFWEB_APPNAME", "fingerprint-enrichment")
    country_code = event["response"]["reliefweb_country_code"]
    query = event["response"]["reliefweb_query"]
    date_start = event["response"]["gdelt_date_start"]  # e.g. "2022-08-01"
    date_end = event["response"]["gdelt_date_end"]      # e.g. "2023-06-01"

    payload = {
        "query": {"value": query, "operator": "AND"},
        "filter": {
            "operator": "AND",
            "conditions": [
                {"field": "primary_country.iso3", "value": country_code},
                {"field": "date.created", "value": {"from": f"{date_start}T00:00:00+00:00", "to": f"{date_end}T23:59:59+00:00"}}
            ]
        },
        "fields": {"include": ["title", "date.created", "source.name", "url_alias", "body-html"]},
        "limit": 15,
        "sort": ["date.created:desc"]
    }

    try:
        resp = httpx.post(
            f"https://api.reliefweb.int/v2/reports?appname={appname}",
            json=payload,
            timeout=15
        )
        data = resp.json()
        reports = data.get("data", [])
        print(f"  ReliefWeb: {len(reports)} situation reports ({date_start} → {date_end})")
        return reports
    except Exception as e:
        print(f"  ReliefWeb error: {e}")
        return []


# ---------------------------------------------------------------------------
# Step 4 — LLM extraction
# ---------------------------------------------------------------------------

import anthropic

def extract_figures_from_articles(event, articles, reports):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    official = event.get("human_impact", {})
    official_deaths = official.get("deaths")
    official_affected = official.get("people_affected")

    article_texts = []
    for a in articles[:15]:
        title = a.get("title", "")
        url = a.get("url", "")
        domain = a.get("domain", "")
        body = a.get("body_text") or ""
        if title:
            entry = f"SOURCE: {domain}\nURL: {url}\nTITLE: {title}"
            if body:
                entry += f"\nCONTENT: {body[:1500]}"
            article_texts.append(entry)

    import re
    for r in reports[:5]:
        fields = r.get("fields", {})
        title = fields.get("title", "")
        source = fields.get("source", [{}])
        source_name = source[0].get("name", "") if source else ""
        url = fields.get("url_alias", "")
        body_html = fields.get("body-html", "") or ""
        # Strip HTML tags and collapse whitespace
        body_text = re.sub(r"<[^>]+>", " ", body_html)
        body_text = re.sub(r"\s+", " ", body_text).strip()[:3000]
        if title:
            entry = f"SOURCE: {source_name}\nURL: {url}\nTITLE: {title}"
            if body_text:
                entry += f"\nCONTENT: {body_text}"
            article_texts.append(entry)

    combined_text = "\n\n".join(article_texts)

    prompt = f"""You are analyzing news coverage of a climate disaster to extract impact figures
that may not appear in official assessments.

Event: {event['name']} {event['year']} in {event['country']}
Official death count: {official_deaths}
Official people affected: {official_affected}

Here are article titles and sources from local and international press:

{combined_text}

Extract the following from these sources:
1. Any death counts mentioned, with the source name and URL
2. Any displacement figures mentioned, with source
3. Any counts of deaths specifically excluded from official figures
   (e.g. heatstroke deaths, disease deaths weeks after the event)
4. Any figures from local/regional sources that differ from national official counts
5. Evidence of underreporting or data gaps explicitly mentioned

Respond in JSON format only:
{{
  "news_reported_deaths": {{
    "figure": <number or null>,
    "range_low": <number or null>,
    "range_high": <number or null>,
    "sources": [
      {{"name": "source name", "url": "url", "figure_mentioned": <number>}}
    ],
    "notes": "explanation of how this differs from official count"
  }},
  "underreporting_evidence": [
    "direct quote or paraphrase from a source about undercounting"
  ],
  "additional_figures": [
    {{"type": "description", "figure": "value", "source": "name", "url": "url"}}
  ],
  "data_quality_notes": "overall assessment of data completeness for this event"
}}

Return JSON only, no preamble."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"  LLM extraction error: {e}")
        return {}


# ---------------------------------------------------------------------------
# Step 5 — Write enrichment report
# ---------------------------------------------------------------------------

def write_enrichment_report(event_id, event, articles, reports, extracted):
    report = {
        "event_id": event_id,
        "enrichment_date": __import__("datetime").datetime.now().isoformat(),
        "status": "PENDING_REVIEW",
        "instructions": (
            "Review this file carefully before incorporating any figures into "
            "the main event JSON. Every figure here comes from news aggregation "
            "and LLM extraction — not from verified official sources. "
            "Add source URLs to anything you incorporate."
        ),
        "official_figures": {
            "deaths": event.get("human_impact", {}).get("deaths"),
            "people_affected": event.get("human_impact", {}).get("people_affected"),
            "source": event.get("human_impact", {}).get("source"),
            "source_url": event.get("human_impact", {}).get("source_url")
        },
        "news_aggregated": extracted,
        "gdelt_articles_found": len(articles),
        "reliefweb_reports_found": len(reports),
        "top_articles": [
            {
                "title": a.get("title"),
                "url": a.get("url"),
                "domain": a.get("domain"),
                "date": a.get("seendate")
            }
            for a in articles[:10]
        ]
    }

    output_path = Path(f"../events/{event_id}_enrichment.json")
    output_path.write_text(json.dumps(report, indent=2))
    print(f"\nEnrichment report written to {output_path}")
    print("Review this file before incorporating any figures into the event JSON.")
    return report


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print(f"\nEnriching event: {event_id}")
    print("Step 1: Fetching GDELT articles...")
    articles = fetch_gdelt_impact(event)
    print("Step 2: Fetching ReliefWeb situation reports...")
    reports = fetch_reliefweb_updates(event)
    print("Step 3: Extracting figures with LLM...")
    extracted = extract_figures_from_articles(event, articles, reports)
    print("Step 4: Writing enrichment report...")
    write_enrichment_report(event_id, event, articles, reports, extracted)
    print(f"\nDone. Next step: review events/{event_id}_enrichment.json")
    print("Then manually update the event JSON with verified figures.")
