import { useRef, useState, useEffect } from "react";
import Globe from "react-globe.gl";

const HAZARD_COLORS = {
  flood:     "#378ADD",
  heatwave:  "#EF9F27",
  hurricane: "#7F77DD",
  wildfire:  "#EF7827",
  drought:   "#C49A6C",
  cyclone:   "#1D9E75",
};

const LEGEND = [
  { label: "Flood",     color: HAZARD_COLORS.flood },
  { label: "Heatwave",  color: HAZARD_COLORS.heatwave },
  { label: "Hurricane", color: HAZARD_COLORS.hurricane },
  { label: "Wildfire",  color: HAZARD_COLORS.wildfire },
  { label: "Drought",   color: HAZARD_COLORS.drought },
  { label: "Cyclone",   color: HAZARD_COLORS.cyclone },
];

function pointColor(d) {
  const base = HAZARD_COLORS[d.hazard_type] ?? "#AAAAAA";
  return d.stub ? base + "99" : base;
}

function pointLabel(d) {
  return `<div style="background:rgba(10,22,40,0.92);color:white;padding:6px 10px;border-radius:6px;font-family:Inter,sans-serif;font-size:12px;border:0.5px solid rgba(255,255,255,0.15)">
    <strong>${d.name}</strong><br/>
    <span style="font-size:10px;color:#6b7f8a">${d.country} · ${d.year}${d.stub ? ' · preview' : ''}</span>
  </div>`;
}

export default function GlobeLanding({ events, onSelect }) {
  const globeRef = useRef();
  const [pointAlt, setPointAlt] = useState(0.01);
  const [stubModal, setStubModal] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPointAlt(a => a === 0.01 ? 0.03 : 0.01);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  function handleGlobeReady() {
    const ctrl = globeRef.current.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.6;
    ctrl.enableZoom = false;
    globeRef.current.pointOfView({ lat: 30, lng: 69, altitude: 1.8 }, 0);
  }

  function stopRotate()   { if (globeRef.current) globeRef.current.controls().autoRotate = false; }
  function resumeRotate() { if (globeRef.current) globeRef.current.controls().autoRotate = true; }

  function handlePointClick(d) {
    if (d.stub) {
      stopRotate();
      setStubModal(d);
    } else {
      onSelect(d);
    }
  }

  function closeModal() {
    setStubModal(null);
    resumeRotate();
  }

  const fullEventCount = events.filter(e => !e.stub).length;
  const stubCount = events.filter(e => e.stub).length;

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#0a1628",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "1.25rem",
    }}>
      <div onMouseEnter={stopRotate} onMouseLeave={resumeRotate} style={{ cursor: "pointer" }}>
        <Globe
          ref={globeRef}
          width={420}
          height={420}
          backgroundColor="#0a1628"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          atmosphereColor="#1D9E75"
          atmosphereAltitude={0.12}
          pointsData={events}
          pointLat={(d) => d.center[1]}
          pointLng={(d) => d.center[0]}
          pointColor={pointColor}
          pointAltitude={pointAlt}
          pointRadius={(d) => d.stub ? 1 : 1}
          pointResolution={16}
          pointsMerge={false}
          pointLabel={pointLabel}
          onPointClick={handlePointClick}
          enablePointerInteraction={true}
          onGlobeReady={handleGlobeReady}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "#3a4f5a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.6rem" }}>
          Climate attribution science, made navigable
        </div>

        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28, fontStyle: "italic",
          color: "#ffffff", lineHeight: 1.45,
          marginBottom: "0.6rem",
        }}>
          Every extreme weather event has a fingerprint<br /> See how climate change shaped real world disasters.
        </div>

        <div style={{ fontSize: 13, color: "#6b7f8a", lineHeight: 1.6, marginBottom: "1rem" }}>
          The attribution science, the human cost, and what followed.
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "0.875rem", maxWidth: 360 }}>
          {LEGEND.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7f8a" }}>
              <span style={{ color, fontSize: 15 }}>●</span>
              {label}
            </div>
          ))}
        </div>

        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.25)",
          textAlign: "center", marginTop: "0.5rem"
        }}>
          {fullEventCount} events with full analysis · {stubCount} more in preview · expanding to cover all major disasters from the 2020s
        </div>
      </div>

      {/* Stub modal backdrop */}
      {stubModal && (
        <>
          <div
            onClick={closeModal}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 999,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#0d1f2d',
            border: '0.5px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            padding: '1.5rem',
            maxWidth: 320,
            width: 'calc(100vw - 3rem)',
            zIndex: 1000,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 500,
              color: HAZARD_COLORS[stubModal.hazard_type] ?? '#AAAAAA',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 8,
            }}>
              {stubModal.hazard_type} · {stubModal.country} · {stubModal.year}
            </div>
            <div style={{
              fontSize: 15, color: 'rgba(255,255,255,0.9)',
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1.4, marginBottom: 12,
            }}>
              {stubModal.attribution_headline}
            </div>
            <a
              href={stubModal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#1D9E75', display: 'block', marginBottom: 8 }}
            >
              Read the WWA study →
            </a>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              Full event analysis coming soon
            </div>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: 16,
                lineHeight: 1, padding: 0,
              }}
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
}
