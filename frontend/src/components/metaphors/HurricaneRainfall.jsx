import React, { useEffect, useState } from 'react';

export default function HurricaneRainfall({ event }) {
  const [filled, setFilled] = useState(false);

  const baselineInches = 20;
  const actualInches = 23.6;
  const maxInches = 28;
  const baselinePct = (baselineInches / maxInches) * 100;
  const actualPct = (actualInches / maxInches) * 100;

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 400);
    return () => clearTimeout(t);
  }, []);

  const barW = 52;
  const barH = 180;
  const gap = 28;
  const totalW = barW * 2 + gap + 120;

  const baselineFillH = (baselinePct / 100) * barH;
  const actualFillH = (actualPct / 100) * barH;

  const raindrops = Array.from({ length: 12 }, (_, i) => ({
    x: (i % 4) * 12 + 4,
    delay: (i * 0.15) % 0.6,
    duration: 0.4 + (i % 3) * 0.1
  }));

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '2.5rem'
      }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 500,
            color: '#534AB7',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12
          }}>
            Rainfall accumulation
          </div>

          <svg width={totalW} height={barH + 40}>
            <defs>
              <clipPath id="leftClip">
                <rect x="0" y="0" width={barW} height={barH} rx="4" />
              </clipPath>
              <clipPath id="rightClip">
                <rect x={barW + gap} y="0" width={barW} height={barH} rx="4" />
              </clipPath>
              <style>{`
                @keyframes raindrop {
                  0% { transform: translateY(-8px); opacity: 0; }
                  20% { opacity: 1; }
                  100% { transform: translateY(${barH}px); opacity: 0; }
                }
              `}</style>
            </defs>

            {/* Left bar – baseline */}
            <rect x="0" y="0" width={barW} height={barH}
              rx="4" fill="#EEEDFE" stroke="#AFA9EC" strokeWidth="0.5" />
            <rect
              x="0"
              y={filled ? barH - baselineFillH : barH}
              width={barW}
              height={filled ? baselineFillH : 0}
              fill="#7F77DD" opacity="0.6"
              clipPath="url(#leftClip)"
              style={{ transition: 'y 1s ease-out, height 1s ease-out' }}
            />

            {/* Right bar – actual Ian */}
            <rect x={barW + gap} y="0" width={barW} height={barH}
              rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5" />
            <rect
              x={barW + gap}
              y={filled ? barH - actualFillH : barH}
              width={barW}
              height={filled ? actualFillH : 0}
              fill="#534AB7" opacity="0.8"
              clipPath="url(#rightClip)"
              style={{ transition: 'y 1.3s ease-out, height 1.3s ease-out' }}
            />

            {/* Animated raindrops on right bar */}
            {filled && raindrops.map((drop, i) => (
              <line
                key={i}
                x1={barW + gap + drop.x}
                y1={0}
                x2={barW + gap + drop.x - 2}
                y2={6}
                stroke="#AFA9EC"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{
                  animation: `raindrop ${drop.duration}s ${drop.delay}s infinite linear`
                }}
              />
            ))}

            {/* Baseline marker line across both */}
            <line
              x1="0" y1={barH - baselineFillH}
              x2={barW * 2 + gap} y2={barH - baselineFillH}
              stroke="#534AB7" strokeWidth="1"
              strokeDasharray="3 2" opacity="0.4"
            />

            {/* +18% bracket */}
            <line
              x1={barW * 2 + gap + 8}
              y1={barH - actualFillH}
              x2={barW * 2 + gap + 8}
              y2={barH - baselineFillH}
              stroke="#E24B4A" strokeWidth="1"
            />
            <line x1={barW * 2 + gap + 5} y1={barH - actualFillH}
              x2={barW * 2 + gap + 11} y2={barH - actualFillH}
              stroke="#E24B4A" strokeWidth="1" />
            <line x1={barW * 2 + gap + 5} y1={barH - baselineFillH}
              x2={barW * 2 + gap + 11} y2={barH - baselineFillH}
              stroke="#E24B4A" strokeWidth="1" />
            <text
              x={barW * 2 + gap + 16}
              y={barH - actualFillH + (actualFillH - baselineFillH) / 2 + 4}
              fontSize="11" fill="#E24B4A"
              fontFamily="Inter, sans-serif" fontWeight="500"
            >
              +18%
            </text>

            {/* Labels */}
            <text x={barW / 2} y={barH + 16}
              fontSize="10" fill="#7F77DD"
              textAnchor="middle" fontFamily="Inter, sans-serif">
              Without
            </text>
            <text x={barW / 2} y={barH + 28}
              fontSize="10" fill="#7F77DD"
              textAnchor="middle" fontFamily="Inter, sans-serif">
              climate change
            </text>
            <text x={barW + gap + barW / 2} y={barH + 16}
              fontSize="10" fill="#534AB7"
              textAnchor="middle" fontFamily="Inter, sans-serif"
              fontWeight="500">
              Hurricane Ian
            </text>
            <text x={barW + gap + barW / 2} y={barH + 28}
              fontSize="10" fill="#534AB7"
              textAnchor="middle" fontFamily="Inter, sans-serif"
              fontWeight="500">
              2022
            </text>

            {/* Inch labels */}
            <text x={barW / 2} y={barH - baselineFillH - 6}
              fontSize="10" fill="#534AB7"
              textAnchor="middle" fontFamily="Inter, sans-serif">
              ~20"
            </text>
            <text x={barW + gap + barW / 2} y={barH - actualFillH - 6}
              fontSize="11" fill="#534AB7"
              textAnchor="middle" fontFamily="Inter, sans-serif"
              fontWeight="500">
              ~23.6"
            </text>
          </svg>
        </div>

        <div style={{ paddingTop: 4 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 52, color: '#7F77DD',
            fontWeight: 400, lineHeight: 1, marginBottom: 4
          }}>
            +18%
          </div>
          <div style={{
            fontSize: 13, color: '#2C2C2A',
            marginBottom: 8, fontWeight: 500
          }}>
            heavier rainfall
          </div>
          <div style={{
            fontSize: 12, color: '#5F5E5A',
            lineHeight: 1.6, maxWidth: 180
          }}>
            Climate change made Ian's rainfall 18% heavier – far exceeding what basic thermodynamics would predict.
          </div>
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: '#EEEDFE', borderRadius: 6,
            fontSize: 11, color: '#3C3489', lineHeight: 1.5
          }}>
            Storyline method —<br/>
            measures magnitude,<br/>
            not probability
          </div>
        </div>
      </div>
    </div>
  );
}
