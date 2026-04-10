import { useState, useEffect } from "react";

const OUTCOME_DOT = {
  policy: "#1D9E75",
  litigation: "#7C3AED",
  aid: "#D97706",
};

const STATUS_STYLE = {
  Active:    "bg-blue-50 text-blue-600 border border-blue-200",
  Ongoing:   "bg-[#E1F5EE] text-[#085041] border border-[#1D9E75]/30",
  Delivered: "bg-gray-50 text-gray-500 border border-gray-200",
  Stalled:   "bg-red-50 text-red-500 border border-red-200",
};

function OutcomeItem({ outcome }) {
  const dotColor = OUTCOME_DOT[outcome.type] ?? "#9CA3AF";
  const statusStyle = STATUS_STYLE[outcome.status] ?? STATUS_STYLE.Ongoing;

  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <div className="w-px flex-1 bg-gray-200 mt-1" />
      </div>
      <div className="pb-4 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs text-gray-400">{outcome.date}</span>
          {outcome.status && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusStyle}`}>
              {outcome.status}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 leading-snug">{outcome.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">{outcome.source}</p>
      </div>
    </div>
  );
}

function ArticleItem({ article }) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs font-medium text-blue-600 mb-0.5">
        {article.source ?? article.domain}
        {article.is_local && (
          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-[#E1F5EE] text-[#085041] border border-[#1D9E75]/30 font-medium">
            local
          </span>
        )}
      </p>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-gray-800 hover:text-gray-900 leading-snug hover:underline"
      >
        {article.title}
      </a>
      {article.published_at && (
        <p className="text-xs text-gray-400 mt-0.5">{article.published_at.slice(0, 10)}</p>
      )}
    </div>
  );
}

export default function ResponsePanel({ event_id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!event_id) return;
    setLoading(true);
    fetch(`/api/events/${event_id}/response`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [event_id]);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4 overflow-auto">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Response &amp; Accountability
      </h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {data.key_outcomes?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-3">Key outcomes</p>
              {data.key_outcomes.map((outcome, i) => (
                <OutcomeItem key={i} outcome={outcome} />
              ))}
            </div>
          )}

          {data.news_articles?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Coverage</p>
              {data.news_articles.map((article, i) => (
                <ArticleItem key={i} article={article} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400">No response data available.</p>
      )}
    </div>
  );
}
