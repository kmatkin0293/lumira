import React, { useCallback, useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { Action } from '@thoughtspot/visual-embed-sdk';
import {
  THOUGHTSPOT_CADENCES_LIVEBOARD_ID,
  TOP_HEADER_PX,
  LIVEBOARD_DARK_CUSTOMIZATIONS,
} from '../config/thoughtspot';
import { useTier } from '../config/TierContext';
import { formatThoughtSpotEmbedError } from '../utils/thoughtspotErrors';

const BLUE   = '#1E5DEB';
const NAVY   = '#071331';
const TEXT   = '#1f2124';
const TEXT2  = '#515962';
const BG     = '#FFFFFF';
const BG2    = '#F4F6FB';
const BORDER = 'rgba(30,93,235,0.10)';
const GREEN  = '#16a34a';
const RED    = '#dc2626';

const EMBED_MIN_H = `calc(100vh - ${TOP_HEADER_PX}px - 280px)`;

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color = BLUE, height = 56 }: { data: number[]; color?: string; height?: number }) {
  const W = 220;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${height} L0,${height} Z`;
  const lastPt = pts[pts.length - 1];
  const gradId = `g${color.replace('#', '')}${height}`;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.14" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={lastPt.x} cy={lastPt.y} r="3.5" fill={color} />
    </svg>
  );
}

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KpiCard {
  title: string;
  period: string;
  value: string;
  delta: string;
  deltaDir: 'up' | 'down' | 'neutral';
  deltaGood: boolean;
  prevLabel: string;
  data: number[];
  badge?: string;
}

function KpiCardView({ kpi }: { kpi: KpiCard }) {
  const isPositive = kpi.deltaDir === 'up' ? kpi.deltaGood : !kpi.deltaGood;
  const deltaColor = kpi.deltaDir === 'neutral' ? TEXT2 : isPositive ? GREEN : RED;
  const arrow = kpi.deltaDir === 'up' ? '↑' : kpi.deltaDir === 'down' ? '↓' : '→';
  const sparkColor = kpi.deltaDir === 'neutral' ? BLUE : isPositive ? BLUE : '#e55';

  return (
    <div style={{ flex: '1 1 0', minWidth: 180, backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1rem 1rem 0.75rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{kpi.title}</div>
      <div style={{ fontSize: 11, color: TEXT2, marginBottom: 8 }}>{kpi.period}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{kpi.value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, backgroundColor: isPositive ? 'rgba(22,163,74,0.10)' : kpi.deltaDir === 'neutral' ? BG2 : 'rgba(220,38,38,0.08)', color: deltaColor, borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 600 }}>
          {arrow} {kpi.delta}
        </span>
        <span style={{ fontSize: 11, color: TEXT2 }}>vs {kpi.prevLabel}</span>
      </div>
      {kpi.badge && <div style={{ fontSize: 10, fontWeight: 600, color: isPositive ? GREEN : RED, marginBottom: 4, textAlign: 'right' }}>{kpi.badge}</div>}
      <Sparkline data={kpi.data} color={sparkColor} />
    </div>
  );
}

// ─── Mock data helpers ────────────────────────────────────────────────────────

const seed = (n: number) => { let x = n; return () => { x = (x * 1664525 + 1013904223) & 0xffffffff; return (x >>> 0) / 0xffffffff; }; };
const wave = (base: number, volatility: number, n: number, rng: () => number) =>
  Array.from({ length: n }, (_, i) => +(base + Math.sin(i / 3) * volatility * 0.4 + (rng() - 0.5) * volatility).toFixed(2));

const r9 = seed(34); const r10 = seed(88); const r11 = seed(51); const r12 = seed(72);

// ─── Cadence row types ────────────────────────────────────────────────────────

type CadenceContent =
  | { type: 'embed'; vizIds: string[]; activeTabId?: string }
  | { type: 'kpis'; kpis: KpiCard[] };

interface Cadence {
  id: string;
  name: string;
  icon: React.ReactNode;
  stat1Label: string; stat1Value: string;
  stat2Label: string; stat2Value: string;
  stat3Label: string; stat3Value: string;
  content: CadenceContent;
}

// ─── Embed panel ──────────────────────────────────────────────────────────────


// Extends the shared light theme but hides the liveboard header bar entirely
// and forces the two KPI tiles to fill the full row width evenly.
const CADENCE_VIZ_CUSTOMIZATIONS = {
  ...LIVEBOARD_DARK_CUSTOMIZATIONS,
  style: {
    ...LIVEBOARD_DARK_CUSTOMIZATIONS.style,
    customCSS: {
      ...LIVEBOARD_DARK_CUSTOMIZATIONS.style.customCSS,
      rules_UNSTABLE: {
        ...LIVEBOARD_DARK_CUSTOMIZATIONS.style.customCSS.rules_UNSTABLE,
        // ── Hide the liveboard top bar ─────────────────────────────────
        '[class*="liveboardHeader"]':        { display: 'none !important' },
        '[class*="liveboard-header"]':       { display: 'none !important' },
        '[class*="pinboardHeader"]':         { display: 'none !important' },
        '[class*="pinboard-header"]':        { display: 'none !important' },
        '[class*="liveboardTitle"]':         { display: 'none !important' },
        '[class*="liveboardTopBar"]':        { display: 'none !important' },
        '[class*="top-bar"]':                { display: 'none !important' },
        '[class*="filterRow"]':              { display: 'none !important' },
        '[class*="filter-row"]':             { display: 'none !important' },
        '[class*="liveboardFilter"]':        { display: 'none !important' },
        '[class*="FilterBar"]':              { display: 'none !important' },
        // ── Hide the group/section title ("Payment KPIs") ──────────────
        '[class*="groupHeader"]':            { display: 'none !important' },
        '[class*="group-header"]':           { display: 'none !important' },
        '[class*="sectionHeader"]':          { display: 'none !important' },
        '[class*="section-header"]':         { display: 'none !important' },
        '[class*="groupTitle"]':             { display: 'none !important' },
        '[class*="group-title"]':            { display: 'none !important' },
        '[class*="noteTitle"]':              { display: 'none !important' },
      },
    },
  },
};

function EmbedPanel({ vizIds, activeTabId, hiddenActions, disabledActions, onError }: {
  vizIds: string[];
  activeTabId?: string;
  hiddenActions: Action[];
  disabledActions: Action[];
  onError: (err: any) => void;
}) {
  return (
    <div style={{ padding: '0.75rem 0 0' }}>
      <LiveboardEmbed
        key={vizIds.join(',')}
        liveboardId={THOUGHTSPOT_CADENCES_LIVEBOARD_ID}
        visibleVizs={vizIds}
        {...(activeTabId ? { activeTabId } : {})}
        fullHeight
        isLiveboardStylingAndGroupingEnabled
        hiddenActions={hiddenActions}
        disabledActions={disabledActions}
        customizations={CADENCE_VIZ_CUSTOMIZATIONS}
        onError={onError}
        style={{ width: '100%', minHeight: EMBED_MIN_H, display: 'block', border: 'none' }}
      />
    </div>
  );
}

// ─── Cadence row ─────────────────────────────────────────────────────────────

function CadenceRow({ cadence, defaultOpen = false, hiddenActions, disabledActions, onError }: {
  cadence: Cadence;
  defaultOpen?: boolean;
  hiddenActions: Action[];
  disabledActions: Action[];
  onError: (err: any) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '0.875rem 1.25rem', backgroundColor: BG2, borderBottom: open ? `1px solid ${BORDER}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {cadence.icon}
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: NAVY, letterSpacing: '-0.01em' }}>{cadence.name}</span>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flex: 1, flexWrap: 'wrap' }}>
          {[
            { label: cadence.stat1Label, value: cadence.stat1Value },
            { label: cadence.stat2Label, value: cadence.stat2Value },
            { label: cadence.stat3Label, value: cadence.stat3Value },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: TEXT2 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginTop: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: open ? NAVY : BLUE, color: '#FFFFFF', border: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, letterSpacing: '-0.01em', transition: 'background 0.15s' }}
        >
          {open ? 'Hide insights' : 'Show insights'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Content panel */}
      {open && cadence.content.type === 'embed' && (
        <EmbedPanel
          vizIds={cadence.content.vizIds}
          activeTabId={cadence.content.activeTabId}
          hiddenActions={hiddenActions}
          disabledActions={disabledActions}
          onError={onError}
        />
      )}
      {open && cadence.content.type === 'kpis' && (
        <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {cadence.content.kpis.map(kpi => <KpiCardView key={kpi.title} kpi={kpi} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page data ────────────────────────────────────────────────────────────────

const INVOICE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const TREND_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const CART_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CADENCES: Cadence[] = [
  {
    id: 'invoice-automation',
    name: 'Monthly Payment Trends',
    icon: INVOICE_ICON,
    stat1Label: 'Total Amount',       stat1Value: '266.75M',
    stat2Label: 'Processing Fee',     stat2Value: 'US$1.86M',
    stat3Label: 'Period',             stat3Value: 'Jul 2026',
    content: { type: 'embed', vizIds: ['2e9b1ff2-0ca8-4691-a66c-b2b3479ccc8a', '832f5f17-9bb3-456a-9be0-545586fb4541'] },
  },
  {
    id: 'ap-performance',
    name: 'Match & Account Trends',
    icon: TREND_ICON,
    stat1Label: 'Period',             stat1Value: 'Jul 2026',
    stat2Label: 'Match Confidence',   stat2Value: '89.4%',
    stat3Label: 'Count of Accounts',  stat3Value: '3',
    content: { type: 'embed', vizIds: ['6a2275d2-da20-4c2d-b2a3-ffc8d6eb65e1', '9a93296f-0bf5-4114-8a98-485254be3bec'], activeTabId: '4fb7f49f-406b-45f7-af0a-9002d2ae0486' },
  },
  {
    id: 'procurement',
    name: 'Procurement Efficiency',
    icon: CART_ICON,
    stat1Label: 'POs Processed', stat1Value: '418',
    stat2Label: 'PO Match Rate', stat2Value: '87.3%',
    stat3Label: 'Cycle Time',    stat3Value: '1.4 days',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'PO Match Rate', period: 'Week of 03/24/2026', value: '87.3%', delta: '2.8%', deltaDir: 'up', deltaGood: true, prevLabel: 'Week of 03/17/2026 (84.9%)', data: wave(82, 8, 24, r9) },
        { title: 'Approval Cycle Time', period: 'Week of 03/24/2026', value: '1.4 days', delta: '12.5%', deltaDir: 'down', deltaGood: true, prevLabel: 'Week of 03/17/2026 (1.6d)', data: wave(2.2, 0.7, 24, r10).map(v => Math.max(0.5, v)) },
        { title: '3-Way Match Rate', period: 'Week of 03/24/2026', value: '72.1%', delta: '3.4%', deltaDir: 'down', deltaGood: false, prevLabel: 'Week of 03/17/2026 (74.7%)', data: wave(74, 6, 24, r11) },
        { title: 'Non-PO Invoice Share', period: 'Week of 03/24/2026', value: '14.3%', delta: '1.8%', deltaDir: 'up', deltaGood: false, prevLabel: 'Week of 03/17/2026 (12.7%)', data: wave(12, 4, 24, r12) },
      ],
    },
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CadencesPage() {
  const { hiddenActions, disabledActions } = useTier();

  const onError = useCallback((err: { data?: { errorMessage?: string }; message?: string }) => {
    console.error('[ThoughtSpot – Cadences]', formatThoughtSpotEmbedError(err), err);
  }, []);

  return (
    <div style={{ backgroundColor: BG, minHeight: `calc(100vh - ${TOP_HEADER_PX}px)` }}>
      <div style={{ padding: '2rem 2.5rem 3rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Cadences
          </h1>
          <p style={{ fontSize: 13, color: TEXT2, margin: 0 }}>
            Select a cadence to see its KPI performance inline — filtered by process area
          </p>
        </div>

        {/* Cadence rows — first one open by default with live embed */}
        {CADENCES.map((c, i) => (
          <CadenceRow
            key={c.id}
            cadence={c}
            defaultOpen={i === 0}
            hiddenActions={hiddenActions}
            disabledActions={disabledActions}
            onError={onError}
          />
        ))}
      </div>
    </div>
  );
}
