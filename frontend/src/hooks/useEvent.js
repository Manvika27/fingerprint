import { useState, useEffect } from "react";

// Returns lightweight list items {id, name, year, hazard_type, country}
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/events/index.json")
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
    fetch("/events/index.json")
      .then((r) => r.json())
      .then(async (list) => {
        const fullIds = list.map((e) => e.id);

        const fullEvents = await Promise.all(
          fullIds.map((id) =>
            fetch(`/events/${id}.json`)
              .then((r) => r.json())
              .catch(() => null)
          )
        );

        const stubs = await fetch("/events/stubs.json")
          .then((r) => r.json())
          .catch(() => []);

        return [
          ...fullEvents.filter((e) => e && e.center),
          ...stubs.filter((e) => e.center),
        ];
      })
      .then((allPoints) => setEvents(allPoints))
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
    fetch(`/events/${eventId}.json`)
      .then((r) => r.json())
      .then((data) => setEvent(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  return { event, loading, error };
}
