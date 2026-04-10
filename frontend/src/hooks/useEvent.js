import { useState, useEffect } from "react";

// Returns lightweight list items {id, name, year, hazard_type, country}
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
}

// Returns full event objects for all events (needed for globe center coords)
export function useFullEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((list) =>
        Promise.all(
          list.map((e) =>
            fetch(`/api/events/${e.id}`)
              .then((r) => r.json())
              .catch(() => null)
          )
        )
      )
      // Drop any events that 404'd (no JSON file yet) — they have no center/hazard_type
      .then((results) => setEvents(results.filter((e) => e && e.center)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
}

export function useEvent(eventId) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => setEvent(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  return { event, loading, error };
}
