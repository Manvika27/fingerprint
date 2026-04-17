const ABOUT_STYLE = { fontFamily: "Inter, sans-serif", background: "#FAFAF8", minHeight: "100vh" };

const SOURCES_TABLE = [
  ["Attribution science", "World Weather Attribution – peer-reviewed rapid attribution studies published within days to weeks of major events."],
  ["Impact figures", "PDNA (Post-Disaster Needs Assessment) reports, NDMA national disaster management authorities, EM-DAT international disaster database."],
  ["Humanitarian situation", "ReliefWeb – UN OCHA's database of situation reports, filtered to the event date window."],
  ["Emissions responsibility", "Climate Trace and Our World in Data cumulative historical emissions, used for 'who is responsible' questions."],
  ["Press & context", "Curated articles from national and international press, hand-selected and linked with original source URLs."],
  ["Future risk", "IPCC AR6, regional climate projections, and event-specific model outputs where available."],
];

const AUDIENCE_CARDS = [
  {
    title: "Journalists",
    subtitle: "Citable in minutes",
    body: "Every figure has a named source. Use the press pack button on any event for a structured brief ready for publication.",
  },
  {
    title: "Educators",
    subtitle: "Explain attribution science",
    body: "Expand any attribution finding to see a plain-language explanation of the methodology, designed for classroom use.",
  },
  {
    title: "Researchers",
    subtitle: "Download structured data",
    body: "Each event is available as structured JSON with full source provenance, suitable for citation.",
  },
];

export default function AboutPage({ onBack }) {
  return (
    <div style={ABOUT_STYLE}>
      {/* Nav */}
      <div style={{
        borderBottom: "0.5px solid #E8E6E0", padding: "1rem 2rem",
        display: "flex", alignItems: "center", gap: "1.5rem",
        background: "white", position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          fontSize: 11, color: "#B4B2A9", background: "none",
          border: "none", cursor: "pointer", padding: 0,
        }}>
          ← Back
        </button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A" }}>Fingerprint</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 2rem 6rem" }}>

        {/* Header */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36, fontWeight: 400, color: "#2C2C2A", marginBottom: "1rem",
        }}>
          About Fingerprint
        </div>
        <div style={{ fontSize: 15, color: "#5F5E5A", lineHeight: 1.7, marginBottom: "3rem" }}>
          Fingerprint makes climate attribution science navigable. When an extreme weather disaster strikes,
          scientists can now determine how much climate change worsened it. This tool puts that science in
          one place – alongside the human cost, the accountability that followed, and what comes next.
        </div>

        {/* Who this is for */}
        <SectionHead>Who this is for</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: "3rem" }}>
          {AUDIENCE_CARDS.map(card => (
            <div key={card.title} style={{
              background: "white", border: "0.5px solid #E8E6E0",
              borderRadius: 10, padding: "1.25rem",
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18, color: "#2C2C2A", marginBottom: 4,
              }}>{card.title}</div>
              <div style={{ fontSize: 11, color: "#1D9E75", fontWeight: 500, marginBottom: "0.75rem" }}>
                {card.subtitle}
              </div>
              <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>

        {/* Data sources */}
        <SectionHead>Where the data comes from</SectionHead>
        <div style={{
          border: "0.5px solid #E8E6E0", borderRadius: 10,
          overflow: "hidden", marginBottom: "3rem",
        }}>
          {SOURCES_TABLE.map(([type, desc], i) => (
            <div key={type} style={{
              display: "grid", gridTemplateColumns: "180px 1fr", gap: "1rem",
              padding: "0.875rem 1.25rem",
              borderBottom: i < SOURCES_TABLE.length - 1 ? "0.5px solid #F1EFE8" : "none",
              background: i % 2 === 0 ? "white" : "#FAFAF8",
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A" }}>{type}</div>
              <div style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Honest caveats */}
        <SectionHead>Honest caveats</SectionHead>
        <div style={{
          background: "#FFF8E6", borderLeft: "3px solid #EF9F27",
          borderRadius: "0 8px 8px 0", padding: "1.25rem 1.5rem",
          marginBottom: "3rem",
        }}>
          {[
            "Attribution science is fast-moving. Findings published within weeks of an event are preliminary. Where a more recent study supersedes an earlier one, we note this. If you find a more recent or more rigorous study for any event, please report it.",
            "Death tolls are systematically undercounted, particularly in the Global South. Official figures from national disaster management authorities are floors, not totals. Heat-related deaths are the most severely undercounted – excess mortality studies consistently find multiples of the official confirmed figure.",
            "Economic loss figures combine direct damages and indirect economic losses as reported in official assessments (World Bank, PDNA). Reconstruction costs are separate and typically higher. These figures do not capture long-term development losses, human capital loss, or loss and damage in the climate justice sense.",
            "This tool is built by one person for a university project. It is not affiliated with World Weather Attribution, the UN, or any government body. Every effort has been made to source figures accurately, but errors are possible. If you find one, please report it.",
          ].map((para, i) => (
            <p key={i} style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.7, marginBottom: i < 3 ? "0.875rem" : 0, marginTop: 0 }}>
              {para}
            </p>
          ))}
        </div>

        {/* How it stays current */}
        <SectionHead>How it stays current</SectionHead>
        <p style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.7, marginBottom: "3rem" }}>
          New events are added manually as attribution studies are published. The enrichment pipeline
          (scripts/enrich_event.py) queries ReliefWeb's situation report database filtered to each
          event's date window, and uses an LLM to extract figures not captured in official assessments.
          All extracted figures are reviewed before being incorporated into the event data. The event
          JSONs are the source of truth – they are versioned and open for inspection.
        </p>

        {/* Built by */}
        <SectionHead>Built by</SectionHead>
        <div style={{
          background: "white", border: "0.5px solid #E8E6E0",
          borderRadius: 10, padding: "1.25rem 1.5rem", marginBottom: "3rem",
        }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#2C2C2A", marginBottom: 4 }}>Manvika Athwani, Sankalp Dubey</div>
          <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 6 }}>
          </div>
          <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.7, marginTop: 8 }}>
            Stack: FastAPI · LangGraph · Claude · React · Vite<br />
            Built as part of coursework exploring how AI tools can make scientific evidence more accessible.
            Inspired by HeatWatch and the World Weather Attribution group's commitment to public communication.
          </div>
        </div>

        {/* Get in touch */}
        <SectionHead>Get in touch</SectionHead>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "2rem" }}>
          {[
            { label: "Suggest an event", href: "mailto:?subject=Fingerprint: suggest an event" },
            { label: "Report an error", href: "mailto:?subject=Fingerprint: error report" },
            { label: "Download event data", href: "/events/index.json" },
            { label: "GitHub", href: "#" },
          ].map(btn => (
            <a key={btn.label} href={btn.href} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, padding: "6px 14px", borderRadius: 99,
              border: "0.5px solid #D3D1C7", color: "#2C2C2A",
              textDecoration: "none", background: "white",
            }}>
              {btn.label}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          fontSize: 12, color: "#B4B2A9", lineHeight: 1.7,
          borderTop: "0.5px solid #E8E6E0", paddingTop: "1.5rem",
        }}>
          Fingerprint is an open project. All event data is available for non-commercial use with attribution.
          If you find an error in any figure, please report it – accuracy is the point.
        </div>

      </div>
    </div>
  );
}

function SectionHead({ children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 500, color: "#444441",
      textTransform: "uppercase", letterSpacing: "0.08em",
      marginBottom: "1rem", marginTop: "0.25rem",
    }}>
      {children}
    </div>
  );
}
