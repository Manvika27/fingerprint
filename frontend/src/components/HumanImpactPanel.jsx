function fmt(n) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toLocaleString();
}

function MetricCard({ label, value, context, highlight }) {
  return (
    <div
      className={`rounded-lg p-3 flex flex-col gap-0.5 border ${
        highlight
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-100"
      }`}
    >
      <span className={`text-xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
      {context && (
        <span className="text-xs text-gray-400 italic leading-snug mt-0.5">{context}</span>
      )}
    </div>
  );
}

export default function HumanImpactPanel({ human_impact, country }) {
  if (!human_impact) return null;

  const ctx = human_impact.context ?? {};
  const pct = human_impact.emitters_share_pct;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4 overflow-auto">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Human Impact
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="people affected"
          value={fmt(human_impact.people_affected)}
          context={ctx.people_affected}
        />
        <MetricCard
          label="deaths"
          value={human_impact.deaths.toLocaleString()}
          context={ctx.deaths}
          highlight
        />
        <MetricCard
          label="displaced"
          value={fmt(human_impact.displaced)}
          context={ctx.displaced}
        />
        <MetricCard
          label="economic loss"
          value={fmt(human_impact.economic_loss_usd)}
          context={ctx.economic_loss_usd}
        />
      </div>

      {/* Emitter share bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {country ?? "Country"}'s share of global cumulative emissions
          </span>
          <span className="text-xs font-bold text-amber-600">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400"
            style={{ width: `${Math.min(pct * 10, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 italic">
          Contributed {pct}% of the emissions that made this event worse — bore 100% of the cost.
        </p>
      </div>

      <div className="text-xs text-gray-300 mt-auto">Source: {human_impact.source}</div>
    </div>
  );
}
