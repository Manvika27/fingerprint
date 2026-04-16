import React, { useEffect, useState } from 'react';

export default function FloodGauge({ event }) {
  const [filled, setFilled] = useState(0);

  const likelihoodPct = event.attribution?.likelihood_pct_increase ?? 75;

  // Scale gauge: baseline at 45%, climate-elevated proportional to likelihood
  const baselinePct = 45;
  const actualPct = Math.min(95, baselinePct + (likelihoodPct / 200) * 55);

  useEffect(() => {
    const t = setTimeout(() => setFilled(actualPct), 400);
    return () => clearTimeout(t);
  }, [actualPct]);

  const gaugeH = 200;
  const gaugeW = 48;
  const baselineY = gaugeH - (baselinePct / 100) * gaugeH;
  const fillH = (filled / 100) * gaugeH;
  const baselineFillH = (baselinePct / 100) * gaugeH;

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2.5rem' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 500,
            color: '#185FA5',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12,
          }}>
            Flood water level
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <svg width={gaugeW + 80} height={gaugeH + 20}>
              <defs>
                <clipPath id="gaugeClip">
                  <rect x="0" y="0" width={gaugeW} height={gaugeH} rx="6" />
                </clipPath>
              </defs>

              {/* Gauge background */}
              <rect
                x="0" y="0"
                width={gaugeW} height={gaugeH}
                rx="6" fill="#EBF4FB"
                stroke="#B5D4F4" strokeWidth="0.5"
              />

              {/* Baseline water level */}
              <rect
                x="0"
                y={gaugeH - baselineFillH}
                width={gaugeW}
                height={baselineFillH}
                fill="#85B7EB"
                opacity="0.5"
                clipPath="url(#gaugeClip)"
              />

              {/* Climate-elevated water */}
              <rect
                x="0"
                y={gaugeH - fillH}
                width={gaugeW}
                height={Math.max(0, fillH - baselineFillH)}
                fill="#E24B4A"
                opacity="0.75"
                clipPath="url(#gaugeClip)"
                style={{ transition: 'y 1.2s ease-out, height 1.2s ease-out' }}
              />

              {/* Baseline marker line */}
              <line
                x1="0" y1={baselineY}
                x2={gaugeW} y2={baselineY}
                stroke="#185FA5"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* Baseline label */}
              <text
                x={gaugeW + 8} y={baselineY + 4}
                fontSize="10" fill="#185FA5"
                fontFamily="Inter, sans-serif"
              >
                Without climate change
              </text>

              {/* Climate added bracket */}
              <line
                x1={gaugeW + 4} y1={gaugeH - fillH}
                x2={gaugeW + 4} y2={baselineY}
                stroke="#E24B4A" strokeWidth="1"
              />
              <line
                x1={gaugeW + 1} y1={gaugeH - fillH}
                x2={gaugeW + 7} y2={gaugeH - fillH}
                stroke="#E24B4A" strokeWidth="1"
              />
              <line
                x1={gaugeW + 1} y1={baselineY}
                x2={gaugeW + 7} y2={baselineY}
                stroke="#E24B4A" strokeWidth="1"
              />

              {/* Climate added label */}
              <text
                x={gaugeW + 12}
                y={gaugeH - fillH + (baselineY - (gaugeH - fillH)) / 2 + 4}
                fontSize="10" fill="#E24B4A"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                +{likelihoodPct}% climate
              </text>
              <text
                x={gaugeW + 12}
                y={gaugeH - fillH + (baselineY - (gaugeH - fillH)) / 2 + 16}
                fontSize="10" fill="#E24B4A"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                signal
              </text>
            </svg>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#85B7EB', opacity: 0.7 }} />
              <span style={{ fontSize: 10, color: '#888780' }}>Baseline flood</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#E24B4A', opacity: 0.75 }} />
              <span style={{ fontSize: 10, color: '#888780' }}>Climate added</span>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: '#B4B2A9', lineHeight: 1.5, maxWidth: 220 }}>
            The flood would still have happened —<br/>
            climate change made it {likelihoodPct}% more likely<br/>
            and significantly more severe.
          </div>
        </div>

        <div style={{ paddingTop: 4 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 52, color: '#378ADD',
            fontWeight: 400, lineHeight: 1, marginBottom: 4,
          }}>
            +{likelihoodPct}%
          </div>
          <div style={{ fontSize: 13, color: '#2C2C2A', marginBottom: 8, fontWeight: 500 }}>
            more likely
          </div>
          <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6, maxWidth: 180 }}>
            Climate change made the extreme rainfall that caused these floods approximately {likelihoodPct}% more likely.
          </div>
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: '#E6F1FB', borderRadius: 6,
            fontSize: 11, color: '#0C447C', lineHeight: 1.5,
          }}>
            7–8× the normal monsoon<br/>
            rainfall across Sindh
          </div>
        </div>
      </div>
    </div>
  );
}
