import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTier } from '../config/TierContext';
import { Tier } from '../config/tiers';

export const SIDEBAR_WIDTH = 260;

const NAVY  = '#0F1875';
const NAVY2 = '#0A1260';
const BLUE  = '#2B3CC1';
const TIERS: Tier[] = ['Starter', 'Essentials', 'Pro'];

const navItems: { path: string; label: string; icon: React.ReactNode; section?: string }[] = [
  {
    path: '/home',
    label: 'Home',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/dashboard',
    label: 'Overview',
    section: 'Insights',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: '/inventory',
    label: 'Inventory',
    section: 'Insights',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>
      </svg>
    ),
  },
  {
    path: '/restock',
    label: 'Restock',
    section: 'Insights',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    path: '/ask',
    label: 'Ask Lumira',
    section: 'AI Agent',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.5 8.5 22 9.5 17 14.5 18.5 21 12 17.5 5.5 21 7 14.5 2 9.5 8.5 8.5 12 2"/>
      </svg>
    ),
  },
  {
    path: '/analytics',
    label: 'Ask Lumira AI',
    section: 'AI Agent',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    ),
  },
  {
    path: '/search',
    label: 'Data Search',
    section: 'AI Agent',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    path: '/knowledge-hub',
    label: 'Product Insights',
    section: 'AI Agent',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5a2 2 0 0 1 2-2h4v16H6a2 2 0 0 0-2 2zm16 0V5a2 2 0 0 0-2-2h-4v16h4a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { tier, setTier, spotterEnabled } = useTier();

  const linkStyle = (path: string): React.CSSProperties => {
    const active = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      color: active ? '#FFFFFF' : 'rgba(232,238,248,0.55)',
      padding: '9px 10px',
      borderRadius: 7,
      backgroundColor: active ? BLUE : 'transparent',
      transition: 'all 0.12s ease',
      marginBottom: 1,
    };
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: NAVY,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxSizing: 'border-box',
      }}
    >
      {/* Tier selector */}
      <div style={{ padding: '1rem 1rem 0.75rem', flexShrink: 0 }}>
        <div style={{ color: 'rgba(232,238,248,0.35)', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 7 }}>
          Access level (demo)
        </div>
        <div style={{ display: 'flex', backgroundColor: NAVY2, borderRadius: 7, padding: 3 }}>
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 2px',
                fontSize: 11,
                fontWeight: t === tier ? 600 : 400,
                color: t === tier ? '#FFFFFF' : 'rgba(232,238,248,0.45)',
                backgroundColor: t === tier ? BLUE : 'transparent',
                borderRadius: 5,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                border: 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 10, color: 'rgba(232,238,248,0.30)', margin: '7px 0 0', lineHeight: 1.4 }}>
          Starter: read-only. Essentials: limited AI. Pro: full Lumira AI agent.
        </p>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '0.2rem 0.7rem 0.35rem', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {navItems.map((item, idx) => {
          const prevSection = idx > 0 ? navItems[idx - 1].section : null;
          const showSectionHeader = item.section && item.section !== prevSection;
          return (
            <React.Fragment key={item.path}>
              {showSectionHeader && (
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    color: 'rgba(232,238,248,0.30)',
                    padding: idx === 0 ? '6px 10px 4px' : '14px 10px 4px',
                  }}
                >
                  {item.section}
                </div>
              )}
              <Link to={item.path} style={linkStyle(item.path)}>
                <span style={{ display: 'flex', alignItems: 'center', width: 20, justifyContent: 'center', color: 'inherit', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1, lineHeight: 1.35 }}>
                  {item.label}
                </span>
              </Link>
            </React.Fragment>
          );
        })}
        <div style={{ flex: 1, minHeight: 8 }} />
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34, height: 34,
            background: BLUE,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: '#FFFFFF', fontWeight: 700, fontSize: 13,
          }}
        >
          O
        </div>
        <div style={{ lineHeight: 1.35, overflow: 'hidden' }}>
          <div style={{ color: '#e8eef8', fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lumira Analytics</div>
          <div style={{ color: 'rgba(232,238,248,0.40)', fontSize: 11 }}>{tier} plan · demo</div>
        </div>
      </div>
    </aside>
  );
}
