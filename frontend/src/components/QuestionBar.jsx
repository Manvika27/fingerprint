import { useState } from "react";

const SUGGESTED = [
  "How much worse did climate change make this?",
  "Which countries caused the most emissions?",
  "What happened at COP after this?",
  "What would this look like without climate change?",
];

const CONFIDENCE_STYLE = {
  high:   "bg-[#E1F5EE] text-[#085041] border border-[#1D9E75]/30",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low:    "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function QuestionBar({ event_id }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function ask(question) {
    if (!question.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id, question, conversation_history: history }),
      });
      const data = await res.json();
      setResponse(data);
      setHistory(data.conversation_history ?? []);
    } catch {
      setResponse({ answer: "Failed to reach the server.", confidence: "low", sources: [] });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(input);
    setInput("");
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:border-[#1D9E75] hover:text-[#085041] hover:bg-[#E1F5EE] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this event..."
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1D9E75]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: loading || !input.trim() ? "#9CA3AF" : "#1D9E75" }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>

      {/* Response */}
      {response && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 flex flex-col gap-2">
          <p className="text-sm text-gray-800 leading-relaxed">{response.answer}</p>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            {response.confidence && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${CONFIDENCE_STYLE[response.confidence] ?? CONFIDENCE_STYLE.low}`}>
                {response.confidence} confidence
              </span>
            )}
            {response.sources?.length > 0 && (
              <span className="text-xs text-gray-400">
                Sources: {response.sources.join(", ")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
