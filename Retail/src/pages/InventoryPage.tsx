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

const BLUE   = '#2B3CC1';
const NAVY   = '#0F1875';
const TEXT   = '#1f2124';
const TEXT2  = '#515962';
const BG     = '#F0F2FF';
const BG2    = '#E5E8FA';
const BORDER = 'rgba(43,60,193,0.10)';
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
}

function KpiCardView({ kpi }: { kpi: KpiCard }) {
  const isPositive = kpi.deltaDir === 'up' ? kpi.deltaGood : !kpi.deltaGood;
  const deltaColor = kpi.deltaDir === 'neutral' ? TEXT2 : isPositive ? GREEN : RED;
  const arrow = kpi.deltaDir === 'up' ? '↑' : kpi.deltaDir === 'down' ? '↓' : '→';
  const sparkColor = kpi.deltaDir === 'neutral' ? BLUE : isPositive ? BLUE : '#e55';

  return (
    <div style={{ flex: '1 1 0', minWidth: 180, backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1rem 1rem 0.75rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{kpi.title}</div>
      <div style={{ fontSize: 11, color: TEXT2, marginBottom: 8 }}>{kpi.period}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{kpi.value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, backgroundColor: isPositive ? 'rgba(22,163,74,0.10)' : kpi.deltaDir === 'neutral' ? BG2 : 'rgba(220,38,38,0.08)', color: deltaColor, borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 600 }}>
          {arrow} {kpi.delta}
        </span>
        <span style={{ fontSize: 11, color: TEXT2 }}>vs {kpi.prevLabel}</span>
      </div>
      <Sparkline data={kpi.data} color={sparkColor} />
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const seed = (n: number) => { let x = n; return () => { x = (x * 1664525 + 1013904223) & 0xffffffff; return (x >>> 0) / 0xffffffff; }; };
const wave = (base: number, vol: number, n: number, rng: () => number) =>
  Array.from({ length: n }, (_, i) => +(base + Math.sin(i / 3) * vol * 0.4 + (rng() - 0.5) * vol).toFixed(0));

// ─── Category row types ───────────────────────────────────────────────────────

type RowContent =
  | { type: 'embed'; vizIds: string[]; activeTabId?: string }
  | { type: 'kpis'; kpis: KpiCard[] };

interface CategoryRow {
  id: string;
  name: string;
  icon: React.ReactNode;
  stat1Label: string; stat1Value: string;
  stat2Label: string; stat2Value: string;
  stat3Label: string; stat3Value: string;
  content: RowContent;
}

// ─── Embed customizations ─────────────────────────────────────────────────────

const INVENTORY_CUSTOMIZATIONS = {
  ...LIVEBOARD_DARK_CUSTOMIZATIONS,
  style: {
    ...LIVEBOARD_DARK_CUSTOMIZATIONS.style,
    customCSS: {
      ...LIVEBOARD_DARK_CUSTOMIZATIONS.style.customCSS,
      rules_UNSTABLE: {
        ...LIVEBOARD_DARK_CUSTOMIZATIONS.style.customCSS.rules_UNSTABLE,
        '[class*="liveboardHeader"]':  { display: 'none !important' },
        '[class*="liveboard-header"]': { display: 'none !important' },
        '[class*="pinboardHeader"]':   { display: 'none !important' },
        '[class*="liveboardTitle"]':   { display: 'none !important' },
        '[class*="liveboardTopBar"]':  { display: 'none !important' },
        '[class*="top-bar"]':          { display: 'none !important' },
        '[class*="filterRow"]':        { display: 'none !important' },
        '[class*="FilterBar"]':        { display: 'none !important' },
        '[class*="groupHeader"]':      { display: 'none !important' },
        '[class*="noteTitle"]':        { display: 'none !important' },
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
        customizations={INVENTORY_CUSTOMIZATIONS}
        onError={onError}
        style={{ width: '100%', minHeight: EMBED_MIN_H, display: 'block', border: 'none' }}
      />
    </div>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

function CategoryRowItem({ row, defaultOpen = false, hiddenActions, disabledActions, onError }: {
  row: CategoryRow;
  defaultOpen?: boolean;
  hiddenActions: Action[];
  disabledActions: Action[];
  onError: (err: any) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '0.875rem 1.25rem', backgroundColor: open ? BG2 : '#FFFFFF', borderBottom: open ? `1px solid ${BORDER}` : 'none', transition: 'background 0.15s' }}>

        {/* Icon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 220px', minWidth: 160 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {row.icon}
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: NAVY, letterSpacing: '-0.01em' }}>{row.name}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2.5rem', flex: 1, flexWrap: 'wrap' }}>
          {[
            { label: row.stat1Label, value: row.stat1Value },
            { label: row.stat2Label, value: row.stat2Value },
            { label: row.stat3Label, value: row.stat3Value },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: TEXT2 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginTop: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: open ? NAVY : BLUE, color: '#FFFFFF', border: 'none', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, letterSpacing: '-0.01em', transition: 'background 0.15s' }}
        >
          {open ? 'Hide Insights' : 'View Insights'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Content panel */}
      {open && row.content.type === 'embed' && (
        <EmbedPanel
          vizIds={row.content.vizIds}
          activeTabId={row.content.activeTabId}
          hiddenActions={hiddenActions}
          disabledActions={disabledActions}
          onError={onError}
        />
      )}
      {open && row.content.type === 'kpis' && (
        <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {row.content.kpis.map(kpi => <KpiCardView key={kpi.title} kpi={kpi} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const ICONS: Record<string, React.ReactNode> = {
  electronics:  <svg {...iconProps}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  appliances:   <svg {...iconProps}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  fashion:      <svg {...iconProps}><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>,
  sports:       <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M9.17 14.83l-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>,
  health:       <svg {...iconProps}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  toys:         <svg {...iconProps}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg>,
  books:        <svg {...iconProps}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  garden:       <svg {...iconProps}><path d="M12 22V12"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M12 12C12 7 7 4 2 6c0 5 4.5 8 10 6"/><path d="M12 12c0-5 5-8 10-6 0 5-4.5 8-10 6"/></svg>,
};

// ─── Category data ────────────────────────────────────────────────────────────

const r1 = seed(11); const r2 = seed(22); const r3 = seed(33); const r4 = seed(44);
const r5 = seed(55); const r6 = seed(66); const r7 = seed(77); const r8 = seed(88);

const CATEGORIES: CategoryRow[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: ICONS.electronics,
    stat1Label: 'Units In Stock',  stat1Value: '48,312',
    stat2Label: 'Units Sold',      stat2Value: '12,847',
    stat3Label: 'Top Channel',     stat3Value: 'OnBuy',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '48,312', delta: '2.1%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (47,318)', data: wave(44000, 5000, 24, seed(301)) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '12,847', delta: '15.3%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (11,143)', data: wave(10000, 2500, 24, seed(302)) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '26.6%',  delta: '3.2%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (23.4%)',  data: wave(22, 4, 24, seed(303)) },
        { title: 'Stock Health Score', period: 'Week of 01 Sep 2026', value: '85/100', delta: '5 pts', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (80)',      data: wave(78, 8, 24, seed(304)) },
      ],
    },
  },
  {
    id: 'appliances',
    name: 'Home & Appliances',
    icon: ICONS.appliances,
    stat1Label: 'Units In Stock',  stat1Value: '22,104',
    stat2Label: 'Units Sold',      stat2Value: '5,631',
    stat3Label: 'Top Channel',     stat3Value: 'Comet',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '22,104', delta: '3.5%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (21,357)', data: wave(20000, 3000, 24, seed(201)) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '5,631',  delta: '9.1%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (5,161)',  data: wave(4800, 900, 24, seed(202)) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '25.5%',  delta: '1.3%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (24.2%)',  data: wave(23, 3, 24, seed(203)) },
        { title: 'Return Rate',        period: 'Week of 01 Sep 2026', value: '5.8%',   delta: '0.7%',  deltaDir: 'down', deltaGood: true,  prevLabel: 'prev week (6.5%)',   data: wave(7, 1.5, 24, seed(204)) },
      ],
    },
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    icon: ICONS.fashion,
    stat1Label: 'Units In Stock',  stat1Value: '91,760',
    stat2Label: 'Units Sold',      stat2Value: '34,210',
    stat3Label: 'Top Channel',     stat3Value: 'easyShop',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '91,760', delta: '4.2%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (88,052)', data: wave(85000, 8000, 24, r1) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '34,210', delta: '11.3%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (30,740)', data: wave(28000, 5000, 24, r2) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '37.3%',  delta: '2.6%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (34.7%)',  data: wave(33, 5, 24, r3) },
        { title: 'Return Rate',        period: 'Week of 01 Sep 2026', value: '8.1%',   delta: '0.9%',  deltaDir: 'up',   deltaGood: false, prevLabel: 'prev week (7.2%)',   data: wave(7, 2, 24, r4) },
      ],
    },
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    icon: ICONS.sports,
    stat1Label: 'Units In Stock',  stat1Value: '37,540',
    stat2Label: 'Units Sold',      stat2Value: '9,188',
    stat3Label: 'Top Channel',     stat3Value: 'OnBuy',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '37,540', delta: '1.8%',  deltaDir: 'down', deltaGood: false, prevLabel: 'prev week (38,222)', data: wave(38000, 3000, 24, r5) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '9,188',  delta: '22.4%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (7,504)', data: wave(7000, 2000, 24, r6) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '24.5%',  delta: '5.1%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (19.4%)', data: wave(19, 5, 24, r7) },
        { title: 'Stock Health Score', period: 'Week of 01 Sep 2026', value: '81/100', delta: '3 pts', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (78)',     data: wave(75, 8, 24, r8) },
      ],
    },
  },
  {
    id: 'health',
    name: 'Health & Beauty',
    icon: ICONS.health,
    stat1Label: 'Units In Stock',  stat1Value: '64,920',
    stat2Label: 'Units Sold',      stat2Value: '19,305',
    stat3Label: 'Top Channel',     stat3Value: 'easyShop',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '64,920', delta: '3.1%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (62,966)', data: wave(60000, 6000, 24, seed(91)) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '19,305', delta: '8.7%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (17,758)', data: wave(16000, 3000, 24, seed(92)) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '29.7%',  delta: '1.4%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (28.3%)',  data: wave(27, 4, 24, seed(93)) },
        { title: 'Return Rate',        period: 'Week of 01 Sep 2026', value: '4.2%',   delta: '0.5%', deltaDir: 'down', deltaGood: true,  prevLabel: 'prev week (4.7%)',   data: wave(5, 1.5, 24, seed(94)) },
      ],
    },
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    icon: ICONS.toys,
    stat1Label: 'Units In Stock',  stat1Value: '29,874',
    stat2Label: 'Units Sold',      stat2Value: '7,640',
    stat3Label: 'Top Channel',     stat3Value: 'OnBuy',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '29,874', delta: '6.3%',  deltaDir: 'down', deltaGood: false, prevLabel: 'prev week (31,879)', data: wave(31000, 4000, 24, seed(95)) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '7,640',  delta: '14.9%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (6,649)', data: wave(6000, 1500, 24, seed(96)) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '25.6%',  delta: '3.8%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (21.8%)', data: wave(21, 5, 24, seed(97)) },
        { title: 'Stock Health Score', period: 'Week of 01 Sep 2026', value: '74/100', delta: '4 pts', deltaDir: 'down', deltaGood: false, prevLabel: 'prev week (78)',     data: wave(78, 6, 24, seed(98)) },
      ],
    },
  },
  {
    id: 'books',
    name: 'Books & Media',
    icon: ICONS.books,
    stat1Label: 'Units In Stock',  stat1Value: '112,440',
    stat2Label: 'Units Sold',      stat2Value: '28,910',
    stat3Label: 'Top Channel',     stat3Value: 'OnBuy',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '112,440', delta: '0.9%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (111,440)', data: wave(108000, 6000, 24, seed(101)) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '28,910',  delta: '5.2%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (27,480)',  data: wave(25000, 4000, 24, seed(102)) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '25.7%',   delta: '1.1%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (24.6%)',   data: wave(23, 3, 24, seed(103)) },
        { title: 'Return Rate',        period: 'Week of 01 Sep 2026', value: '2.8%',    delta: '0.3%', deltaDir: 'down', deltaGood: true,  prevLabel: 'prev week (3.1%)',    data: wave(3.5, 0.8, 24, seed(104)) },
      ],
    },
  },
  {
    id: 'garden',
    name: 'Garden & DIY',
    icon: ICONS.garden,
    stat1Label: 'Units In Stock',  stat1Value: '43,215',
    stat2Label: 'Units Sold',      stat2Value: '11,874',
    stat3Label: 'Top Channel',     stat3Value: 'Comet',
    content: {
      type: 'kpis',
      kpis: [
        { title: 'Units In Stock',     period: 'Week of 01 Sep 2026', value: '43,215', delta: '2.4%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (42,192)', data: wave(40000, 5000, 24, seed(111)) },
        { title: 'Units Sold',         period: 'Week of 01 Sep 2026', value: '11,874', delta: '18.6%', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (10,012)', data: wave(9500, 2000, 24, seed(112)) },
        { title: 'Sell-Through Rate',  period: 'Week of 01 Sep 2026', value: '27.5%',  delta: '4.2%',  deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (23.3%)',  data: wave(22, 5, 24, seed(113)) },
        { title: 'Stock Health Score', period: 'Week of 01 Sep 2026', value: '88/100', delta: '2 pts', deltaDir: 'up',   deltaGood: true,  prevLabel: 'prev week (86)',      data: wave(83, 6, 24, seed(114)) },
      ],
    },
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { hiddenActions, disabledActions } = useTier();

  const onError = useCallback((err: { data?: { errorMessage?: string }; message?: string }) => {
    console.error('[ThoughtSpot – Inventory]', formatThoughtSpotEmbedError(err), err);
  }, []);

  return (
    <div style={{ backgroundColor: BG, minHeight: `calc(100vh - ${TOP_HEADER_PX}px)` }}>
      <div style={{ padding: '2rem 2.5rem 3rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.40)', marginBottom: 6 }}>
            Lumira
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Inventory
          </h1>
          <p style={{ fontSize: 13, color: TEXT2, margin: 0 }}>
            Stock &amp; sales by product category — select a category to view its insights
          </p>
        </div>

        {/* Category rows */}
        {CATEGORIES.map((cat, i) => (
          <CategoryRowItem
            key={cat.id}
            row={cat}
            defaultOpen={false}
            hiddenActions={hiddenActions}
            disabledActions={disabledActions}
            onError={onError}
          />
        ))}
      </div>
    </div>
  );
}
