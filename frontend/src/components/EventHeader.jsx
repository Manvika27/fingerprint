function fmtMillions(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

const HAZARD_BADGE = {
  flood: "bg-blue-100 text-blue-700 border border-blue-200",
  heatwave: "bg-amber-100 text-amber-700 border border-amber-200",
  hurricane: "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function EventHeader({ event }) {
  if (!event) return null;

  const badge = HAZARD_BADGE[event.hazard_type] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  const impact = event.human_impact;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-5">
      {/* Badge + year */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${badge}`}>
          {event.hazard_type}
        </span>
        <span className="text-xs text-gray-400">{event.country} · {event.year}</span>
      </div>

      {/* Headline */}
      <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
        {event.headline ?? event.name}
      </h1>

      {/* Injustice bar */}
      {impact && (
        <div className="flex items-stretch gap-3 mb-4 rounded-lg overflow-hidden border border-red-200 bg-red-50">
          <div className="w-1 bg-red-400 shrink-0" />
          <div className="flex items-center gap-6 py-2.5 pr-4 flex-wrap">
            <div>
              <span className="text-lg font-bold text-red-700">{impact.emitters_share_pct}%</span>
              <p className="text-xs text-red-500 leading-tight">of global emissions<br />from {event.country}</p>
            </div>
            <div className="text-red-300 text-lg font-light">→</div>
            <div>
              <span className="text-lg font-bold text-red-700">{fmtMillions(impact.people_affected)}</span>
              <p className="text-xs text-red-500 leading-tight">people affected<br />bore the full cost</p>
            </div>
            <p className="text-xs text-red-600 italic ml-auto hidden sm:block">
              The countries most responsible for emissions caused this — yet faced none of it.
            </p>
          </div>
        </div>
      )}

      {/* Pull quote */}
      {event.story_quote && (
        <blockquote className="border-l-2 pl-4" style={{ borderColor: "#1D9E75" }}>
          <p className="text-sm text-gray-600 italic leading-relaxed">
            "{event.story_quote.text}"
          </p>
          <footer className="mt-1 text-xs text-gray-400">
            — {event.story_quote.attribution}
          </footer>
        </blockquote>
      )}
    </div>
  );
}
