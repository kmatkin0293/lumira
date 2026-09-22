import React, { useCallback, useRef, useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { EmbedEvent } from '@thoughtspot/visual-embed-sdk';
import { TOP_HEADER_PX, LIVEBOARD_NO_HEADER_CUSTOMIZATIONS } from '../config/thoughtspot';

// ─── Restock-specific embed customizations ────────────────────────────────────
const RESTOCK_CUSTOMIZATIONS = {
  ...LIVEBOARD_NO_HEADER_CUSTOMIZATIONS,
  style: {
    ...LIVEBOARD_NO_HEADER_CUSTOMIZATIONS.style,
    customCSS: {
      ...LIVEBOARD_NO_HEADER_CUSTOMIZATIONS.style.customCSS,
      rules_UNSTABLE: {
        ...LIVEBOARD_NO_HEADER_CUSTOMIZATIONS.style.customCSS.rules_UNSTABLE,
        // ── Hide "Powered by ThoughtSpot" footer — broad selector net ──────────
        '[class*="poweredBy"], [class*="powered-by"], [class*="brandingFooter"], [class*="branding-footer"], [class*="footerBranding"], [class*="tsFooter"], [class*="liveboardFooter"], [class*="liveboard-footer"], [class*="PoweredBy"], [class*="BrandingFooter"], [class*="watermark"], [class*="Watermark"]':
          { display: 'none !important', height: '0 !important', overflow: 'hidden !important' },
        // Target the link and any sibling container that wraps it
        'a[href*="thoughtspot.com"], a[href*="ThoughtSpot"]':
          { display: 'none !important' },
        // Zero out bottom padding/margin on all layout wrappers
        '[class*="liveboardLayout"], [class*="liveboard-layout"], [class*="pinboardLayout"], [class*="liveboardPage"], [class*="liveboard-page"], [class*="pinboardPage"], [class*="liveboardContainer"], [class*="pageContent"]':
          { paddingBottom: '0 !important', marginBottom: '0 !important' },
      },
    },
  },
};
import { useTier } from '../config/TierContext';
import { formatThoughtSpotEmbedError } from '../utils/thoughtspotErrors';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE  = '#2B3CC1';
const NAVY  = '#0F1875';
const TEXT  = '#1f2124';
const TEXT2 = '#515962';
const BG    = '#F0F2FF';
const LABEL = 'rgba(0,0,0,0.45)';

// ─── Restock liveboard ID ─────────────────────────────────────────────────────
const RESTOCK_LIVEBOARD_ID = 'd0238a6f-dae3-4489-98e8-e6901f48e714';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RowData {
  product:    string;
  category?:  string;
  unitsOnHand?: string;
  unitsSold?:   string;
  channels?:    string;
  leadTime?:    string;
  shortfall?:   string;
  [key: string]: string | undefined;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  row: RowData;
}

interface RestockModalState {
  open: boolean;
  row: RowData;
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { id: 'exclude',  label: (name: string) => `Exclude "${name}"`,        icon: '✕' },
  { id: 'include',  label: (name: string) => `Only include "${name}"`,   icon: '◉' },
  { id: 'drill',    label: ()             => 'Drill down',                icon: '⤵' },
  { id: 'copy',     label: ()             => 'Copy to clipboard',         icon: '⎘' },
  { id: 'restock',  label: ()             => 'Request Restock',           icon: '📦', highlight: true },
];

function ContextMenu({ state, onClose, onRestock }: {
  state: ContextMenuState;
  onClose: () => void;
  onRestock: () => void;
}) {
  if (!state.visible) return null;
  const name = state.row.product || state.row.category || 'Item';

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
        onClick={onClose}
        onContextMenu={e => { e.preventDefault(); onClose(); }}
      />
      {/* Menu */}
      <div
        style={{
          position: 'fixed',
          top: state.y,
          left: state.x,
          zIndex: 1001,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
          minWidth: 210,
          overflow: 'hidden',
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: '8px 14px 6px', borderBottom: '1px solid rgba(0,0,0,0.07)', fontSize: 11, fontWeight: 600, color: LABEL, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {name}
        </div>

        {MENU_ITEMS.map((item, i) => {
          const isRestock = item.id === 'restock';
          const isDivider = item.id === 'restock';
          return (
            <React.Fragment key={item.id}>
              {isDivider && <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.07)', margin: '3px 0' }} />}
              <button
                type="button"
                onClick={() => { onClose(); if (isRestock) onRestock(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 14px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isRestock ? 600 : 400,
                  color: isRestock ? BLUE : TEXT,
                  letterSpacing: '-0.01em',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isRestock ? 'rgba(43,60,193,0.07)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
              >
                <span style={{ width: 16, textAlign: 'center', fontSize: 12 }}>{item.icon}</span>
                <span>{item.label(name)}</span>
                {isRestock && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, backgroundColor: BLUE, color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                    NEW
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

// ─── Restock Modal ────────────────────────────────────────────────────────────

function RestockModal({ state, onClose }: {
  state: RestockModalState;
  onClose: () => void;
}) {
  const { row } = state;
  const [supplier,    setSupplier]    = useState('');
  const [reorderQty,  setReorderQty]  = useState('');
  const [priority,    setPriority]    = useState('Standard');
  const [neededBy,    setNeededBy]    = useState('');
  const [note,        setNote]        = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  const MAX_NOTE = 120;
  const productName = row.product || row.category || '—';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { onClose(); setSubmitted(false); }, 1800);
  };

  if (!state.open) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid rgba(0,0,0,0.18)',
    borderRadius: 7,
    fontSize: 13,
    color: TEXT,
    fontFamily: "'Inter', -apple-system, sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FAFAFA',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: TEXT2,
    marginBottom: 5,
    letterSpacing: '-0.01em',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 2000, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2001,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {/* Box icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: NAVY, letterSpacing: '-0.02em' }}>New Restock Order</div>
              <div style={{ fontSize: 12, color: LABEL }}>Pre-filled from the selected row. Review and submit to trigger a restock through Lumira.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT2, flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form */}
        {submitted ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Restock submitted!</div>
            <div style={{ fontSize: 13, color: TEXT2 }}>Your restock order for <strong>{productName}</strong> has been sent to procurement.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem' }}>
            {/* Row 1: Product + Supplier */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Product</label>
                <input style={{ ...inputStyle, color: NAVY, fontWeight: 600 }} value={productName} readOnly />
              </div>
              <div>
                <label style={labelStyle}>Supplier</label>
                <input style={inputStyle} placeholder="e.g. Acme Distribution" value={supplier} onChange={e => setSupplier(e.target.value)} />
              </div>
            </div>

            {/* Row 2: Units on hand + Reorder qty */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Units on hand</label>
                <input style={{ ...inputStyle, color: NAVY, fontWeight: 600 }} value={row.unitsOnHand || '—'} readOnly />
              </div>
              <div>
                <label style={labelStyle}>Reorder quantity</label>
                <input style={inputStyle} placeholder="e.g. 500" type="number" min="1" value={reorderQty} onChange={e => setReorderQty(e.target.value)} />
              </div>
            </div>

            {/* Row 3: Priority + Needed by */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Priority</label>
                <select
                  style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23515962' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 32, cursor: 'pointer' }}
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option>Standard</option>
                  <option>Urgent</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Needed by</label>
                <input style={inputStyle} type="date" value={neededBy} onChange={e => setNeededBy(e.target.value)} />
              </div>
            </div>

            {/* FROM THIS ROW */}
            <div style={{ backgroundColor: '#F4F6FB', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: 14, border: '1px solid rgba(43,60,193,0.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>From this row</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem' }}>
                {[
                  { label: 'Units Sold',       value: row.unitsSold    || '—' },
                  { label: 'Active Channels',   value: row.channels     || '—' },
                  { label: 'Lead Time (Days)',   value: row.leadTime     || '—' },
                  { label: 'Expected Shortfall', value: row.shortfall    || '0' },
                  { label: 'Sell-Through Rate',  value: row.sellThrough  || '—' },
                ].map(s => (
                  <div key={s.label} style={{ minWidth: 120 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: LABEL, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                <span>Note to procurement</span>
                <span style={{ fontWeight: 400, color: note.length > MAX_NOTE * 0.85 ? '#dc2626' : LABEL }}>{note.length}/{MAX_NOTE}</span>
              </label>
              <textarea
                style={{ ...inputStyle, height: 72, resize: 'vertical', lineHeight: 1.5 }}
                placeholder="Reason, lot constraints, or delivery details..."
                maxLength={MAX_NOTE}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '9px 20px', borderRadius: 7, border: '1px solid rgba(0,0,0,0.15)', background: '#FFFFFF', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: TEXT }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 7, border: 'none', backgroundColor: BLUE, color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                Submit restock
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RestockPage() {
  const { hiddenActions, disabledActions } = useTier();
  const searchRef = useRef<any>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0,
    row: { product: '' },
  });

  const [modal, setModal] = useState<RestockModalState>({
    open: false,
    row: { product: '' },
  });

  const onError = useCallback((err: any) => {
    console.error('[ThoughtSpot – Restock]', formatThoughtSpotEmbedError(err), err);
  }, []);

  // ── Parse a row click from ThoughtSpot viz point click event ───────────────
  const handleVizPointClick = useCallback((payload: any) => {
    try {
      const clickedPoint = payload?.data?.clickedPoint;
      const attrs: any[] = clickedPoint?.selectedAttributes ?? [];
      const measures: any[] = clickedPoint?.selectedMeasures ?? [];

      // Pull whatever column values we can from the click payload
      const rowData: RowData = { product: '' };

      for (const attr of attrs) {
        const col = (attr?.column?.name ?? '').toLowerCase();
        const val = attr?.value != null ? String(attr.value) : undefined;
        if (!val) continue;
        if (col.includes('category') || col.includes('product') || col.includes('brand')) {
          rowData.product = rowData.product || val;
          if (col.includes('category')) rowData.category = val;
        }
      }

      for (const m of measures) {
        const col = (m?.column?.name ?? '').toLowerCase();
        const val = m?.value != null ? String(m.value) : undefined;
        if (!val) continue;
        if (col.includes('quantity sold') || col.includes('units sold')) rowData.unitsSold = val;
        if (col.includes('quantity on hand') || col.includes('units on hand') || col.includes('stock')) rowData.unitsOnHand = val;
        if (col.includes('lead time'))   rowData.leadTime  = val;
        if (col.includes('shortfall'))   rowData.shortfall  = val;
        if (col.includes('sell') && col.includes('through')) rowData.sellThrough = val;
        if (col.includes('channel'))     rowData.channels   = val;
      }

      if (!rowData.product) rowData.product = 'Selected row';

      // Show context menu near the click — use a centre-screen approximation
      // (exact coordinates not available cross-iframe; use mouse position)
      const win = window as any;
      setContextMenu({ visible: true, x: win.lastMouseX ?? 400, y: win.lastMouseY ?? 300, row: rowData });
    } catch (e) {
      console.warn('[Restock] Could not parse click payload', e);
    }
  }, []);

  // Track mouse position globally so we can position the context menu
  React.useEffect(() => {
    const track = (e: MouseEvent) => {
      (window as any).lastMouseX = e.clientX;
      (window as any).lastMouseY = e.clientY;
    };
    window.addEventListener('mousemove', track);
    return () => window.removeEventListener('mousemove', track);
  }, []);

  const openModal = useCallback(() => {
    setModal({ open: true, row: contextMenu.row });
  }, [contextMenu.row]);

  const closeModal = useCallback(() => {
    setModal(m => ({ ...m, open: false }));
  }, []);

  return (
    <div style={{ backgroundColor: BG, height: `calc(100vh - ${TOP_HEADER_PX}px)`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Page header ── */}
      <div style={{ padding: '1.75rem 2.5rem 0' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: LABEL, marginBottom: 6 }}>
          Lumira
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          Restock
        </h1>
        <p style={{ fontSize: 13, color: TEXT2, margin: '0 0 1.25rem' }}>
          Product inventory and receipts — click any row to request a restock order.
        </p>

        {/* Hint banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', backgroundColor: 'rgba(43,60,193,0.06)', border: '1px solid rgba(43,60,193,0.14)', borderRadius: 8, marginBottom: '1.25rem', maxWidth: 560 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <span style={{ fontSize: 12, color: NAVY, fontWeight: 500 }}>
            Click any row and choose{' '}
            <strong style={{ color: BLUE }}>"Request Restock"</strong>{' '}
            to open a restock order pre-filled for that product.
          </span>
        </div>
      </div>

      {/* ── Embed table ── */}
      <div style={{ padding: '0 2.5rem 1rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid rgba(43,60,193,0.10)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(15,24,117,0.06)',
          flex: 1,
          minHeight: 0,
        }}>
          <LiveboardEmbed
            ref={searchRef}
            liveboardId={RESTOCK_LIVEBOARD_ID}
            hideTabPanel
            isLiveboardStylingAndGroupingEnabled
            hiddenActions={hiddenActions}
            disabledActions={disabledActions}
            customizations={RESTOCK_CUSTOMIZATIONS}
            onError={onError}
            onVizPointClick={handleVizPointClick as any}
            frameParams={{ height: '100%', width: '100%' }}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>
      </div>

      {/* ── Context menu ── */}
      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu(m => ({ ...m, visible: false }))}
        onRestock={openModal}
      />

      {/* ── Restock modal ── */}
      <RestockModal state={modal} onClose={closeModal} />
    </div>
  );
}
