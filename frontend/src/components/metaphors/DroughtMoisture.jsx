import React, { useEffect, useState } from 'react';

export default function DroughtMoisture({ event }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  const normalWidth = 85;
  const droughtWidth = 22;
  const width = 280;
  const barH = 28;

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, color: '#888780', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 6
          }}>
            Normal year
          </div>
          <div style={{
            width: width, height: barH, background: '#F1EFE8',
            borderRadius: 4, overflow: 'hidden'
          }}>
            <div style={{
              width: animated ? `${normalWidth}%` : '0%',
              height: '100%',
              background: 'linear-gradient(to right, #085041, #1D9E75)',
              borderRadius: 4,
              transition: 'width 1s ease-out',
              display: 'flex', alignItems: 'center',
              paddingLeft: 10
            }}>
              <span style={{
                fontSize: 10, color: 'white',
                fontWeight: 500, whiteSpace: 'nowrap'
              }}>
                Soil moisture adequate
              </span>
            </div>
          </div>
        </div>

        <div>
          <div style={{
            fontSize: 10, color: '#A32D2D', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 6
          }}>
            2021–2022 drought
          </div>
          <div style={{
            width: width, height: barH, background: '#F1EFE8',
            borderRadius: 4, overflow: 'hidden', position: 'relative'
          }}>
            <div style={{
              width: animated ? `${droughtWidth}%` : '0%',
              height: '100%',
              background: 'linear-gradient(to right, #712B13, #D85A30)',
              borderRadius: 4,
              transition: 'width 1.4s ease-out',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: `${droughtWidth + 2}%`,
              height: '100%', display: 'flex',
              alignItems: 'center', paddingLeft: 8
            }}>
              <span style={{
                fontSize: 10, color: '#888780',
                fontWeight: 500
              }}>
                Severely depleted
              </span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 10, fontSize: 11,
          color: '#B4B2A9', lineHeight: 1.5
        }}>
          Warmer temperatures pull moisture from soil and plants —<br/>
          droughts become severe even when rainfall is only slightly below average.
        </div>
      </div>
    </div>
  );
}
