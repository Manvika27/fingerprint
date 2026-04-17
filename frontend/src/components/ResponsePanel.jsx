function ArticleItem({ article }) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs font-medium text-blue-600 mb-0.5">
        {article.source ?? article.domain}
      </p>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-gray-800 hover:text-gray-900 leading-snug hover:underline"
      >
        {article.title ?? article.headline}
      </a>
    </div>
  );
}

export default function ResponsePanel({ event }) {
  const articles = event?.curated_coverage ?? [];

  if (articles.length === 0) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4 overflow-auto">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        In the News
      </h2>
      <div>
        {articles.map((article, i) => (
          <ArticleItem key={i} article={article} />
        ))}
      </div>
    </div>
  );
}
