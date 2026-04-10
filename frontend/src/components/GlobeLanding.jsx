import { useRef } from "react";
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
  return HAZARD_COLORS[d.hazard_type] ?? "#AAAAAA";
}

function pointLabel(d) {
  return `<div style="background:rgba(10,22,40,0.92);color:white;padding:6px 10px;border-radius:6px;font-family:Inter,sans-serif;font-size:12px;border:0.5px solid rgba(255,255,255,0.15)">
    <strong>${d.name}</strong><br/>
    <span style="font-size:10px;color:#6b7f8a">${d.country} · ${d.year}</span>
  </div>`;
}

export default function GlobeLanding({ events, onSelect }) {
  const globeRef = useRef();

  function handleGlobeReady() {
    const ctrl = globeRef.current.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.6;
    ctrl.enableZoom = false;
    globeRef.current.pointOfView({ lat: 30, lng: 69, altitude: 1.8 }, 0);
  }

  function stopRotate()   { if (globeRef.current) globeRef.current.controls().autoRotate = false; }
  function resumeRotate() { if (globeRef.current) globeRef.current.controls().autoRotate = true; }

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
          pointAltitude={0.05}
          pointRadius={2.5}
          pointResolution={12}
          pointLabel={pointLabel}
          onPointClick={(d) => onSelect(d)}
          enablePointerInteraction={true}
          onGlobeReady={handleGlobeReady}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28, fontStyle: "italic",
          color: "#ffffff", lineHeight: 1.45,
          marginBottom: "0.75rem",
        }}>
          Every event has a fingerprint.<br />
          Every fingerprint has a cost.
        </div>

        <div style={{ fontSize: 13, color: "#6b7f8a", lineHeight: 1.6, marginBottom: "1rem" }}>
          Climate attribution science,<br />made navigable.
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "0.875rem", maxWidth: 360 }}>
          {LEGEND.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7f8a" }}>
              <span style={{ color, fontSize: 15 }}>●</span>
              {label}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#3a4f5a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Click an event to explore
        </div>
      </div>
    </div>
  );
}
