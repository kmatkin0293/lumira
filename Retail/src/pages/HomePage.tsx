import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TOP_HEADER_PX } from '../config/thoughtspot';

const BLUE  = '#2B3CC1';
const NAVY  = '#0F1875';
const TEXT  = '#1f2124';
const TEXT2 = '#515962';

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconPulse() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ─── Live alert card ─────────────────────────────────────────────────────────

function LiveAlert({ tag, text, detail, delay }: { tag: string; text: string; detail: string; delay: string }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid rgba(43,60,193,0.12)',
        boxShadow: '0 1px 4px rgba(43,60,193,0.06)',
        animation: 'fadeInUp 0.5s ease both',
        animationDelay: delay,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: BLUE, marginTop: 5, flexShrink: 0 }} />
      <div>
        <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: BLUE, marginBottom: 2 }}>
          {tag}
        </span>
        <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.35 }}>{text}</p>
        <p style={{ fontSize: 12, color: TEXT2, margin: '2px 0 0', lineHeight: 1.4 }}>{detail}</p>
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, body, visual }: { icon: React.ReactNode; title: string; body: string; visual?: React.ReactNode }) {
  return (
    <div
      style={{
        flex: '1 1 0', minWidth: 240,
        backgroundColor: '#F4F6FB',
        borderRadius: 12,
        border: '1px solid rgba(43,60,193,0.08)',
        padding: '1.5rem',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1 }}>
        {visual && <div style={{ marginBottom: '1.25rem' }}>{visual}</div>}
      </div>
      <div>
        <div style={{ marginBottom: 10 }}>{icon}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ fontSize: 13, color: TEXT2, lineHeight: 1.65, margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

// ─── Stat chip ───────────────────────────────────────────────────────────────

function StatChip({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
        {icon}
        <span style={{ fontSize: 36, fontWeight: 800, color: NAVY, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</span>
      </div>
      <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: `calc(100vh - ${TOP_HEADER_PX}px)` }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2.5rem 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3rem', flexWrap: 'wrap' }}>

          {/* Left: copy */}
          <div style={{ flex: '1 1 420px', maxWidth: 560 }}>
            <h1
              style={{
                fontSize: 'clamp(36px, 4.5vw, 54px)',
                fontWeight: 800,
                color: TEXT,
                lineHeight: 1.1,
                letterSpacing: '-0.035em',
                margin: '0 0 1.25rem',
              }}
            >
              Smarter retail{' '}
              <span style={{ color: BLUE }}>starts here</span>
            </h1>
            <p style={{ fontSize: 16, color: TEXT2, lineHeight: 1.65, margin: '0 0 2rem', maxWidth: 480 }}>
              Intelligent analytics for Sales, Channels, and Product Performance —
              continuously monitoring your commerce data and surfacing
              opportunities before they slip away.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  backgroundColor: BLUE, color: '#FFFFFF',
                  border: 'none', padding: '12px 22px', borderRadius: 6,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
                }}
              >
                Explore your data
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigate('/analytics')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  backgroundColor: '#FFFFFF', color: TEXT,
                  border: '1.5px solid rgba(0,0,0,0.18)', padding: '12px 22px', borderRadius: 6,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
                }}
              >
                Ask Lumira AI
              </button>
            </div>

            {/* Stat row */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {[
                { value: '140M+', label: 'Global customers' },
                { value: '40+',   label: 'Retail channels' },
                { value: '20+',   label: 'Countries' },
              ].map(s => (
                <div key={s.value}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: TEXT2, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live feed */}
          <div style={{ flex: '0 0 auto', width: 310, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE, marginBottom: 4 }}>
              Live agent feed
            </div>
            <LiveAlert tag="Channel Alert · easyShop · Week 37" text="Conversion rate drop detected" detail="easyShop channel down 14% vs. last week. Pricing and listing audit recommended." delay="0.1s" />
            <LiveAlert tag="Opportunity · OnBuy · Electronics" text="High-demand product under-stocked" detail="Top-selling headphones 89% sell-through. Restock across 3 channels to avoid lost sales." delay="0.25s" />
            <LiveAlert tag="Trend · Comet · Home Appliances" text="Spike in demand — week 37" detail="Search volume up 42% vs. last week. Expand listings to capture market momentum." delay="0.4s" />
          </div>
        </div>
      </div>

      {/* ── Thin blue divider ─────────────────────────────────────────────── */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${BLUE} 0%, rgba(43,60,193,0.15) 100%)`, maxWidth: 1100, margin: '0 auto 0', borderRadius: 2 }} />

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#F4F6FB', borderTop: '1px solid rgba(43,60,193,0.08)', borderBottom: '1px solid rgba(43,60,193,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: BLUE, margin: '0 0 8px' }}>
              Agentic Analytics
            </p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', margin: 0 }}>
            Commerce intelligence that keeps channels growing and customers buying.
          </h2>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <FeatureCard
              icon={<IconPulse />}
              title="Live Sales Monitoring"
              body="Every transaction, channel listing, and fulfilment event tracked across all retail partners in real time. Full commerce visibility, every second."
              visual={
                <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 3, paddingBottom: 2 }}>
                  {[55, 72, 60, 88, 65, 92, 78, 84, 70, 95, 80, 68].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: i === 10 ? BLUE : `rgba(43,60,193,${0.12 + i * 0.025})`, borderRadius: '2px 2px 0 0' }} />
                  ))}
                </div>
              }
            />
            <FeatureCard
              icon={<IconBell />}
              title="Channel & Stock Alerts"
              body="Instant alerts when metrics deviate — low inventory, demand spikes, or underperforming channels. Zero lag between signal and action."
              visual={
                <div style={{ height: 100, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ position: 'absolute', width: i * 56, height: i * 56, borderRadius: '50%', border: `1.5px solid rgba(43,60,193,${0.22 - i * 0.05})` }} />
                  ))}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: BLUE, zIndex: 1 }} />
                </div>
              }
            />
            <FeatureCard
              icon={<IconStar />}
              title="Smart Recommendations"
              body='Proactive actions before you ask: "Expand to OnBuy — trending product, 0% saturation" or "Restock headphones — 89% sell-through across 3 channels."'
              visual={
                <div style={{ height: 100, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                  {[{ label: 'Channel fill rate', pct: 96 }, { label: 'On-time dispatch', pct: 94 }, { label: 'Buyer satisfaction', pct: 91 }].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: TEXT2 }}>{item.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>{item.pct}%</span>
                      </div>
                      <div style={{ height: 5, backgroundColor: 'rgba(43,60,193,0.12)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${item.pct}%`, backgroundColor: BLUE, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center' }}>
          <StatChip value="140M+" label="Global customers" icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          } />
          <StatChip value="100M+" label="Products listed" icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          } />
          <StatChip value="40+" label="Retail channels" icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          } />
          <StatChip value="20+" label="Countries" icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          } />
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2.5rem' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: BLUE, margin: '0 0 8px' }}>
            How it works
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', margin: '0 0 2.5rem' }}>
            Agentic commerce intelligence across every channel and market.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 0 }}>
            {[
              { num: '01', title: 'Commerce data streams in live', body: 'Every sale, listing update, channel event, and fulfilment flow feeds into Lumira Analytics in real time — per channel, per category, per product.' },
              { num: '02', title: 'Agent watches for signals', body: 'The commerce agent continuously compares live sales and channel metrics against targets and forecasts — scoring every opportunity and risk by business impact.' },
              { num: '03', title: 'You get the right action', body: 'Channel managers receive targeted, actionable alerts — not noise. Low stock flagged. Demand spike detected. Expansion opportunity identified.' },
            ].map((step, i) => (
              <div key={step.num} style={{ padding: '1.5rem 2rem', borderLeft: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, marginBottom: 10, letterSpacing: '0.04em' }}>{step.num}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{step.title}</h4>
                <p style={{ fontSize: 13, color: TEXT2, lineHeight: 1.65, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: NAVY }}>
        <div
          style={{
            maxWidth: 1100, margin: '0 auto', padding: '2.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap',
          }}
        >
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
              Your commerce data. Fully in view.
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(232,238,248,0.55)', margin: 0 }}>
              Live channel dashboards, AI-driven product queries, and proactive sales and inventory alerts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              style={{
                backgroundColor: BLUE, color: '#FFFFFF',
                border: 'none', padding: '11px 22px', borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Ask the Agent
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: 'transparent', color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.25)', padding: '11px 22px', borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              View dashboards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
