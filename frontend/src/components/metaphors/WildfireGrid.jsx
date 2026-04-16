import React, { useEffect, useState, useMemo } from 'react';

export default function WildfireGrid({ event }) {
  const [phase, setPhase] = useState('before');
  const [animating, setAnimating] = useState(false);

  const cols = 14;
  const rows = 10;
  const total = cols * rows;

  const beforeBurned = Math.floor(total * 0.14);
  const afterBurned = Math.floor(total * 0.82);

  const colorOffsets = useMemo(() =>
    Array.from({ length: total }, () => ({
      hue: 20 + Math.random() * 20,
      light: 35 + Math.random() * 20,
    })),
  [total]);

  function generateBurned(count) {
    const cells = new Set();
    const startCell = Math.floor(total * 0.3);
    cells.add(startCell);
    while (cells.size < count) {
      const arr = Array.from(cells);
      const seed = arr[Math.floor(Math.random() * arr.length)];
      const col = seed % cols;
      const row = Math.floor(seed / cols);
      const neighbours = [
        row > 0 ? seed - cols : null,
        row < rows - 1 ? seed + cols : null,
        col > 0 ? seed - 1 : null,
        col < cols - 1 ? seed + 1 : null,
      ].filter(n => n !== null && !cells.has(n));
      if (neighbours.length > 0) {
        cells.add(neighbours[Math.floor(Math.random() * neighbours.length)]);
      } else {
        cells.add(Math.floor(Math.random() * total));
      }
    }
    return cells;
  }

  const [burnedCells, setBurnedCells] = useState(() => generateBurned(beforeBurned));

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('after');
      setAnimating(true);
      setBurnedCells(generateBurned(afterBurned));
      setTimeout(() => setAnimating(false), 1200);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const cellSize = 11;
  const gap = 1;

  return (
    <div style={{ maxWidth: 280 }}>
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 500,
            color: phase === 'after' ? '#BA7517' : '#1D9E75',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 10,
            transition: 'color 0.6s',
          }}>
            {phase === 'before' ? 'Normal fire season' : '2023 fire season'}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gap: `${gap}px`,
          }}>
            {Array.from({ length: total }, (_, i) => {
              const isBurned = burnedCells.has(i);
              const row = Math.floor(i / cols);
              const col = i % cols;
              const delay = Math.min(0.8, (row * cols + col) * 0.015);
              return (
                <div
                  key={i}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 2,
                    background: isBurned
                      ? `hsl(${colorOffsets[i].hue}, 90%, ${colorOffsets[i].light}%)`
                      : '#2D5A27',
                    transition: animating
                      ? `background 0.6s ${delay}s ease`
                      : 'none',
                    opacity: isBurned ? 1 : 0.7,
                  }}
                />
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2D5A27', opacity: 0.7 }} />
              <span style={{ fontSize: 10, color: '#888780' }}>Forest</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#D85A30' }} />
              <span style={{ fontSize: 10, color: '#888780' }}>Burned</span>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 4 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 52, color: '#EF9F27',
            fontWeight: 400, lineHeight: 1, marginBottom: 4,
          }}>
            7×
          </div>
          <div style={{ fontSize: 13, color: '#2C2C2A', marginBottom: 8, fontWeight: 500 }}>
            more likely
          </div>
          <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6, maxWidth: 180 }}>
            A season this severe was a once-in-20-year event. Climate change made it happen now.
          </div>
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: '#FEF3E2', borderRadius: 6,
            fontSize: 11, color: '#854F0B', lineHeight: 1.5,
          }}>
            15M hectares burned —<br/>
            double Canada's previous record
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
