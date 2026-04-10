import { useState } from "react";
import GlobeLanding from "./components/GlobeLanding.jsx";
import EventView from "./components/EventView.jsx";
import AboutPage from "./components/AboutPage.jsx";
import { useFullEvents } from "./hooks/useEvent.js";

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("globe"); // "globe" | "event" | "about"
  const { events, loading } = useFullEvents();

  if (loading) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        background: "#0a1628",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: "#3a4f5a", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
          Loading…
        </div>
      </div>
    );
  }

  if (view === "about") {
    return (
      <AboutPage onBack={() => setView(selectedEvent ? "event" : "globe")} />
    );
  }

  if (view === "event" && selectedEvent) {
    return (
      <EventView
        event={selectedEvent}
        events={events}
        onBack={() => { setSelectedEvent(null); setView("globe"); }}
        onSelect={e => { setSelectedEvent(e); setView("event"); }}
        onAbout={() => setView("about")}
      />
    );
  }

  return (
    <div style={{ opacity: 1, transition: "opacity 0.4s ease" }}>
      <GlobeLanding
        events={events}
        onSelect={e => { setSelectedEvent(e); setView("event"); }}
      />
    </div>
  );
}
