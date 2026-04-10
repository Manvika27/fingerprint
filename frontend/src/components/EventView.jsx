import { useState, useEffect, useRef, useCallback } from "react";

// ─── Custom before/after slider (replaces react-compare-image) ────────────────

function BeforeAfterSlider({ leftImage, rightImage }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return;
      updatePosition(e.touches ? e.touches[0].clientX : e.clientX);
    }
    function onUp() { dragging.current = false; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", userSelect: "none", cursor: "col-resize" }}
      onMouseDown={e => { dragging.current = true; updatePosition(e.clientX); }}
      onTouchStart={e => { dragging.current = true; updatePosition(e.touches[0].clientX); }}
    >
      {/* After image (full, underneath) */}
      <img src={rightImage} alt="After" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Before image (clipped to left of slider) */}
      <div style={{ position: "absolute", inset: 0, width: `${position}%`, overflow: "hidden" }}>
        <img src={leftImage} alt="Before" style={{ position: "absolute", top: 0, left: 0, width: containerRef.current?.offsetWidth ?? 800, height: "100%", maxWidth: "none", objectFit: "cover" }} />
      </div>
      {/* Divider line */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${position}%`, width: 2, background: "rgba(255,255,255,0.8)", transform: "translateX(-50%)", pointerEvents: "none" }} />
      {/* Handle */}
      <div style={{
        position: "absolute", top: "50%", left: `${position}%`,
        transform: "translate(-50%, -50%)",
        width: 32, height: 32, borderRadius: "50%",
        background: "white", border: "2px solid #1D9E75",
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M4 4l-3 3 3 3M10 4l3 3-3 3" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Corner labels */}
      <span style={{ position: "absolute", bottom: 8, left: 10, fontSize: 10, background: "rgba(0,0,0,0.5)", color: "white", padding: "2px 6px", borderRadius: 4, pointerEvents: "none" }}>Before</span>
      <span style={{ position: "absolute", bottom: 8, right: 10, fontSize: 10, background: "rgba(0,0,0,0.5)", color: "white", padding: "2px 6px", borderRadius: 4, pointerEvents: "none" }}>After</span>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HAZARD_BADGE_STYLE = {
  flood:     { bg: "rgba(55,138,221,0.2)",  color: "#85B7EB",  border: "rgba(55,138,221,0.25)" },
  heatwave:  { bg: "rgba(239,159,39,0.2)",  color: "#F5C97A",  border: "rgba(239,159,39,0.25)" },
  hurricane: { bg: "rgba(127,119,221,0.2)", color: "#B3AEED",  border: "rgba(127,119,221,0.25)" },
  wildfire:  { bg: "rgba(239,120,39,0.2)",  color: "#F5A97A",  border: "rgba(239,120,39,0.25)" },
  drought:   { bg: "rgba(139,69,19,0.2)",   color: "#C49A6C",  border: "rgba(139,69,19,0.25)" },
  cyclone:   { bg: "rgba(29,158,117,0.2)",  color: "#5DCAA5",  border: "rgba(29,158,117,0.25)" },
};

const SIDEBAR_BADGE = {
  flood:     { bg: "#E6F1FB", color: "#185FA5" },
  heatwave:  { bg: "#FAEEDA", color: "#854F0B" },
  hurricane: { bg: "#EEEDFE", color: "#534AB7" },
  wildfire:  { bg: "#FEF0E6", color: "#8B3A0F" },
  drought:   { bg: "#F5EDE4", color: "#4a2508" },
  cyclone:   { bg: "#E1F5EE", color: "#0F6E56" },
};

// Sidebar country group display order
const COUNTRY_GROUP_ORDER = [
  "Pakistan",
  "India",
  "USA",
  "Canada",
  "United Kingdom",
  "Somalia, Ethiopia, Kenya",
  "Madagascar, Mozambique",
];

const OUTCOME_DOT = {
  policy:    "#1D9E75",
  litigation:"#534AB7",
  aid:       "#BA7517",
};

const STATUS_STYLE = {
  Active:    { bg: "#E1F5EE", color: "#0F6E56" },
  Ongoing:   { bg: "#E1F5EE", color: "#0F6E56" },
  Delivered: { bg: "#EAF3DE", color: "#3B6D11" },
  Stalled:   { bg: "#F1EFE8", color: "#5F5E5A" },
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 12, fontWeight: 500, color: "#444441",
    textTransform: "uppercase", letterSpacing: "0.08em",
    marginBottom: "1rem", marginTop: "2rem",
  }}>
    {children}
  </div>
);

// Format large numbers: 1.3B, 33M, etc.
function fmtNum(n, prefix = "") {
  if (n == null) return null;
  if (n >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${prefix}${(n / 1_000).toFixed(0)}K`;
  return `${prefix}${n.toLocaleString()}`;
}

// Build the stat rows for the human impact section, skipping nulls
function buildImpactStats(impact) {
  const rows = [];
  if (impact.people_affected != null)
    rows.push({ num: fmtNum(impact.people_affected), label: "people affected", ctx: impact.context?.people_affected, red: false });
  if (impact.deaths != null)
    rows.push({ num: impact.deaths.toLocaleString(), label: "deaths recorded", ctx: impact.context?.deaths, red: true });
  if (impact.displaced != null && impact.displaced > 0)
    rows.push({ num: fmtNum(impact.displaced), label: "people displaced", ctx: impact.context?.displaced, red: false });
  if (impact.economic_loss_usd != null)
    rows.push({
      num: fmtNum(impact.economic_loss_usd, "$"),
      label: "economic loss",
      ctx: impact.gdp_usd ? `${((impact.economic_loss_usd / impact.gdp_usd) * 100).toFixed(1)}% of annual GDP` : impact.context?.economic_loss_usd,
      red: false,
    });
  return rows;
}

// Wraps key phrases in a teal highlight span
function highlightSummary(text, pct) {
  const phrases = [`${pct}% more likely`, "extreme rainfall"];
  const HL = { background: "#E1F5EE", color: "#085041", padding: "1px 4px", borderRadius: 3 };
  let parts = [text];
  phrases.forEach(phrase => {
    parts = parts.flatMap(part => {
      if (typeof part !== "string") return [part];
      const idx = part.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx === -1) return [part];
      return [
        part.slice(0, idx),
        <span key={phrase} style={HL}>{part.slice(idx, idx + phrase.length)}</span>,
        part.slice(idx + phrase.length),
      ].filter(s => s !== "");
    });
  });
  return <>{parts}</>;
}

function PlaceholderPhoto({ caption }) {
  return (
    <div style={{
      background: "#D6E4ED", borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "100%", height: "100%",
    }}>
      <span style={{ fontSize: 11, color: "#7A9DAE", textAlign: "center", padding: "0 8px" }}>{caption}</span>
    </div>
  );
}

function PhotoFrame({ photo, height }) {
  const [errored, setErrored] = useState(false);
  return (
    <div style={{ position: "relative", height, borderRadius: 8, overflow: "hidden" }}>
      {errored ? (
        <PlaceholderPhoto caption={photo.caption} />
      ) : (
        <img
          src={`/imagery/${photo.file}`}
          alt={photo.caption}
          onError={() => setErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
      {!errored && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "4px 8px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
          fontSize: 9, color: "rgba(255,255,255,0.8)",
        }}>
          {photo.caption}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ currentEvent, events, onSelect, onBack, onAbout }) {
  const groupMap = events.reduce((acc, e) => {
    if (!acc[e.country]) acc[e.country] = [];
    acc[e.country].push(e);
    return acc;
  }, {});

  // Render in defined order, then append any unknown countries at the end
  const orderedKeys = [
    ...COUNTRY_GROUP_ORDER.filter(k => groupMap[k]),
    ...Object.keys(groupMap).filter(k => !COUNTRY_GROUP_ORDER.includes(k)),
  ];
  const grouped = Object.fromEntries(orderedKeys.map(k => [k, groupMap[k]]));

  const [open, setOpen] = useState(() => Object.fromEntries(Object.keys(grouped).map(k => [k, true])));

  return (
    <div style={{
      width: 220, height: "100vh", position: "sticky", top: 0,
      borderRight: "0.5px solid #E8E6E0",
      display: "flex", flexDirection: "column",
      background: "white", flexShrink: 0, overflow: "hidden",
    }}>
      <div style={{ padding: "1.25rem 1rem 1rem", borderBottom: "0.5px solid #E8E6E0" }}>
        <button onClick={onBack} style={{
          fontSize: 11, color: "#B4B2A9", background: "none",
          border: "none", cursor: "pointer", marginBottom: "1rem",
          display: "block", padding: 0,
        }}>
          ← All events
        </button>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#2C2C2A" }}>Fingerprint</div>
        <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 2 }}>Climate attribution explorer</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0.75rem", display: "flex", flexDirection: "column" }}>
        {Object.entries(grouped).map(([country, items]) => (
          <div key={country} style={{ marginBottom: "0.5rem" }}>
            <button
              onClick={() => setOpen(o => ({ ...o, [country]: !o[country] }))}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between",
                alignItems: "center", background: "none", border: "none",
                cursor: "pointer", padding: "4px 6px",
                fontSize: 10, fontWeight: 500, color: "#B4B2A9",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}
            >
              {country}
              <span style={{ fontSize: 10, transition: "transform 0.2s", display: "inline-block", transform: open[country] ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
            </button>

            <div style={{
              maxHeight: open[country] ? 300 : 0,
              overflow: "hidden",
              transition: "max-height 0.25s ease",
            }}>
              {items.map(e => {
                const selected = e.id === currentEvent.id;
                const badge = SIDEBAR_BADGE[e.hazard_type] ?? { bg: "#F0F0F0", color: "#555" };
                return (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "7px 10px", borderRadius: 7,
                      cursor: "pointer", border: "none",
                      background: selected ? "#E1F5EE" : "transparent",
                      marginBottom: 2,
                    }}
                    onMouseEnter={e2 => !selected && (e2.currentTarget.style.background = "#F5F5F3")}
                    onMouseLeave={e2 => !selected && (e2.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: selected ? "#085041" : "#2C2C2A", fontWeight: selected ? 500 : 400 }}>
                        {e.name}
                      </span>
                      <span style={{ fontSize: 11, color: selected ? "#0F6E56" : "#B4B2A9" }}>{e.year}</span>
                    </div>
                    <span style={{
                      fontSize: 9, padding: "2px 7px", borderRadius: 99,
                      background: badge.bg, color: badge.color,
                      display: "inline-block", marginTop: 3,
                    }}>
                      {e.hazard_type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={onAbout}
          style={{
            fontSize: 11, color: "#B4B2A9", background: "none",
            border: "none", cursor: "pointer", padding: "8px 6px",
            textAlign: "left", width: "100%",
          }}
        >
          About Fingerprint
        </button>
      </div>
    </div>
  );
}

// ─── Main EventView ────────────────────────────────────────────────────────────

export default function EventView({ event, events, onBack, onSelect, onAbout }) {
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [history, setHistory] = useState([]);
  const [satelliteReady, setSatelliteReady] = useState(false);
  const [satelliteError, setSatelliteError] = useState(false);
  const [methodExpanded, setMethodExpanded] = useState(false);
  const [pressPackOpen, setPressPackOpen] = useState(false);
  const [pressPackData, setPressPackData] = useState(null);
  const [pressPackLoading, setPressPackLoading] = useState(false);
  const scrollRef = useRef(null);

  // Preload satellite images to detect failures before passing to ReactCompareImage
  useEffect(() => {
    setSatelliteReady(false);
    setSatelliteError(false);
    const beforeSrc = `/imagery/${event.id}_before.png`;
    const afterSrc  = `/imagery/${event.id}_after.png`;
    let loaded = 0;
    let failed = false;
    function onLoad() { loaded++; if (loaded === 2 && !failed) setSatelliteReady(true); }
    function onError() { if (!failed) { failed = true; setSatelliteError(true); } }
    const b = new Image(); b.onload = onLoad; b.onerror = onError; b.src = beforeSrc;
    const a = new Image(); a.onload = onLoad; a.onerror = onError; a.src = afterSrc;
  }, [event.id]);

  useEffect(() => {
    setArticlesLoading(true);
    fetch(`/api/events/${event.id}/response`)
      .then(r => r.json())
      .then(data => setArticles(data.news_articles ?? []))
      .catch(() => setArticles([]))
      .finally(() => setArticlesLoading(false));
  }, [event.id]);

  useEffect(() => {
    setAnswer(null);
    setHistory([]);
    setQuestion("");
    setMethodExpanded(false);
    setPressPackOpen(false);
    setPressPackData(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [event.id]);

  async function handleAsk() {
    if (!question.trim() || asking) return;
    const q = question;
    setQuestion("");
    setAsking(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id, question: q, conversation_history: history }),
      });
      const data = await res.json();
      setAnswer(data);
      setHistory(data.conversation_history ?? []);
    } catch {
      setAnswer({ answer: "Failed to reach the server.", sources: [], confidence: "low" });
    } finally {
      setAsking(false);
    }
  }

  async function handlePressPackClick() {
    setPressPackOpen(true);
    if (pressPackData) return;
    setPressPackLoading(true);
    try {
      const res = await fetch("/api/press-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id }),
      });
      const data = await res.json();
      setPressPackData(data);
    } catch {
      setPressPackData({ error: "Failed to generate press pack." });
    } finally {
      setPressPackLoading(false);
    }
  }

  function handleCopyPressPack() {
    if (!pressPackData) return;
    const text = [
      pressPackData.headline,
      "",
      pressPackData.standfirst,
      "",
      "KEY FACTS",
      ...(pressPackData.key_facts ?? []).map((f, i) => `${i + 1}. ${f}`),
      "",
      "ATTRIBUTION",
      pressPackData.citable_attribution,
      "",
      "STORY ANGLES",
      ...(pressPackData.story_angles ?? []).map(a => `• ${a.angle}: ${a.description}`),
      "",
      `Source: ${pressPackData.primary_source_url}`,
      `Data: ${pressPackData.data_download_url}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
  }

  const badgeStyle = HAZARD_BADGE_STYLE[event.hazard_type] ?? HAZARD_BADGE_STYLE.flood;
  const impact = event.human_impact ?? {};
  const beforeUrl = `/imagery/${event.id}_before.png`;
  const afterUrl  = `/imagery/${event.id}_after.png`;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif", background: "#FAFAF8" }}>
      <Sidebar currentEvent={event} events={events} onBack={onBack} onSelect={onSelect} onAbout={onAbout} />

      {/* Scrollable main column */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* ── Section 1: Satellite hero ── */}
        <div style={{ height: 280, position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <button
            onClick={handlePressPackClick}
            style={{
              position: "absolute", top: 14, right: 14, zIndex: 10,
              fontSize: 11, padding: "5px 12px",
              background: "rgba(255,255,255,0.15)",
              border: "0.5px solid rgba(255,255,255,0.3)",
              borderRadius: 99, color: "rgba(255,255,255,0.85)",
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              backdropFilter: "blur(4px)",
            }}
          >
            Press pack
          </button>
          {satelliteReady ? (
            <BeforeAfterSlider leftImage={beforeUrl} rightImage={afterUrl} />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: event.hazard_type === "heatwave" || event.hazard_type === "drought"
                ? "linear-gradient(135deg, #1a2a1a 0%, #2a4a2a 100%)"
                : event.hazard_type === "wildfire"
                  ? "linear-gradient(135deg, #1a1200 0%, #3a2800 100%)"
                  : "linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.6, padding: "0 2rem" }}>
                {event.satellite?.description}
              </span>
              {event.satellite?.status === "pending_export" && (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>
                  Imagery export in progress
                </span>
              )}
            </div>
          )}

          {/* Overlay */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
            padding: "1.25rem 1.75rem",
            background: "linear-gradient(transparent, rgba(13,31,45,0.92))",
            pointerEvents: "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 10, padding: "2px 9px", borderRadius: 99,
                background: badgeStyle.bg, color: badgeStyle.color,
                fontWeight: 500, border: `0.5px solid ${badgeStyle.border}`,
              }}>
                {event.hazard_type.charAt(0).toUpperCase() + event.hazard_type.slice(1)}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                {event.country} · {event.year}
              </span>
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 26, fontWeight: 400, color: "white", lineHeight: 1.2, marginBottom: 4,
            }}>
              {event.headline ?? event.name}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
              {event.satellite?.data_source}{satelliteReady ? " · drag to compare" : ""} · {event.satellite?.description}
            </div>
          </div>
        </div>

        {/* ── Section 2: Injustice bar ── */}
        <div style={{
          background: "#0d1f2d", padding: "1.25rem 1.75rem",
          display: "grid", gridTemplateColumns: "1fr 32px 1fr",
          alignItems: "center", borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, color: "#F09595", lineHeight: 1 }}>
              {impact.emitters_share_pct}%
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.4 }}>
              of global cumulative emissions<br />from {event.country}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M12 6l4 4-4 4" stroke="#F09595" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, color: "#5DCAA5", lineHeight: 1 }}>
              {impact.people_affected != null ? fmtNum(impact.people_affected) : "—"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.4 }}>
              people lost homes,<br />crops, and livelihoods
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 3, fontStyle: "italic", lineHeight: 1.4 }}>
              The countries most responsible bore none of this cost.
            </div>
          </div>
        </div>

        {/* ── Section 3: Pull quote ── */}
        {event.quote && (
          <div style={{
            background: "#0d1f2d", padding: "1.25rem 1.75rem 1.5rem",
            borderBottom: "0.5px solid rgba(255,255,255,0.06)", flexShrink: 0,
          }}>
            <blockquote style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 16, fontStyle: "italic",
              color: "rgba(255,255,255,0.8)", lineHeight: 1.65,
              paddingLeft: "1rem", borderLeft: "2px solid #1D9E75",
              margin: 0,
            }}>
              "{event.quote.text}"
            </blockquote>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8, paddingLeft: "1rem" }}>
              {event.quote.attribution}
            </div>
          </div>
        )}

        {/* ── Sections 4+ on light background ── */}
        <div style={{ padding: "0 1.75rem 6rem", flex: 1 }}>

          {/* Section 4: The science */}
          <SectionLabel top="1.75rem">The science</SectionLabel>
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            {/* Left column */}
            <div style={{ flexShrink: 0 }}>
              {/* Case A: standard likelihood_pct_increase */}
              {event.attribution.likelihood_pct_increase != null && (
                <>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 88, fontWeight: 400, color: "#1D9E75", lineHeight: 1 }}>
                    +{event.attribution.likelihood_pct_increase}%
                  </div>
                  <div style={{ fontSize: 14, color: "#5F5E5A", marginTop: 4 }}>more likely due to climate change</div>
                </>
              )}
              {/* Case B: storyline — rainfall_increase_pct only */}
              {event.attribution.rainfall_increase_pct != null && event.attribution.likelihood_pct_increase == null && (
                <>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 88, fontWeight: 400, color: "#1D9E75", lineHeight: 1 }}>
                    +{event.attribution.rainfall_increase_pct}%
                  </div>
                  <div style={{ fontSize: 14, color: "#5F5E5A", marginTop: 4 }}>heavier rainfall due to climate change</div>
                  <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6, lineHeight: 1.5, maxWidth: 160 }}>
                    Storyline method — measures intensity increase rather than likelihood change
                  </div>
                </>
              )}
              {/* Case C: dual wildfire findings */}
              {event.attribution.likelihood_ratio_season != null && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 400, color: "#1D9E75", lineHeight: 1 }}>
                      {event.attribution.likelihood_ratio_season}×
                    </div>
                    <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 2 }}>more likely — season severity</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 400, color: "#1D9E75", lineHeight: 1 }}>
                      {event.attribution.likelihood_ratio_peak_weather}×
                    </div>
                    <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 2 }}>more likely — peak fire weather</div>
                  </div>
                </div>
              )}
              {/* Case D: qualitative finding only (cyclones) */}
              {event.attribution.finding != null && event.attribution.likelihood_ratio == null && event.attribution.likelihood_pct_increase == null && event.attribution.rainfall_increase_pct == null && event.attribution.likelihood_ratio_season == null && (
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22, fontWeight: 400, color: "#1D9E75", lineHeight: 1.4, maxWidth: 200,
                }}>
                  Rainfall intensity increased
                </div>
              )}
              {/* Standard likelihood_ratio (e.g. drought, uk heatwave) — only if no pct already shown */}
              {event.attribution.likelihood_ratio != null && event.attribution.likelihood_pct_increase == null && event.attribution.likelihood_ratio_season == null && (
                <>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 88, fontWeight: 400, color: "#1D9E75", lineHeight: 1 }}>
                    {event.attribution.likelihood_ratio}×
                  </div>
                  <div style={{ fontSize: 14, color: "#5F5E5A", marginTop: 4 }}>more likely due to climate change</div>
                </>
              )}
              <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 8, lineHeight: 1.6 }}>
                {event.attribution.confidence} confidence<br />
                {event.attribution.method}<br />
                {event.attribution.source}, {event.attribution.year_published}
              </div>
            </div>
            {/* Right column — prose */}
            <div style={{
              fontSize: 13, color: "#444441", lineHeight: 1.85,
              borderLeft: "0.5px solid #E8E6E0", paddingLeft: "2rem",
              paddingTop: "0.5rem", flex: 1,
            }}>
              {event.attribution.summary}
            </div>
          </div>

          {/* Methodology expander */}
          <div style={{ marginBottom: "1.75rem" }}>
            <button
              onClick={() => setMethodExpanded(!methodExpanded)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#1D9E75", background: "none",
                border: "none", cursor: "pointer", padding: "8px 0",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d={methodExpanded ? "M2 9l5-5 5 5" : "M2 5l5 5 5-5"}
                  stroke="#1D9E75" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {methodExpanded ? "Hide methodology" : "How do we know this?"}
            </button>
            {methodExpanded && (
              <div style={{
                marginTop: 8, padding: "1rem 1.25rem",
                background: "#F7FDFB", borderRadius: 8,
                border: "0.5px solid #9FE1CB",
              }}>
                {[
                  { label: "What attribution science is", key: "what_attribution_science_is" },
                  { label: "How this event was studied", key: "how_this_event_was_studied" },
                  { label: "What the confidence level means", key: "what_confidence_means" },
                ].map(({ label, key }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 500, color: "#0F6E56",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
                    }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#444441", lineHeight: 1.7 }}>
                      {event.attribution.method_explainer?.[key] || ""}
                    </div>
                  </div>
                ))}
                <a
                  href={event.attribution.method_explainer?.source_url || event.attribution.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#1D9E75" }}
                >
                  Read the full WWA study →
                </a>
              </div>
            )}
          </div>

          {/* Section 5: From the ground */}
          {event.photos?.length > 0 && (
            <>
              <SectionLabel>From the ground</SectionLabel>
              <div style={{ marginBottom: "1.75rem" }}>
                <img
                  src={`/imagery/${event.photos[0].file}`}
                  alt={event.photos[0].caption}
                  style={{
                    width: "100%", height: "auto", maxHeight: 400,
                    objectFit: "cover", borderRadius: 6, display: "block",
                  }}
                />
                {event.photos.length > 1 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6, marginBottom: 6 }}>
                    {event.photos.slice(1, 3).map((photo, i) => (
                      <img
                        key={i}
                        src={`/imagery/${photo.file}`}
                        alt={photo.caption}
                        style={{
                          width: "100%", height: "auto", maxHeight: 220,
                          objectFit: "cover", borderRadius: 6,
                        }}
                      />
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 9, color: "#B4B2A9" }}>
                  Photos: {[...new Set(event.photos.map(p => p.credit))].join(" / ")} · Wikimedia Commons · CC BY 4.0
                </div>
              </div>
            </>
          )}

          {/* Section 6: Human impact */}
          <SectionLabel>Human impact</SectionLabel>
          <div style={{ marginBottom: "1.75rem" }}>

            {/* Deaths row */}
            <div style={{ padding: "1rem 0", borderBottom: "0.5px solid #F1EFE8" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: 8 }}>
                {impact.deaths != null ? (
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 36, fontWeight: 400, color: "#A32D2D", lineHeight: 1, minWidth: "fit-content",
                  }}>
                    {impact.deaths.toLocaleString()}
                  </div>
                ) : (
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 28, fontWeight: 400, color: "#888780", lineHeight: 1,
                  }}>
                    undetermined
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 13, color: "#2C2C2A" }}>deaths recorded</div>
                  {impact.deaths_source && (
                    <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 2 }}>{impact.deaths_source}</div>
                  )}
                </div>
              </div>
              {impact.deaths_note && (
                <div style={{
                  fontSize: 12, color: "#5F5E5A", lineHeight: 1.6,
                  padding: "8px 10px", background: "#FFF8E6",
                  borderRadius: 6, borderLeft: "2px solid #EF9F27",
                }}>
                  {impact.deaths_note}
                </div>
              )}
            </div>

            {/* People affected row */}
            <div style={{ padding: "1rem 0", borderBottom: "0.5px solid #F1EFE8" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: 8 }}>
                {impact.people_affected != null ? (
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 36, fontWeight: 400, color: "#2C2C2A", lineHeight: 1, minWidth: "fit-content",
                  }}>
                    {fmtNum(impact.people_affected)}
                  </div>
                ) : (
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 28, fontWeight: 400, color: "#888780", lineHeight: 1,
                  }}>
                    unverified
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 13, color: "#2C2C2A" }}>people affected</div>
                  {impact.context?.people_affected && impact.people_affected != null && (
                    <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 2 }}>{impact.context.people_affected}</div>
                  )}
                </div>
              </div>
              {impact.people_affected_note && (
                <div style={{
                  fontSize: 12, color: "#5F5E5A", lineHeight: 1.6,
                  padding: "8px 10px", background: "#FFF8E6",
                  borderRadius: 6, borderLeft: "2px solid #EF9F27",
                }}>
                  {impact.people_affected_note}
                </div>
              )}
            </div>

            {/* Hectares burned row — wildfires only */}
            {impact.hectares_burned != null && (
              <div style={{ padding: "1rem 0", borderBottom: "0.5px solid #F1EFE8" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: 8 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 400, color: "#2C2C2A", lineHeight: 1, minWidth: "fit-content" }}>
                    {fmtNum(impact.hectares_burned)} ha
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#2C2C2A" }}>forest burned</div>
                    {impact.hectares_burned_note && (
                      <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 2 }}>{impact.hectares_burned_note}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Economic loss row */}
            <div style={{ padding: "1rem 0", borderBottom: "0.5px solid #F1EFE8" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: 8 }}>
                {impact.economic_loss_usd != null ? (
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 36, fontWeight: 400, color: "#2C2C2A", lineHeight: 1, minWidth: "fit-content",
                  }}>
                    {fmtNum(impact.economic_loss_usd, "$")}
                  </div>
                ) : (
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 28, fontWeight: 400, color: "#888780", lineHeight: 1,
                  }}>
                    not yet assessed
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 13, color: "#2C2C2A" }}>economic loss</div>
                  {impact.gdp_pct != null && (
                    <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 2 }}>{impact.gdp_pct}% of annual GDP</div>
                  )}
                </div>
              </div>
              {impact.economic_loss_note && (
                <div style={{
                  fontSize: 12, color: "#5F5E5A", lineHeight: 1.6,
                  padding: "8px 10px", background: "#FFF8E6",
                  borderRadius: 6, borderLeft: "2px solid #EF9F27",
                }}>
                  {impact.economic_loss_note}
                </div>
              )}
            </div>

            <div style={{
              fontSize: 13, color: "#5F5E5A", lineHeight: 1.6,
              padding: "0.875rem 1rem", background: "#FFF8E6",
              borderRadius: 8, borderLeft: "2px solid #EF9F27", marginTop: "1rem",
            }}>
              {event.country} contributed <strong style={{ color: "#854F0B" }}>{impact.emitters_share_pct}%</strong> of global cumulative greenhouse gas emissions. The countries responsible for the most emissions faced none of these consequences.
            </div>
          </div>

          {/* Injustice callout */}
          <div style={{
            background: "#0d1f2d", borderRadius: 10,
            padding: "1.25rem 1.5rem", margin: "1.5rem 0",
            display: "flex", alignItems: "center", gap: "1.5rem",
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, color: "#F09595", lineHeight: 1, flexShrink: 0 }}>
              {impact.emitters_share_pct}%
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M4 10h12M12 6l4 4-4 4" stroke="#F09595" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, color: "#5DCAA5", lineHeight: 1, flexShrink: 0 }}>
              {impact.people_affected != null ? fmtNum(impact.people_affected) : "—"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              <>
                <span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500, marginBottom: 2 }}>
                  of global emissions came from {event.country}
                </span>
                {impact.people_affected != null
                  ? `yet ${fmtNum(impact.people_affected)} people bore the full human cost of a crisis they did not cause.`
                  : "yet the people who paid the price contributed almost nothing to causing it."
                }
              </>
            </div>
          </div>

          {/* Section 7: Who was most at risk */}
          {event.at_risk?.length > 0 && (
            <>
              <SectionLabel>Who was most at risk</SectionLabel>
              <div style={{ marginBottom: "1.75rem" }}>
                {event.at_risk.map((item, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem",
                    alignItems: "start",
                    marginBottom: "1.25rem", paddingBottom: "1.25rem",
                    borderBottom: i < event.at_risk.length - 1 ? "0.5px solid #F1EFE8" : "none",
                  }}>
                    <div>
                      <div style={{
                        fontSize: 9, fontWeight: 500, color: "#B4B2A9",
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4,
                      }}>{item.category}</div>
                      <div style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 1.6 }}>{item.context}</div>
                    </div>
                    {item.number != null && (
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 32, fontWeight: 400, color: "#2C2C2A",
                        lineHeight: 1, textAlign: "right", whiteSpace: "nowrap",
                      }}>{item.number}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Section 8: Future outlook */}
          {event.future_outlook && (
            <>
              <SectionLabel>Future outlook</SectionLabel>
              <div style={{
                background: "#0d1f2d", borderRadius: 10,
                border: "0.5px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #1D9E75",
                padding: "1.25rem", marginBottom: "1.75rem",
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "1rem",
                }}>{event.future_outlook.label}</div>
                {event.future_outlook.stats.map((stat, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "baseline", gap: "0.75rem",
                    paddingBottom: i < event.future_outlook.stats.length - 1 ? "0.875rem" : 0,
                    marginBottom: i < event.future_outlook.stats.length - 1 ? "0.875rem" : 0,
                    borderBottom: i < event.future_outlook.stats.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
                  }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 28, color: "#5DCAA5", minWidth: 60,
                    }}>{stat.number}</div>
                    <div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{stat.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{stat.delta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Section 9: What followed */}
          {event.response?.key_outcomes?.length > 0 && (
            <>
              <SectionLabel>What followed</SectionLabel>
              <div style={{ marginBottom: "1.75rem" }}>
                {event.response.key_outcomes.map((outcome, i) => {
                  const statusStyle = STATUS_STYLE[outcome.status] ?? STATUS_STYLE.Ongoing;
                  return (
                    <div key={i} style={{
                      display: "flex", gap: 12,
                      marginBottom: i < event.response.key_outcomes.length - 1 ? "1rem" : 0,
                      paddingBottom: i < event.response.key_outcomes.length - 1 ? "1rem" : 0,
                      borderBottom: i < event.response.key_outcomes.length - 1 ? "0.5px solid #F1EFE8" : "none",
                      alignItems: "flex-start",
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                        background: OUTCOME_DOT[outcome.type] ?? "#9CA3AF",
                      }} />
                      <div>
                        <div style={{ fontSize: 10, color: "#B4B2A9", marginBottom: 2 }}>{outcome.date}</div>
                        <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.6 }}>{outcome.description}</div>
                        {outcome.status_note && (
                          <div style={{
                            fontSize: 12, color: "#5F5E5A", lineHeight: 1.6,
                            marginTop: 6, fontStyle: "italic",
                          }}>
                            {outcome.status_note}
                          </div>
                        )}
                        <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 4 }}>{outcome.source}</div>
                        {outcome.status && (
                          <span style={{
                            fontSize: 10, padding: "2px 7px", borderRadius: 99, fontWeight: 500,
                            display: "inline-block", marginTop: 4,
                            background: statusStyle.bg, color: statusStyle.color,
                          }}>{outcome.status}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Section 10: Recent coverage */}
          {(() => {
            const displayArticles = articles.length > 0
              ? articles
              : (event.curated_coverage ?? []);
            if (articlesLoading) return (
              <>
                <SectionLabel>Recent coverage</SectionLabel>
                <div style={{ marginBottom: "1.75rem" }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 36, borderRadius: 4, background: "#F1EFE8", marginBottom: 8 }} />)}
                </div>
              </>
            );
            if (displayArticles.length === 0) return null;
            return (
              <>
                <SectionLabel>Recent coverage</SectionLabel>
                <div style={{ marginBottom: "1.75rem" }}>
                  {displayArticles.map((article, i) => (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem",
                      alignItems: "start", padding: "8px 0",
                      borderBottom: i < displayArticles.length - 1 ? "0.5px solid #F1EFE8" : "none",
                    }}>
                      <span style={{
                        fontSize: 10, padding: "2px 7px", borderRadius: 4,
                        background: "#E6F1FB", color: "#185FA5",
                        whiteSpace: "nowrap", fontWeight: 500, marginTop: 1,
                      }}>
                        {article.source || article.domain}
                      </span>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: 13, color: "#2C2C2A", lineHeight: 1.4,
                        textDecoration: "none",
                      }}>
                        {article.title ?? article.headline}
                      </a>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

        </div>

        {/* ── Question bar — sticky bottom ── */}

        <div style={{
          position: "sticky", bottom: 0,
          borderTop: "0.5px solid #E8E6E0",
          padding: "1rem 1.75rem",
          background: "#FAFAF8", zIndex: 20,
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {[
              "Which countries caused this?",
              "What happened at COP after?",
              "Without climate change?",
              "Who helped on the ground?",
              "What does 2050 look like here?",
            ].map(q => (
              <button key={q} onClick={() => setQuestion(q)} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 99,
                border: "0.5px solid #D3D1C7", color: "#5F5E5A",
                background: "#FAFAF8", cursor: "pointer",
              }}>{q}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAsk()}
              placeholder="Ask a question about this event..."
              style={{
                flex: 1, padding: "8px 12px", fontSize: 13,
                border: "0.5px solid #D3D1C7", borderRadius: 8,
                background: "white", color: "#2C2C2A",
                fontFamily: "Inter, sans-serif", outline: "none",
              }}
            />
            <button
              onClick={handleAsk}
              disabled={asking || !question.trim()}
              style={{
                padding: "8px 18px",
                background: asking || !question.trim() ? "#B4B2A9" : "#1D9E75",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: asking ? "wait" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {asking ? "…" : "Ask"}
            </button>
          </div>
          {answer && (
            <div style={{
              marginTop: 12, padding: "1rem", background: "white",
              borderRadius: 8, border: "0.5px solid #E8E6E0",
              fontSize: 13, color: "#2C2C2A", lineHeight: 1.65,
            }}>
              <div>{answer.answer}</div>
              {answer.sources?.length > 0 && (
                <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 8 }}>
                  Sources: {answer.sources.join(" · ")}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Press pack modal ── */}
      {pressPackOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end",
          }}
          onClick={e => { if (e.target === e.currentTarget) setPressPackOpen(false); }}
        >
          <div style={{
            width: "100%", maxHeight: "85vh", overflowY: "auto",
            background: "#FAFAF8", borderRadius: "16px 16px 0 0",
            padding: "1.75rem 2rem 3rem",
            fontFamily: "Inter, sans-serif",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Press pack · {event.name} {event.year}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {pressPackData && !pressPackData.error && (
                  <button onClick={handleCopyPressPack} style={{
                    fontSize: 11, padding: "5px 12px", borderRadius: 99,
                    background: "#E1F5EE", color: "#0F6E56",
                    border: "0.5px solid #9FE1CB", cursor: "pointer",
                  }}>Copy all</button>
                )}
                <button onClick={() => setPressPackOpen(false)} style={{
                  fontSize: 11, padding: "5px 12px", borderRadius: 99,
                  background: "#F1EFE8", color: "#5F5E5A",
                  border: "none", cursor: "pointer",
                }}>Close</button>
              </div>
            </div>

            {pressPackLoading && (
              <div style={{ color: "#B4B2A9", fontSize: 13 }}>Generating press pack…</div>
            )}
            {pressPackData?.error && (
              <div style={{ color: "#A32D2D", fontSize: 13 }}>{pressPackData.error}</div>
            )}
            {pressPackData && !pressPackData.error && (
              <>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 26, fontWeight: 400, color: "#2C2C2A", lineHeight: 1.25, marginBottom: "0.75rem",
                }}>
                  {pressPackData.headline}
                </div>
                <div style={{ fontSize: 15, color: "#5F5E5A", lineHeight: 1.65, marginBottom: "1.5rem" }}>
                  {pressPackData.standfirst}
                </div>

                <div style={{ fontSize: 11, fontWeight: 500, color: "#444441", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Key facts</div>
                <ol style={{ margin: "0 0 1.5rem 0", paddingLeft: "1.25rem" }}>
                  {(pressPackData.key_facts ?? []).map((f, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.7, marginBottom: 4 }}>{f}</li>
                  ))}
                </ol>

                <div style={{ fontSize: 11, fontWeight: 500, color: "#444441", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Citable attribution</div>
                <blockquote style={{
                  margin: "0 0 1.5rem 0", padding: "0.75rem 1rem",
                  borderLeft: "3px solid #1D9E75", background: "#F7FDFB",
                  fontSize: 13, color: "#2C2C2A", lineHeight: 1.7, borderRadius: "0 6px 6px 0",
                }}>
                  {pressPackData.citable_attribution}
                </blockquote>

                <div style={{ fontSize: 11, fontWeight: 500, color: "#444441", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Story angles</div>
                <div style={{ marginBottom: "1.5rem" }}>
                  {(pressPackData.story_angles ?? []).map((a, i) => (
                    <div key={i} style={{
                      marginBottom: "1rem", paddingBottom: "1rem",
                      borderBottom: i < pressPackData.story_angles.length - 1 ? "0.5px solid #F1EFE8" : "none",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A", marginBottom: 3 }}>{a.angle}</div>
                      <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.6 }}>{a.description}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href={pressPackData.primary_source_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "#1D9E75", textDecoration: "none" }}>
                    → Primary source (WWA study)
                  </a>
                  <a href={pressPackData.data_download_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "#1D9E75", textDecoration: "none" }}>
                    → Download event data (JSON)
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
