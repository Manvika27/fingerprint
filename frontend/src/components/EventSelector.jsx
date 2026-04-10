const HAZARD_BADGE = {
  flood: "bg-blue-100 text-blue-700 border border-blue-200",
  heatwave: "bg-amber-100 text-amber-700 border border-amber-200",
  hurricane: "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function EventSelector({ events, selectedId, onSelect }) {
  const grouped = events.reduce((acc, event) => {
    const type = event.hazard_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-base font-bold text-gray-900 tracking-tight">Fingerprint</h1>
        <p className="text-xs text-gray-400 mt-0.5">Climate attribution explorer</p>
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            {type}
          </p>
          <ul className="flex flex-col gap-1">
            {items.map((event) => {
              const isSelected = selectedId === event.id;
              return (
                <li key={event.id}>
                  <button
                    onClick={() => {
                      console.log("selected event_id:", event.id);
                      onSelect(event.id);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-[#E1F5EE] border border-[#1D9E75]"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium truncate ${
                          isSelected ? "text-[#085041]" : "text-gray-800"
                        }`}
                      >
                        {event.name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">{event.year}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{event.country}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          HAZARD_BADGE[event.hazard_type] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {event.hazard_type}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
