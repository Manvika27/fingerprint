import { useEffect, useRef, useState } from "react";
import ReactCompareImage from "react-compare-image";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function MapFallback({ event }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!event || mapRef.current || !MAPBOX_TOKEN) return;
    import("mapbox-gl").then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: event.center,
        zoom: event.zoom,
      });
      mapRef.current = map;
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [event]);

  useEffect(() => {
    if (!mapRef.current || !event) return;
    mapRef.current.flyTo({ center: event.center, zoom: event.zoom });
  }, [event?.id]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-400 text-xs px-4 text-center">
        Add <code className="mx-1">VITE_MAPBOX_TOKEN</code> to enable map
      </div>
    );
  }
  return <div ref={mapContainer} className="flex-1" />;
}

export default function SatellitePanel({ event }) {
  if (!event) return null;

  const beforeUrl = event.satellite?.before_image_url;
  const afterUrl = event.satellite?.after_image_url;
  const hasComparison = beforeUrl && afterUrl;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Satellite Imagery
        </h2>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {hasComparison ? (
          <div className="relative h-full">
            <ReactCompareImage
              leftImage={beforeUrl}
              rightImage={afterUrl}
              leftImageLabel="Before"
              rightImageLabel="After"
              sliderLineColor="#1D9E75"
              sliderHandleColor="#1D9E75"
            />
            {/* Corner labels */}
            <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded pointer-events-none">
              Before
            </span>
            <span className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded pointer-events-none">
              After
            </span>
          </div>
        ) : (
          <MapFallback event={event} />
        )}
      </div>

      <div className="px-4 py-2 shrink-0 border-t border-gray-100">
        <p className="text-xs text-gray-500">{event.satellite.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {event.satellite.data_source} · {event.satellite.date_range[0]} – {event.satellite.date_range[1]}
        </p>
      </div>
    </div>
  );
}
