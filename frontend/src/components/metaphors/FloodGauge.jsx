import React, { useEffect, useState } from 'react';

export default function FloodGauge({ event }) {
  const [filled, setFilled] = useState(false);

  const normalInches = 100;
  const actualInches = 175;
  const maxVal = 200;
  const normalPct = (normalInches / maxVal) * 100;
  const actualPct = (actualInches / maxVal) * 100;

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 400);
    return () => clearTimeout(t);
  }, []);

  const barW = 52;
  const barH = 180;
  const gap = 28;

  const normalFillH = (normalPct / 100) * barH;
  const actualFillH = (actualPct / 100) * barH;

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 500, color: '#185FA5',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
          }}>
            Monsoon rainfall
          </div>
          <svg width={barW * 2 + gap + 100} height={barH + 40}>
            <defs>
              <clipPath id="leftClip">
                <rect x="0" y="0" width={barW} height={barH} rx="4" />
              </clipPath>
              <clipPath id="rightClip">
                <rect x={barW + gap} y="0" width={barW} height={barH} rx="4" />
              </clipPath>
            </defs>

            {/* Left bar – normal monsoon */}
            <rect x="0" y="0" width={barW} height={barH} rx="4"
              fill="#EBF4FB" stroke="#B5D4F4" strokeWidth="0.5" />
            <rect
              x="0"
              y={filled ? barH - normalFillH : barH}
              width={barW}
              height={filled ? normalFillH : 0}
              fill="#85B7EB" opacity="0.7"
              clipPath="url(#leftClip)"
              style={{ transition: 'y 1s ease-out, height 1s ease-out' }}
            />

            {/* Right bar – 2022 actual */}
            <rect x={barW + gap} y="0" width={barW} height={barH} rx="4"
              fill="#EBF4FB" stroke="#185FA5" strokeWidth="0.5" />
            <rect
              x={barW + gap}
              y={filled ? barH - actualFillH : barH}
              width={barW}
              height={filled ? actualFillH : 0}
              fill="#185FA5" opacity="0.75"
              clipPath="url(#rightClip)"
              style={{ transition: 'y 1.3s ease-out, height 1.3s ease-out' }}
            />

            {/* 7-8× bracket */}
            <line x1={barW * 2 + gap + 8} y1={barH - actualFillH}
              x2={barW * 2 + gap + 8} y2={barH - normalFillH}
              stroke="#E24B4A" strokeWidth="1" />
            <line x1={barW * 2 + gap + 5} y1={barH - actualFillH}
              x2={barW * 2 + gap + 11} y2={barH - actualFillH}
              stroke="#E24B4A" strokeWidth="1" />
            <line x1={barW * 2 + gap + 5} y1={barH - normalFillH}
              x2={barW * 2 + gap + 11} y2={barH - normalFillH}
              stroke="#E24B4A" strokeWidth="1" />
            <text
              x={barW * 2 + gap + 16}
              y={barH - actualFillH + (actualFillH - normalFillH) / 2 + 4}
              fontSize="11" fill="#E24B4A"
              fontFamily="Inter, sans-serif" fontWeight="500">
              7-8×
            </text>

            {/* Labels */}
            <text x={barW / 2} y={barH + 16} fontSize="10" fill="#85B7EB"
              textAnchor="middle" fontFamily="Inter, sans-serif">Normal</text>
            <text x={barW / 2} y={barH + 28} fontSize="10" fill="#85B7EB"
              textAnchor="middle" fontFamily="Inter, sans-serif">monsoon</text>
            <text x={barW + gap + barW / 2} y={barH + 16} fontSize="10"
              fill="#185FA5" textAnchor="middle"
              fontFamily="Inter, sans-serif" fontWeight="500">2022</text>
            <text x={barW + gap + barW / 2} y={barH + 28} fontSize="10"
              fill="#185FA5" textAnchor="middle"
              fontFamily="Inter, sans-serif" fontWeight="500">Pakistan</text>
          </svg>

          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#85B7EB', opacity: 0.7 }} />
              <span style={{ fontSize: 10, color: '#888780' }}>Normal year</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#185FA5', opacity: 0.75 }} />
              <span style={{ fontSize: 10, color: '#888780' }}>2022 actual</span>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#B4B2A9', lineHeight: 1.5, maxWidth: 220 }}>
            The 2022 monsoon delivered 7–8× the normal rainfall across Sindh. Climate change made rainfall this extreme 75% more likely.
          </div>
        </div>

        <div style={{ paddingTop: 4 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 52, color: '#378ADD',
            fontWeight: 400, lineHeight: 1, marginBottom: 4,
          }}>
            +75%
          </div>
          <div style={{ fontSize: 13, color: '#2C2C2A', marginBottom: 8, fontWeight: 500 }}>
            more likely
          </div>
          <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6, maxWidth: 180 }}>
            Climate change made extreme rainfall like this 75% more likely – the flood would still have happened but would have been less severe.
          </div>
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: '#E6F1FB', borderRadius: 6,
            fontSize: 11, color: '#0C447C', lineHeight: 1.5,
          }}>
            Fraction of Attributable Risk<br/>method · WWA 2022
          </div>
        </div>
      </div>
    </div>
  );
}
