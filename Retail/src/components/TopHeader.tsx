import React from 'react';
import { Link } from 'react-router-dom';

const BLUE  = '#2B3CC1';
const DARK  = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.09)';

const ICON_BTN: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'rgba(31,33,36,0.45)',
};

/** Lumira logo mark — faceted gem + wordmark */
function LumiraMark() {
  return (
    <svg width="120" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Faceted gem / luminary mark */}
      <polygon points="14,2 22,9 22,19 14,26 6,19 6,9" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <polygon points="14,2 22,9 14,14 6,9" fill="rgba(255,255,255,0.25)" />
      <line x1="14" y1="2"  x2="14" y2="14" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="6"  y1="9"  x2="22" y2="9"  stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
      {/* Wordmark */}
      <text
        x="30"
        y="20"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="white"
        letterSpacing="-0.03em"
      >
        Lumira
      </text>
    </svg>
  );
}


export default function TopHeader() {
  return (
    <header
      style={{
        height: 56,
        flexShrink: 0,
        backgroundColor: DARK,
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem 0 1.5rem',
        gap: 4,
      }}
    >
      <Link
        to="/home"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textDecoration: 'none',
        }}
      >
        {/* Logo on Lumira blue background */}
        <div style={{
          backgroundColor: BLUE,
          borderRadius: 10,
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <LumiraMark />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(31,33,36,0.40)' }}>
          Retail Intelligence
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" aria-label="Help" style={ICON_BTN}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" aria-label="Notifications" style={{ ...ICON_BTN, position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              position: 'absolute', top: 4, right: 4,
              minWidth: 16, height: 16, borderRadius: 8,
              backgroundColor: BLUE, color: '#FFFFFF',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            }}
          >
            3
          </span>
        </button>
        <button
          type="button"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            backgroundColor: BLUE, color: '#FFFFFF',
            border: 'none', padding: '7px 16px', borderRadius: 6,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
          }}
        >
          Book a Demo

        </button>
      </div>
    </header>
  );
}
