import { useState } from "react";

const SUGGESTED = [
  "How much worse did climate change make this?",
  "Which countries caused the most emissions?",
  "What happened at COP after this?",
  "What would this look like without climate change?",
];

const DISABLED_MESSAGE = "AI-powered answers available in the full version. Explore the event data above for attribution science, human impact, and accountability outcomes.";

export default function QuestionBar({ event_id }) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setInput("");
    setSubmitted(true);
  }

  function handleChip() {
    setSubmitted(true);
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2" style={{ opacity: 0.5 }}>
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={handleChip}
            title="AI features coming soon"
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
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
          placeholder="AI features coming soon"
          style={{ opacity: 0.5 }}
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#1D9E75", opacity: 0.5 }}
        >
          Ask
        </button>
      </form>

      {/* Disabled response */}
      {submitted && (
        <div style={{
          padding: "12px 16px",
          background: "#F9F8F6",
          borderRadius: 8,
          fontSize: 13,
          color: "#888780",
          fontStyle: "italic",
          lineHeight: 1.6,
        }}>
          {DISABLED_MESSAGE}
        </div>
      )}
    </div>
  );
}
