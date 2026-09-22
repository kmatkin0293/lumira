import React, { useRef, useState } from 'react';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE   = '#2B3CC1';
const NAVY   = '#0F1875';
const RED    = '#E03E3E'; // exclude-mode accent

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FilterDef {
  id: string;
  label: string;
  columnName: string;
  options: string[];
}

export type FilterSelection  = Record<string, string[]>;
export type FilterExcludeMap = Record<string, boolean>;

interface FilterBarProps {
  filters: FilterDef[];
  selected: FilterSelection;
  onSelectionChange: (filterId: string, values: string[]) => void;
  onClearAll: () => void;
  loading?: boolean;
  measureData?: Record<string, Record<string, number>>;
  measureLabel?: string;
  measuresLoading?: boolean;
  /** Which filters are in exclude (NOT IN) mode */
  filterExclude?: FilterExcludeMap;
  onExcludeModeChange?: (filterId: string, exclude: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMeasure(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `${Math.round(n / 1_000)}K`;
  return Math.round(n).toLocaleString();
}

// ─── Shared checkbox ──────────────────────────────────────────────────────────

function Checkbox({ checked, accent = BLUE }: { checked: boolean; accent?: string }) {
  return (
    <span style={{
      width: 15, height: 15, borderRadius: 3, flexShrink: 0,
      border: `1.5px solid ${checked ? accent : 'rgba(0,0,0,0.22)'}`,
      backgroundColor: checked ? accent : '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.10s ease',
    }}>
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function Spinner() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE}
      strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ts-spin 0.8s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── Single filter card ───────────────────────────────────────────────────────

function FilterCard({
  filter, selected, onChange,
  measureValues, measureLabel, measuresLoading,
  excludeMode, onExcludeModeChange,
}: {
  filter: FilterDef; selected: string[];
  onChange: (values: string[]) => void;
  measureValues?: Record<string, number>;
  measureLabel?: string; measuresLoading?: boolean;
  excludeMode: boolean;
  onExcludeModeChange: (exclude: boolean) => void;
}) {
  const hasSelection  = selected.length > 0;
  const hasMeasures   = !!measureValues && Object.keys(measureValues).length > 0;
  const [showMeasure, setShowMeasure] = useState(false);
  const [searchTerm,  setSearchTerm]  = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const accent     = excludeMode ? RED : BLUE;
  const canExpand  = hasMeasures || measuresLoading;

  const toggle = (option: string) => {
    if (selected.includes(option)) onChange(selected.filter(v => v !== option));
    else onChange([...selected, option]);
  };

  // Sort + search filter
  const baseSorted = showMeasure && hasMeasures
    ? [...filter.options].sort((a, b) => (measureValues![b] ?? 0) - (measureValues![a] ?? 0))
    : filter.options;

  const visibleOptions = searchTerm
    ? baseSorted.filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()))
    : baseSorted;

  const maxMeasure  = hasMeasures ? Math.max(...Object.values(measureValues!), 1) : 1;
  const cardWidth   = showMeasure ? 290 : 196;

  return (
    <div style={{
      width: cardWidth, flexShrink: 0, display: 'flex', flexDirection: 'column',
      backgroundColor: '#FFFFFF', borderRadius: 10,
      border: `1.5px solid ${hasSelection ? accent : 'rgba(0,0,0,0.09)'}`,
      boxShadow: hasSelection
        ? `0 0 0 3px ${excludeMode ? 'rgba(224,62,62,0.12)' : 'rgba(0,159,227,0.12)'}, 0 2px 8px rgba(0,0,0,0.06)`
        : '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      transition: 'width 0.2s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    }}>

      {/* ── Card header ── */}
      <div style={{
        padding: '9px 10px 8px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        background: hasSelection
          ? excludeMode
            ? 'linear-gradient(135deg,rgba(224,62,62,0.08) 0%,rgba(224,62,62,0.02) 100%)'
            : 'linear-gradient(135deg,rgba(0,159,227,0.08) 0%,rgba(0,159,227,0.03) 100%)'
          : '#FAFAFA',
      }}>
        {/* ── Left: label ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke={excludeMode && hasSelection ? RED : hasSelection ? BLUE : 'rgba(0,0,0,0.32)'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
            color: excludeMode && hasSelection ? RED : hasSelection ? BLUE : NAVY,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {filter.label}
          </span>
          {/* Measure label pill (only when expanded) */}
          {showMeasure && measureLabel && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              color: BLUE, backgroundColor: 'rgba(0,159,227,0.10)',
              border: '1px solid rgba(0,159,227,0.22)', borderRadius: 4,
              padding: '1px 5px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{measureLabel}</span>
          )}
        </div>

        {/* ── Right: icon-only action buttons ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>

          {/* Exclude toggle — ≠ icon, red when active */}
          <button type="button"
            title={excludeMode
              ? `Excluding selected values — click to switch to Include mode`
              : `Including selected values — click to switch to Exclude (NOT IN) mode`}
            onClick={() => onExcludeModeChange(!excludeMode)}
            style={{
              width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
              border: `1.5px solid ${excludeMode ? RED : 'rgba(0,0,0,0.14)'}`,
              backgroundColor: excludeMode ? 'rgba(224,62,62,0.10)' : 'transparent',
              color: excludeMode ? RED : 'rgba(0,0,0,0.35)',
              fontSize: 13, fontWeight: 700, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease', padding: 0,
            }}>
            ≠
          </button>

          {/* Clear — only visible when something is selected */}
          {hasSelection && (
            <button type="button"
              title="Clear selection"
              onClick={() => onChange([])}
              style={{
                width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                border: '1.5px solid rgba(0,0,0,0.14)', backgroundColor: 'transparent',
                color: 'rgba(0,0,0,0.38)', fontSize: 15, fontWeight: 400, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.12s ease', padding: 0,
              }}>
              ×
            </button>
          )}

          {/* Measure expand — bar chart icon */}
          {canExpand && (
            <button type="button"
              title={showMeasure ? `Hide ${measureLabel ?? 'measure'} values` : `Show ${measureLabel ?? 'measure'} values per option`}
              onClick={() => setShowMeasure(v => !v)}
              style={{
                width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                border: `1.5px solid ${showMeasure ? BLUE : 'rgba(0,0,0,0.14)'}`,
                backgroundColor: showMeasure ? BLUE : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease', padding: 0,
              }}>
              {measuresLoading && !hasMeasures
                ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke={showMeasure ? '#fff' : BLUE} strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: 'ts-spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="9" width="3" height="6" rx="1" fill={showMeasure ? '#fff' : 'rgba(0,61,107,0.50)'} />
                    <rect x="6" y="5" width="3" height="10" rx="1" fill={showMeasure ? '#fff' : 'rgba(0,61,107,0.50)'} />
                    <rect x="11" y="1" width="3" height="14" rx="1" fill={showMeasure ? '#fff' : 'rgba(0,61,107,0.50)'} />
                  </svg>
                )}
            </button>
          )}
        </div>
      </div>

      {/* ── Search input ── */}
      {filter.options.length > 5 && (
        <div style={{ padding: '6px 10px 4px', borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#FAFAFA' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            backgroundColor: '#FFF', border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 6, padding: '4px 8px',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                border: 'none', outline: 'none', fontSize: 11, flex: 1,
                color: NAVY, backgroundColor: 'transparent',
                fontFamily: 'inherit',
              }}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: 'rgba(0,0,0,0.35)', fontSize: 12, lineHeight: 1 }}>×</button>
            )}
          </div>
        </div>
      )}

      {/* ── Scrollable checkbox list ── */}
      <div ref={listRef} style={{
        overflowY: 'auto', maxHeight: 172, padding: '3px 0',
        scrollbarWidth: 'thin', scrollbarColor: `rgba(0,159,227,0.3) transparent`,
      }}>
        {filter.options.length === 0 && (
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[70, 55, 80, 60, 75].map((w, i) => (
              <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 4,
                background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
                backgroundSize: '200% 100%', animation: 'ts-shimmer 1.4s ease infinite' }} />
            ))}
          </div>
        )}

        {/* "All" synthetic row — hidden when searching */}
        {filter.options.length > 0 && !searchTerm && (
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: showMeasure ? '5px 10px 5px 12px' : '5px 12px',
            cursor: 'pointer', userSelect: 'none',
            backgroundColor: !hasSelection ? 'rgba(0,159,227,0.07)' : 'transparent',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}
            onMouseEnter={e => { if (hasSelection) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = !hasSelection ? 'rgba(0,159,227,0.07)' : 'transparent'; }}
          >
            {showMeasure && <span style={{ width: 12, flexShrink: 0 }} />}
            <Checkbox checked={!hasSelection} />
            <input type="checkbox" checked={!hasSelection} onChange={() => onChange([])} style={{ display: 'none' }} />
            <span style={{ fontSize: 12.5, color: !hasSelection ? BLUE : '#2a2a2a',
              fontWeight: !hasSelection ? 700 : 500, fontStyle: 'italic',
              letterSpacing: '-0.01em', flex: 1 }}>
              All
            </span>
          </label>
        )}

        {/* No results message */}
        {searchTerm && visibleOptions.length === 0 && (
          <div style={{ padding: '10px 12px', fontSize: 11, color: 'rgba(0,0,0,0.40)', fontStyle: 'italic', textAlign: 'center' }}>
            No matches for "{searchTerm}"
          </div>
        )}

        {/* Options */}
        {visibleOptions.map((option, idx) => {
          const isSelected = selected.includes(option);
          const rawMeasure = hasMeasures ? (measureValues![option] ?? 0) : null;
          const barPct     = (rawMeasure !== null && maxMeasure > 0) ? (rawMeasure / maxMeasure) * 100 : 0;

          return (
            <label key={option} style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
              padding: showMeasure ? '5px 10px 5px 12px' : '5px 12px',
              cursor: 'pointer', userSelect: 'none',
              backgroundColor: isSelected
                ? excludeMode ? 'rgba(224,62,62,0.07)' : 'rgba(0,159,227,0.07)'
                : 'transparent',
              transition: 'background-color 0.10s ease',
            }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
                  ? excludeMode ? 'rgba(224,62,62,0.07)' : 'rgba(0,159,227,0.07)'
                  : 'transparent';
              }}
            >
              {/* Proportional measure bar */}
              {showMeasure && barPct > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barPct}%`,
                  backgroundColor: isSelected ? 'rgba(0,159,227,0.13)' : 'rgba(0,61,107,0.05)',
                  borderRight: `2px solid ${isSelected ? 'rgba(0,159,227,0.30)' : 'rgba(0,61,107,0.10)'}`,
                  transition: 'width 0.35s ease', pointerEvents: 'none',
                }} />
              )}

              {/* Rank number */}
              {showMeasure && (
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.22)',
                  width: 12, textAlign: 'right', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  {idx + 1}
                </span>
              )}

              <Checkbox checked={isSelected} accent={accent} />
              <input type="checkbox" checked={isSelected} onChange={() => toggle(option)} style={{ display: 'none' }} />

              <span style={{
                fontSize: 12.5, color: isSelected ? accent : '#2a2a2a',
                fontWeight: isSelected ? 600 : 400, letterSpacing: '-0.01em',
                flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                position: 'relative', zIndex: 1,
              }}>{option}</span>

              {showMeasure && rawMeasure !== null && (
                <span style={{ fontSize: 11, fontWeight: 600, flexShrink: 0,
                  color: isSelected ? BLUE : 'rgba(0,61,107,0.60)',
                  letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
                  {fmtMeasure(rawMeasure)}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* ── Selection footer ── */}
      {hasSelection && (
        <div style={{
          padding: '5px 12px',
          borderTop: `1px solid ${excludeMode ? 'rgba(224,62,62,0.15)' : 'rgba(0,159,227,0.10)'}`,
          backgroundColor: excludeMode ? 'rgba(224,62,62,0.04)' : 'rgba(0,159,227,0.04)',
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {excludeMode
            ? (
              /* Red ≠ icon for exclude */
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke={RED} strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <line x1="5" y1="7"  x2="19" y2="7" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill={BLUE}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            )
          }
          <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
            {excludeMode ? 'Excluding' : 'Selected'}: {selected.length} of {filter.options.length}
          </span>
        </div>
      )}

      <style>{`
        @keyframes ts-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ts-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

export default function FilterBar({
  filters, selected, onSelectionChange, onClearAll,
  loading = false, measureData, measureLabel, measuresLoading = false,
  filterExclude = {}, onExcludeModeChange,
}: FilterBarProps) {
  const totalSelected = Object.values(selected).reduce((sum, v) => sum + v.length, 0);
  const anyExclude    = Object.values(filterExclude).some(Boolean);

  return (
    <div style={{ padding: '1rem 1.5rem 1.25rem' }}>
      {/* ── Bar header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>
            Filters
          </span>
          {totalSelected > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700,
              backgroundColor: anyExclude ? RED : BLUE, color: '#FFF',
              borderRadius: 10, padding: '1px 7px', letterSpacing: '0.02em' }}>
              {totalSelected} active{anyExclude ? ' · some excluded' : ''}
            </span>
          )}
          {loading && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(0,0,0,0.35)', fontWeight: 500 }}><Spinner /> Loading values…</span>}
          {measuresLoading && !loading && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(0,0,0,0.35)', fontWeight: 500 }}><Spinner /> Loading {measureLabel ?? 'measures'}…</span>}
        </div>
        {totalSelected > 0 && (
          <button type="button" onClick={onClearAll}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'rgba(0,0,0,0.40)', fontWeight: 500, padding: 0 }}>
            Clear all
          </button>
        )}
      </div>

      {/* ── Card row ── */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6,
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,159,227,0.25) transparent' }}>
        {filters.map(f => (
          <FilterCard
            key={f.id}
            filter={f}
            selected={selected[f.id] ?? []}
            onChange={values => onSelectionChange(f.id, values)}
            measureValues={measureData?.[f.id]}
            measureLabel={measureLabel}
            measuresLoading={measuresLoading}
            excludeMode={filterExclude[f.id] ?? false}
            onExcludeModeChange={exclude => onExcludeModeChange?.(f.id, exclude)}
          />
        ))}
      </div>
    </div>
  );
}
