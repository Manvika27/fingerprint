const CONFIDENCE_LEVELS = { high: 3, medium: 2, low: 1 };

export default function FingerprintPanel({ attribution }) {
  if (!attribution) return null;

  const filled = CONFIDENCE_LEVELS[attribution.confidence] ?? 1;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4 overflow-auto">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Climate Fingerprint
      </h2>

      {/* Main stat */}
      <div>
        <div className="text-5xl font-bold" style={{ color: "#1D9E75" }}>
          +{attribution.likelihood_pct_increase}%
        </div>
        <div className="text-sm text-gray-500 mt-1">more likely due to climate change</div>
      </div>

      {/* Confidence bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Confidence</span>
          <span className="text-xs font-semibold capitalize" style={{ color: "#1D9E75" }}>
            {attribution.confidence}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{
                backgroundColor: i <= filled ? "#1D9E75" : "#E5E7EB",
              }}
            />
          ))}
        </div>
      </div>

      {/* Method + source */}
      <div className="text-xs text-gray-400 space-y-0.5">
        <div>Method: <span className="text-gray-600">{attribution.method}</span></div>
        <div>
          Source:{" "}
          <a
            href={attribution.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 hover:underline"
          >
            {attribution.source}, {attribution.year_published}
          </a>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
        <p className="text-sm text-gray-600 leading-relaxed">{attribution.summary}</p>
      </div>
    </div>
  );
}
