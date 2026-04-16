import React, { useEffect, useState } from 'react';

export default function HeatwaveThermometer({ event }) {
  const [filled, setFilled] = useState(0);

  const recordTemp = event.id === 'uk_heatwave_2022' ? 40.3 : 45.0;
  const baselineTemp = event.id === 'uk_heatwave_2022' ? 36.3 : 40.0;
  const minTemp = 20;
  const maxTemp = 50;

  const toPercent = (t) => ((t - minTemp) / (maxTemp - minTemp)) * 100;

  const recordPct = toPercent(recordTemp);
  const baselinePct = toPercent(baselineTemp);

  useEffect(() => {
    const timer = setTimeout(() => setFilled(recordPct), 300);
    return () => clearTimeout(timer);
  }, [recordPct]);

  const height = 220;
  const bulbR = 14;
  const tubeW = 12;
  const tubeX = 40;
  const tubeTop = 20;
  const tubeBottom = height - bulbR - 10;
  const tubeH = tubeBottom - tubeTop;

  const tempToY = (pct) => tubeBottom - (pct / 100) * tubeH;

  const recordY = tempToY(recordPct);
  const baselineY = tempToY(baselinePct);
  const fillY = tempToY(filled);

  return (
    <div>
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 52, color: '#EF9F27',
        lineHeight: 1, fontWeight: 400,
      }}>
        {event.attribution?.likelihood_ratio
          ? `${event.attribution.likelihood_ratio}×`
          : event.attribution?.likelihood_pct_increase
          ? `+${event.attribution.likelihood_pct_increase}%`
          : '10×'
        }
      </div>
      <div style={{ fontSize: 13, color: '#2C2C2A', fontWeight: 500, marginTop: 4 }}>
        more likely due to climate change
      </div>
    </div>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '2rem',
      padding: '1.5rem 0', marginBottom: '1rem'
    }}>
      <svg width="80" height={height + 20} style={{ flexShrink: 0 }}>
        <rect
          x={tubeX - tubeW/2} y={tubeTop}
          width={tubeW} height={tubeH}
          rx={tubeW/2} fill="#F1EFE8"
        />
        <rect
          x={tubeX - tubeW/2 + 1}
          y={fillY}
          width={tubeW - 2}
          height={tubeBottom - fillY}
          rx={(tubeW-2)/2}
          fill="#E24B4A"
          style={{ transition: 'y 1.2s ease-out, height 1.2s ease-out' }}
        />
        <circle cx={tubeX} cy={tubeBottom + bulbR - 2} r={bulbR} fill="#E24B4A" />
        <circle cx={tubeX} cy={tubeBottom + bulbR - 2} r={bulbR - 4} fill="#F09595" />
        <line
          x1={tubeX - tubeW/2 - 8} y1={baselineY}
          x2={tubeX + tubeW/2 + 4} y2={baselineY}
          stroke="#1D9E75" strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <text x={tubeX + tubeW/2 + 8} y={recordY + 4}
          fontSize="10" fill="#E24B4A" fontFamily="Inter, sans-serif">
          {recordTemp}°C
        </text>
        <text x={tubeX + tubeW/2 + 8} y={baselineY + 4}
          fontSize="10" fill="#1D9E75" fontFamily="Inter, sans-serif">
          {baselineTemp}°C
        </text>
      </svg>

      <div>
        <div style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500, marginBottom: 6 }}>
          Recorded: {recordTemp}°C
        </div>
        <div style={{
          fontSize: 12, color: '#1D9E75', fontWeight: 500,
          marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5
        }}>
          <span style={{
            display: 'inline-block', width: 16, height: 1.5,
            background: '#1D9E75', borderTop: '1.5px dashed #1D9E75'
          }}/>
          Without climate change: ~{baselineTemp}°C
        </div>
        <div style={{
          fontSize: 11, color: '#888780', lineHeight: 1.5,
          maxWidth: 200
        }}>
          The gap between the lines is the climate signal — heat that would not have existed without human emissions.
        </div>
      </div>
    </div>
    </div>
  );
}
