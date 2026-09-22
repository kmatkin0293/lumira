import React, { useState } from 'react';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE   = '#2B3CC1';
const NAVY   = '#0F1875';
const YELLOW = '#FFD600';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParameterDef {
  id: string;
  label: string;
  parameterName: string;
  options: { label: string; value: string }[];
  defaultValue: string;
  expandable?: {
    valueMap?: Record<string, string[]>;
    descriptionMap?: Record<string, { description: string; formula?: string }>;
  };
}

/** Each parameter now holds an array of selected values (multi-select) */
export type ParameterSelection = Record<string, string[]>;

interface ParameterBarProps {
  parameters: ParameterDef[];
  selected: ParameterSelection;
  onSelectionChange: (parameterId: string, values: string[]) => void;
  onResetAll: () => void;
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Expanded panels ──────────────────────────────────────────────────────────

function DimensionValuePanel({ dimensionLabel, values }: { dimensionLabel: string; values: string[] }) {
  if (!values.length) return (
    <div style={{ padding: '10px 12px', fontSize: 12, color: 'rgba(0,0,0,0.40)', fontStyle: 'italic' }}>
      No values configured for this dimension.
    </div>
  );
  return (
    <div style={{ padding: '10px 12px 12px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: BLUE, marginBottom: 8 }}>{dimensionLabel} values</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {values.map((v) => (
          <span key={v} style={{ fontSize: 11, fontWeight: 500, color: NAVY,
            backgroundColor: 'rgba(0,159,227,0.08)', border: '1px solid rgba(0,159,227,0.18)',
            borderRadius: 5, padding: '3px 8px', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricDescriptionPanel({ metricLabel, description, formula }:
  { metricLabel: string; description: string; formula?: string }) {
  return (
    <div style={{ padding: '10px 12px 12px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: '#8B6914', marginBottom: 6 }}>{metricLabel}</div>
      <p style={{ fontSize: 12, color: '#444', lineHeight: 1.55, margin: '0 0 8px' }}>{description}</p>
      {formula && (
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: NAVY,
          backgroundColor: 'rgba(0,61,107,0.06)', border: '1px solid rgba(0,61,107,0.12)',
          borderRadius: 5, padding: '5px 8px', wordBreak: 'break-word' as const }}>
          {formula}
        </div>
      )}
    </div>
  );
}

// ─── Single parameter card ────────────────────────────────────────────────────

function ParameterCard({
  param,
  selected,   // now string[]
  onChange,   // now (values: string[]) => void
}: {
  param: ParameterDef;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDefault    = selected.length === 1 && selected[0] === param.defaultValue;
  const isModified   = !isDefault;
  const isExpandable = !!param.expandable;

  // Toggle a value in/out of the selection.
  // At least one value must remain selected.
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      if (selected.length === 1) return; // prevent empty selection
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Header badge text
  const badgeText = selected.length === 1
    ? (param.options.find((o) => o.value === selected[0])?.label ?? selected[0])
    : `${selected.length} selected`;

  return (
    <div style={{
      width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column',
      backgroundColor: '#FFFFFF', borderRadius: 10,
      border: `1.5px solid ${isModified ? YELLOW : expanded ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.09)'}`,
      boxShadow: isModified
        ? `0 0 0 3px rgba(255,209,0,0.18), 0 2px 8px rgba(0,0,0,0.06)`
        : expanded ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    }}>
      {/* ── Card header ── */}
      <div style={{
        padding: '9px 12px 8px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        background: isModified
          ? `linear-gradient(135deg, rgba(255,209,0,0.12) 0%, rgba(255,209,0,0.04) 100%)`
          : '#FAFAFA',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke={isModified ? '#B8860B' : 'rgba(0,0,0,0.35)'} strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="9"  cy="6"  r="2" fill={isModified ? YELLOW : '#FFF'} stroke={isModified ? '#B8860B' : 'rgba(0,0,0,0.35)'} strokeWidth="2" />
            <circle cx="15" cy="12" r="2" fill={isModified ? YELLOW : '#FFF'} stroke={isModified ? '#B8860B' : 'rgba(0,0,0,0.35)'} strokeWidth="2" />
            <circle cx="9"  cy="18" r="2" fill={isModified ? YELLOW : '#FFF'} stroke={isModified ? '#B8860B' : 'rgba(0,0,0,0.35)'} strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: isModified ? '#8B6914' : NAVY, letterSpacing: '-0.01em' }}>
            {param.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {/* Selected value(s) badge */}
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: isModified ? '#8B6914' : 'rgba(0,0,0,0.35)',
            backgroundColor: isModified ? YELLOW : 'rgba(0,0,0,0.06)',
            borderRadius: 5, padding: '2px 7px',
            maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {badgeText}
          </span>

          {/* Per-card reset */}
          {isModified && (
            <button type="button" onClick={() => onChange([param.defaultValue])}
              title={`Reset to default (${param.defaultValue})`}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                padding: '1px 3px', color: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          )}

          {/* Expand toggle */}
          {isExpandable && (
            <button type="button" onClick={() => setExpanded((e) => !e)}
              title={expanded ? 'Collapse' : 'Expand to see underlying data'}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                padding: '1px 3px', display: 'flex', alignItems: 'center',
                color: expanded ? BLUE : 'rgba(0,0,0,0.35)' }}>
              <Chevron open={expanded} />
            </button>
          )}
        </div>
      </div>

      {/* ── Multi-select checkbox option list ── */}
      <div style={{
        overflowY: 'auto', maxHeight: 172, padding: '3px 0',
        scrollbarWidth: 'thin', scrollbarColor: `rgba(255,209,0,0.4) transparent`,
      }}>
        {param.options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isOnlySelected = isSelected && selected.length === 1;
          return (
            <label key={option.value} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', cursor: isOnlySelected ? 'default' : 'pointer',
              backgroundColor: isSelected ? 'rgba(255,209,0,0.12)' : 'transparent',
              transition: 'background-color 0.10s ease', userSelect: 'none',
              opacity: isOnlySelected ? 0.85 : 1,
            }}
              onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? 'rgba(255,209,0,0.12)' : 'transparent'; }}
            >
              {/* Checkbox (square, yellow accent) */}
              <span style={{
                width: 15, height: 15, borderRadius: 3, flexShrink: 0,
                border: `1.5px solid ${isSelected ? '#B8860B' : 'rgba(0,0,0,0.22)'}`,
                backgroundColor: isSelected ? YELLOW : '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.10s ease',
              }}>
                {isSelected && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="#7A5C00" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input type="checkbox" checked={isSelected} onChange={() => toggle(option.value)}
                style={{ display: 'none' }} />
              <span style={{
                fontSize: 12.5, color: isSelected ? NAVY : '#2a2a2a',
                fontWeight: isSelected ? 700 : 400, letterSpacing: '-0.01em',
                lineHeight: 1.3, flex: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {option.label}
              </span>
              {isSelected && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </label>
          );
        })}
      </div>

      {/* ── Expandable data panel — shows all selected items ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          {selected.map((val) => {
            const label = param.options.find((o) => o.value === val)?.label ?? val;
            const values  = param.expandable?.valueMap?.[val] ?? [];
            const meta    = param.expandable?.descriptionMap?.[val];
            return (
              <div key={val} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {values.length > 0 && <DimensionValuePanel dimensionLabel={label} values={values} />}
                {meta && <MetricDescriptionPanel metricLabel={label} description={meta.description} formula={meta.formula} />}
                {!values.length && !meta && (
                  <div style={{ padding: '10px 12px', fontSize: 12, color: 'rgba(0,0,0,0.40)', fontStyle: 'italic' }}>
                    No additional data for {label}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Parameter bar ────────────────────────────────────────────────────────────

export default function ParameterBar({
  parameters,
  selected,
  onSelectionChange,
  onResetAll,
}: ParameterBarProps) {
  const hasNonDefault = parameters.some((p) => {
    const sel = selected[p.id] ?? [p.defaultValue];
    return !(sel.length === 1 && sel[0] === p.defaultValue);
  });

  return (
    <div style={{ padding: '0 1.5rem 1rem' }}>
      {/* ── Bar header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="9"  cy="6"  r="2.5" fill="white" stroke={NAVY} strokeWidth="2" />
            <circle cx="15" cy="12" r="2.5" fill="white" stroke={NAVY} strokeWidth="2" />
            <circle cx="9"  cy="18" r="2.5" fill="white" stroke={NAVY} strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>Parameters</span>
          {hasNonDefault ? (
            <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: YELLOW, color: '#7A5C00',
              borderRadius: 10, padding: '1px 7px', letterSpacing: '0.02em' }}>
              modified
            </span>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.01em' }}>
              · select one or more metrics and dimensions
            </span>
          )}
        </div>

        {hasNonDefault && (
          <button type="button" onClick={onResetAll}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
              color: 'rgba(0,0,0,0.40)', fontWeight: 500, padding: 0,
              letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset to defaults
          </button>
        )}
      </div>

      {/* ── Horizontally scrollable card row ── */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4,
        scrollbarWidth: 'thin', scrollbarColor: `rgba(255,209,0,0.35) transparent` }}>
        {parameters.map((p) => (
          <ParameterCard
            key={p.id}
            param={p}
            selected={selected[p.id] ?? [p.defaultValue]}
            onChange={(values) => onSelectionChange(p.id, values)}
          />
        ))}
      </div>
    </div>
  );
}
