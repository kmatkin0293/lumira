import React, { useCallback, CSSProperties, useMemo, useRef, useState } from 'react';
import { SearchEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { TOP_HEADER_PX, TOY_STORE_MODEL_ID } from '../config/thoughtspot';
import { useTier } from '../config/TierContext';
import { formatThoughtSpotEmbedError } from '../utils/thoughtspotErrors';
import FilterBar, { FilterDef, FilterSelection, FilterExcludeMap } from '../components/FilterBar';
import ParameterBar, { ParameterDef, ParameterSelection } from '../components/ParameterBar';
import { useFilterValues } from '../hooks/useFilterValues';
import { useDimensionMeasures } from '../hooks/useDimensionMeasures';
import { useDateColumn } from '../hooks/useDateColumn';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE  = '#2B3CC1';
const NAVY  = '#0F1875';
const LABEL = 'rgba(0,0,0,0.45)';

// ─── Filter configuration — columns from Toy Store Demo Model ─────────────────

const FILTERS_CONFIG: FilterDef[] = [
  {
    id: 'category',
    label: 'Category',
    columnName: 'Category',
    options: [],
  },
  {
    id: 'brand',
    label: 'Brand',
    columnName: 'Brand',
    options: [],
  },
  {
    id: 'age_range',
    label: 'Age Range',
    columnName: 'Age Range',
    options: [],
  },
  {
    id: 'region',
    label: 'Region',
    columnName: 'Region',
    options: [],
  },
  {
    id: 'store_name',
    label: 'Store Name',
    columnName: 'Store Name',
    options: [],
  },
  {
    id: 'city',
    label: 'City',
    columnName: 'City',
    options: [],
  },
  {
    id: 'store_format',
    label: 'Store Format',
    columnName: 'Store Format',
    options: [],
  },
];

// ─── Parameter configuration — exact values from TML ─────────────────────────

const PARAMETERS_CONFIG: ParameterDef[] = [
  {
    id: 'metric',
    label: 'Metric Picker',
    parameterName: 'Metric Picker',
    defaultValue: 'Net Revenue',
    options: [
      { label: 'Gross Revenue',      value: 'Gross Revenue' },
      { label: 'Net Revenue',        value: 'Net Revenue' },
      { label: 'Quantity Sold',      value: 'Quantity Sold' },
      { label: 'Discount Amount',    value: 'Discount Amount' },
      { label: 'Cost of Goods Sold', value: 'Cost of Goods Sold' },
    ],
    expandable: {
      descriptionMap: {
        'Gross Revenue':      { description: 'Total revenue before discounts. Unit price × quantity sold.', formula: 'sum(gross_revenue)' },
        'Net Revenue':        { description: 'Revenue after deducting discounts from gross revenue.', formula: 'sum(net_revenue)  =  sum(gross_revenue) − sum(discount_amount)' },
        'Quantity Sold':      { description: 'Number of units sold within the selected period.', formula: 'sum(quantity_sold)' },
        'Discount Amount':    { description: 'Total monetary discounts applied across all transactions.', formula: 'sum(discount_amount)' },
        'Cost of Goods Sold': { description: 'Total procurement cost for units sold. Used to assess profitability.', formula: 'sum(cost_of_goods)' },
      },
    },
  },
  {
    id: 'dimension',
    label: 'Dimension Picker',
    parameterName: 'Dimension Picker',
    defaultValue: 'Category',
    options: [
      { label: 'Product Name', value: 'Product Name' },
      { label: 'Category',     value: 'Category' },
      { label: 'Brand',        value: 'Brand' },
      { label: 'Store Format', value: 'Store Format' },
      { label: 'Region',       value: 'Region' },
      { label: 'Age Range',    value: 'Age Range' },
      { label: 'Store Name',   value: 'Store Name' },
      { label: 'City',         value: 'City' },
    ],
  },
];

// ─── Map parameter value → ThoughtSpot column name ───────────────────────────
// Parameter option values match TML list_choice values.
// Column names must match the model exactly (used in [brackets] in search query).

const METRIC_COLUMN_MAP: Record<string, string> = {
  'Gross Revenue':      'Gross Revenue',
  'Net Revenue':        'Net Revenue',
  'Quantity Sold':      'Quantity Sold',
  'Discount Amount':    'Discount Amount',
  'Cost of Goods Sold': 'Cost Of Goods',   // TML column: Cost Of Goods
};

const DIMENSION_COLUMN_MAP: Record<string, string> = {
  'Product Name': 'Product Name',
  'Category':     'Category',
  'Brand':        'Brand',
  'Store Format': 'Store Format',
  'Region':       'Region',
  'Age Range':    'Age Range',
  'Store Name':   'Store Name',
  'City':         'City',
};

// ─── Date column — detected at runtime via useDateColumn hook ────────────────
// This is the fallback; the hook probes the model and overrides it if found.
const DATE_COLUMN_FALLBACK = 'Date';

// ─── Drill-down dimension hierarchies ────────────────────────────────────────
const DRILL_HIERARCHIES: string[][] = [
  ['Category', 'Brand', 'Product Name'],
  ['Region', 'City', 'Store Name'],
  ['Store Format', 'Store Name'],
];

function getNextDrillDimension(current: string): string | null {
  for (const h of DRILL_HIERARCHIES) {
    const i = h.indexOf(current);
    if (i >= 0 && i < h.length - 1) return h[i + 1];
  }
  return null;
}

// ─── Top N options ────────────────────────────────────────────────────────────

const TOP_N_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'All',    value: null },
  { label: 'Top 5',  value: 5   },
  { label: 'Top 10', value: 10  },
  { label: 'Top 20', value: 20  },
  { label: 'Top 50', value: 50  },
];

// ─── Quick calculation options ────────────────────────────────────────────────

type CalcType = 'sum' | 'avg' | 'min' | 'max';

const CALC_OPTIONS: { label: string; value: CalcType; tsToken: string }[] = [
  { label: 'Sum', value: 'sum', tsToken: ''         },
  { label: 'Avg', value: 'avg', tsToken: 'average ' },
  { label: 'Min', value: 'min', tsToken: 'min '     },
  { label: 'Max', value: 'max', tsToken: 'max '     },
];

// ─── Time filter types ────────────────────────────────────────────────────────

type TimeFilterType = 'year' | 'ytd' | 'qtd' | 'mtd' | 'l12m' | 'custom';

interface TimeFilter {
  type: TimeFilterType;
  year?: number;   // for 'year'
  from?: string;   // for 'custom' (YYYY-MM-DD)
  to?: string;     // for 'custom'
}

/**
 * Converts a TimeFilter into a ThoughtSpot search token fragment.
 *
 * SearchEmbed processes searchTokenString — runtimeFilters are for Liveboards/SavedAnswers.
 * ThoughtSpot's search language has built-in period keywords and accepts MM/DD/YYYY for
 * explicit date ranges (no quotes, no ISO format).
 */
/**
 * Builds a ThoughtSpot search token for date filtering.
 *
 * Rules learned from testing:
 *  - [Col] = YYYY           → works (year bucket, well-documented)
 *  - [Col] = this year      → parses OK, valid syntax
 *  - [Col] = this quarter   → parses OK, valid syntax
 *  - [Col] = this month     → parses OK, valid syntax
 *  - [Col] = last 12 months → parses OK, valid syntax
 *  - [Col] after X before Y → ERROR 10028 (not a valid search token format)
 *  - [Col] between 'ISO'    → ERROR 10028 (not a valid search token format)
 *
 * For custom ranges we fall back to year-level granularity to avoid parse errors.
 */
function buildTimeToken(tf: TimeFilter | null, dateCol: string): string {
  if (!tf) return '';
  const col = dateCol;  // caller already checked this is non-empty

  // ThoughtSpot proven date bucket syntax (all tested without parse errors):
  //   = YYYY              year bucket
  //   = Q1/Q2/Q3/Q4 YYYY  quarter bucket
  //   = January YYYY      month bucket
  //   = last 12 months    rolling 12-month relative
  const now = new Date();
  const y   = now.getFullYear();
  const m   = now.getMonth(); // 0-indexed
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const months   = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];

  if (tf.type === 'year' && tf.year)  return ` [${col}] = ${tf.year}`;
  if (tf.type === 'ytd')             return ` [${col}] = this year`;
  if (tf.type === 'qtd')             return ` [${col}] = this quarter`;
  if (tf.type === 'mtd')             return ` [${col}] = this month`;
  if (tf.type === 'l12m')            return ` [${col}] = last 12 months`;
  if (tf.type === 'custom' && tf.from && tf.to)
    return ` [${col}] = ${tf.from.split('-')[0]}`;
  return '';
}

/** Display-friendly label shown in the query preview strip */
function describeTimeFilter(tf: TimeFilter | null): string {
  if (!tf) return '';
  const now = new Date();
  const y   = now.getFullYear();
  const m   = now.getMonth();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (tf.type === 'ytd')  return `${y} (embed) · exact YTD in Pivot`;
  if (tf.type === 'qtd')  return `${y} (embed) · last 90d in Pivot`;
  if (tf.type === 'mtd')  return `${y} (embed) · last 30d in Pivot`;
  if (tf.type === 'l12m') return `last 12 months`;
  if (tf.type === 'year' && tf.year) return `${tf.year}`;
  if (tf.type === 'custom' && tf.from && tf.to) return `${tf.from} → ${tf.to} (year ${tf.from.split('-')[0]})`;
  return '';
}


// ─── Build ThoughtSpot search query from current selections ───────────────────

function buildSearchQuery(
  paramSelection: ParameterSelection,
  filterSelection: FilterSelection,
  filterExclude: FilterExcludeMap,
  topN: number | null,
  calcType: CalcType,
  drillPath: DrillStep[],
  timeFilter: TimeFilter | null,
  dateCol: string,
): string {
  const selectedMetrics    = paramSelection['metric']    ?? ['Net Revenue'];
  const selectedDimensions = paramSelection['dimension'] ?? ['Category'];

  const metricCols    = selectedMetrics.map((m) => METRIC_COLUMN_MAP[m] ?? m);
  const dimensionCols = selectedDimensions.map((d) => DIMENSION_COLUMN_MAP[d] ?? d);

  const calcToken = CALC_OPTIONS.find((c) => c.value === calcType)?.tsToken ?? '';
  const topPrefix  = topN !== null ? `top ${topN} ` : '';
  const metricPart = metricCols.map((c) => `${calcToken}[${c}]`).join(' ');
  const dimPart    = dimensionCols.map((c) => `[${c}]`).join(' ');

  let query = `${topPrefix}${metricPart} ${dimPart}`;

  // Active filter tokens — respect include vs exclude mode
  for (const filter of FILTERS_CONFIG) {
    const values = filterSelection[filter.id] ?? [];
    if (values.length === 0) continue;
    const op     = filterExclude[filter.id] ? '!=' : '=';
    const valStr = values.map((v) => `'${v}'`).join(' ');
    query += ` [${filter.columnName}] ${op} ${valStr}`;
  }

  // Drill path — each step is a fixed equality filter
  for (const step of drillPath) {
    query += ` [${step.columnName}] = '${step.value}'`;
  }

  // Date filter — only emit once we have a confirmed column name (avoids [Date] fallback polluting query)
  if (dateCol) {
    query += buildTimeToken(timeFilter, dateCol);
  }

  return query;
}

// ─── Drill step type ─────────────────────────────────────────────────────────
interface DrillStep { dimension: string; columnName: string; value: string; }

// ─── Query preview ────────────────────────────────────────────────────────────

function QueryPreview({
  query, hasSelections, dateAnnotation,
}: { query: string; hasSelections: boolean; dateAnnotation?: string }) {
  return (
    <div style={{ padding: '0 2.5rem', marginBottom: '0.75rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
        backgroundColor: hasSelections ? 'rgba(15,24,117,0.04)' : '#FAFAFA',
        border: `1px solid ${hasSelections ? 'rgba(15,24,117,0.12)' : 'rgba(0,0,0,0.07)'}`,
        borderRadius: 8,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={hasSelections ? NAVY : 'rgba(0,0,0,0.30)'} strokeWidth="2.2" strokeLinecap="round"
          style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
          Search query
        </span>
        <code style={{
          fontSize: 12, fontFamily: 'monospace',
          color: hasSelections ? NAVY : 'rgba(0,0,0,0.40)',
          fontWeight: hasSelections ? 600 : 400,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {query}
          {dateAnnotation && (
            <span style={{ color: '#0070C0', fontWeight: 500, marginLeft: 6 }}>
              {dateAnnotation}
            </span>
          )}
        </code>
        <span style={{ fontSize: 10, color: BLUE, fontWeight: 600, flexShrink: 0, letterSpacing: '-0.01em' }}>
          auto-executing ↓
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const { hiddenActions, disabledActions } = useTier();

  const [parameterSelection, setParameterSelection] = useState<ParameterSelection>(
    Object.fromEntries(PARAMETERS_CONFIG.map((p) => [p.id, [p.defaultValue]]))
  );
  // Detect the actual date column from the live model
  const { dateColumn, dateColumnDetected, dateColumnLoading } = useDateColumn(TOY_STORE_MODEL_ID);

  const [filterSelection,   setFilterSelection]   = useState<FilterSelection>({});
  const [filterExclude,     setFilterExclude]     = useState<FilterExcludeMap>({});
  const [topN,              setTopN]              = useState<number | null>(null);
  const [calcType,          setCalcType]          = useState<CalcType>('sum');
  const [timeFilter,        setTimeFilter]        = useState<TimeFilter | null>(null);
  const [drillPath,         setDrillPath]         = useState<DrillStep[]>([]);
  const [customFrom,        setCustomFrom]        = useState('');
  const [customTo,          setCustomTo]          = useState('');
  const searchRef = useRef<any>(null);

  const onError = useCallback(
    (err: { data?: { errorMessage?: string }; message?: string }) => {
      console.error('[ThoughtSpot Search]', formatThoughtSpotEmbedError(err), err);
    },
    []
  );


  // ── Live filter values from ThoughtSpot REST API ────────────────────────────
  const { liveOptions, loading: filtersLoading } = useFilterValues(FILTERS_CONFIG);

  // ── Measure values per dimension — use first selected metric, re-fetch on change ──
  const firstMetric = (parameterSelection['metric'] ?? ['Net Revenue'])[0] ?? 'Net Revenue';
  const selectedMetricColumn = METRIC_COLUMN_MAP[firstMetric] ?? 'Net Revenue';
  const { measureData, loading: measuresLoading } = useDimensionMeasures(
    FILTERS_CONFIG,
    selectedMetricColumn,
  );

  const filtersWithLiveOptions: FilterDef[] = useMemo(
    () => FILTERS_CONFIG.map((f) => ({ ...f, options: liveOptions[f.id] ?? f.options })),
    [liveOptions]
  );

  // Also populate dimension picker expandable values from live filter data
  const parametersWithLiveValues: ParameterDef[] = useMemo(() => {
    return PARAMETERS_CONFIG.map((p) => {
      if (p.id !== 'dimension') return p;
      return {
        ...p,
        expandable: {
          valueMap: {
            'Product Name': [],  // Too many to enumerate without a dedicated API call
            'Category':     liveOptions['category']     ?? [],
            'Brand':        liveOptions['brand']         ?? [],
            'Store Format': liveOptions['store_format']  ?? [],
            'Region':       liveOptions['region']        ?? [],
            'Age Range':    liveOptions['age_range']     ?? [],
            'Store Name':   liveOptions['store_name']    ?? [],
            'City':         liveOptions['city']          ?? [],
          },
        },
      };
    });
  }, [liveOptions]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFilterChange = useCallback((filterId: string, values: string[]) => {
    setFilterSelection((prev) => ({ ...prev, [filterId]: values }));
  }, []);

  const handleClearAll = useCallback(() => setFilterSelection({}), []);

  const handleParameterChange = useCallback((parameterId: string, values: string[]) => {
    setParameterSelection((prev) => ({ ...prev, [parameterId]: values }));
  }, []);

  const handleParameterReset = useCallback(() => {
    setParameterSelection(
      Object.fromEntries(PARAMETERS_CONFIG.map((p) => [p.id, [p.defaultValue]]))
    );
  }, []);

  const handleExcludeModeChange = useCallback((filterId: string, exclude: boolean) => {
    setFilterExclude(prev => ({ ...prev, [filterId]: exclude }));
  }, []);

  // Drill into a single selected filter value — advance dimension to next level
  const handleDrillIn = useCallback(() => {
    const dims = parameterSelection['dimension'] ?? ['Category'];
    const currentDim = dims[0]; // drill on first dimension
    const currentCol = DIMENSION_COLUMN_MAP[currentDim] ?? currentDim;

    // Find a filter card that has exactly one selection for this dimension
    const filterDef = FILTERS_CONFIG.find(f =>
      f.columnName === currentCol || f.columnName.toLowerCase() === currentCol.toLowerCase()
    );
    if (!filterDef) return;
    const selected = filterSelection[filterDef.id] ?? [];
    if (selected.length !== 1) return;

    const nextDim = getNextDrillDimension(currentDim);
    const step: DrillStep = { dimension: currentDim, columnName: currentCol, value: selected[0] };

    setDrillPath(prev => [...prev, step]);
    // Clear the selection that just became a drill filter
    setFilterSelection(prev => ({ ...prev, [filterDef.id]: [] }));
    // Advance dimension picker
    if (nextDim) {
      setParameterSelection(prev => ({ ...prev, dimension: [nextDim] }));
    }
  }, [parameterSelection, filterSelection]);

  const handleDrillBack = useCallback((toIndex: number) => {
    // Restore dimension from the step at toIndex
    const step = drillPath[toIndex];
    setDrillPath(prev => prev.slice(0, toIndex));
    setParameterSelection(prev => ({ ...prev, dimension: [step.dimension] }));
  }, [drillPath]);

  const handleDrillReset = useCallback(() => {
    if (drillPath.length === 0) return;
    const firstDim = drillPath[0].dimension;
    setDrillPath([]);
    setParameterSelection(prev => ({ ...prev, dimension: [firstDim] }));
  }, [drillPath]);


  // Cross-filter: clicking a table row updates filter state
  const handleVizPointClick = useCallback((payload: any) => {
    try {
      const attrs: any[] = payload?.data?.clickedPoint?.selectedAttributes ?? [];
      const updates: FilterSelection = {};
      for (const attr of attrs) {
        const colName = (attr?.column?.name ?? '').toLowerCase();
        const val     = attr?.value != null ? String(attr.value) : null;
        if (!val) continue;
        const match = FILTERS_CONFIG.find(
          f => f.columnName.toLowerCase() === colName
        );
        if (match) updates[match.id] = [val];
      }
      if (Object.keys(updates).length > 0) {
        setFilterSelection(prev => ({ ...prev, ...updates }));
      }
    } catch (e) {
      console.warn('[CrossFilter] Could not parse click payload', e);
    }
  }, []);

  // ── Compose search query ─────────────────────────────────────────────────────

  // Pass empty dateCol while still detecting — prevents [Date] fallback from entering query
  const resolvedDateCol = dateColumnLoading ? '' : dateColumn;

  const searchQuery = useMemo(
    () => buildSearchQuery(
      parameterSelection, filterSelection, filterExclude,
      topN, calcType, drillPath, timeFilter, resolvedDateCol
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parameterSelection, filterSelection, filterExclude, topN, calcType, drillPath, timeFilter, resolvedDateCol]
  );

  const hasSelections = useMemo(
    () =>
      Object.values(filterSelection).some((v) => v.length > 0) ||
      Object.values(filterExclude).some(Boolean) ||
      PARAMETERS_CONFIG.some((p) => {
        const sel = parameterSelection[p.id] ?? [p.defaultValue];
        return !(sel.length === 1 && sel[0] === p.defaultValue);
      }) ||
      topN !== null ||
      calcType !== 'sum' ||
      timeFilter !== null ||
      drillPath.length > 0,
    [parameterSelection, filterSelection, filterExclude, topN, calcType, timeFilter, drillPath]
  );

  // embedKey forces SearchEmbed remount on ANY query or calc change.
  // calcType is included explicitly so Sum↔Avg↔Min↔Max always triggers a remount
  // even when the token difference might hash the same (e.g. pct vs sum both use '').
  const embedKey = `search::${searchQuery}::${calcType}`;

  const CARD: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    boxShadow: '0 2px 12px rgba(15,24,117,0.07), 0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  };

  const PAD = '0 2rem';

  return (
    <div style={{ backgroundColor: '#EAECFF', minHeight: `calc(100vh - ${TOP_HEADER_PX}px)` }}>

      {/* ── Hero header ── */}
      <div style={{
        background: `linear-gradient(120deg, ${NAVY} 0%, #1A2DB0 60%, ${BLUE} 100%)`,
        padding: '1.5rem 2.5rem 1.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 240, height: 240, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 80, bottom: -80,
          width: 160, height: 160, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
          Lumira Analytics
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
          Data Search
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', margin: 0, maxWidth: 520 }}>
          Pick metrics and dimensions, refine with filters, then explore your commerce data — results update automatically.
        </p>
      </div>

      {/* ── Controls area ── */}
      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Parameters card ── */}
        <div style={CARD}>
          <div style={{ padding: '1rem 1.5rem 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(0,61,107,0.45)', marginBottom: 10 }}>
              Parameters
            </div>
          </div>
          <ParameterBar
            parameters={parametersWithLiveValues}
            selected={parameterSelection}
            onSelectionChange={handleParameterChange}
            onResetAll={handleParameterReset}
          />
        </div>

        {/* ── Top N + Calc card ── */}
        <div style={{ ...CARD, padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

          {/* Top N */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Top N
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {TOP_N_OPTIONS.map(({ label, value }) => {
                const isActive = topN === value;
                return (
                  <button key={label} type="button" onClick={() => setTopN(value)}
                    style={{
                      padding: '5px 14px', borderRadius: 20,
                      border: `1.5px solid ${isActive ? BLUE : 'rgba(0,61,107,0.15)'}`,
                      backgroundColor: isActive ? BLUE : 'rgba(0,61,107,0.04)',
                      color: isActive ? '#FFFFFF' : NAVY,
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '-0.01em',
                      boxShadow: isActive ? '0 2px 8px rgba(0,159,227,0.35)' : 'none',
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', fontWeight: 400 }}>
              by {(parameterSelection['metric'] ?? ['Net Revenue']).join(' & ')}
            </span>
          </div>

          <div style={{ width: 1, height: 22, backgroundColor: 'rgba(0,61,107,0.12)', flexShrink: 0 }} />

          {/* Calc */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Calc
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {CALC_OPTIONS.map(({ label, value }) => {
                const isActive = calcType === value;
                return (
                  <button
                    key={value} type="button"
                    onClick={() => setCalcType(value)}
                    style={{
                      padding: '5px 14px', borderRadius: 20,
                      border: `1.5px solid ${isActive ? NAVY : 'rgba(0,61,107,0.15)'}`,
                      backgroundColor: isActive ? NAVY : 'rgba(0,61,107,0.04)',
                      color: isActive ? '#FFFFFF' : NAVY,
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '-0.01em',
                      boxShadow: isActive ? '0 2px 8px rgba(0,61,107,0.28)' : 'none',
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Time Intelligence card ── */}
        {(() => {
          const now = new Date();
          const year = now.getFullYear();
          const years = [year - 2, year - 1, year];
          const periodBtns: { label: string; type: TimeFilterType }[] = [
            { label: 'YTD', type: 'ytd' },
            { label: 'QTD', type: 'qtd' },
            { label: 'MTD', type: 'mtd' },
            { label: 'Last 12M', type: 'l12m' },
          ];
          const isYearActive  = (y: number) => timeFilter?.type === 'year' && timeFilter.year === y;
          const isPeriodActive = (t: TimeFilterType) => timeFilter?.type === t;
          const isCustomActive = timeFilter?.type === 'custom';
          const isAllActive    = timeFilter === null;

          return (
            <div style={{ ...CARD, padding: '0.85rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Period
                  </span>
                  <span style={{ fontSize: 9, color: dateColumnDetected ? 'rgba(0,130,0,0.7)' : LABEL, fontWeight: 500, letterSpacing: '0.02em', paddingLeft: 17 }}>
                    {dateColumnLoading
                      ? 'detecting date column…'
                      : `[${dateColumn}]${dateColumnDetected ? ' ✓' : ' (fallback)'}`}
                  </span>
                </div>

                {/* All */}
                <button type="button" onClick={() => setTimeFilter(null)}
                  style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${isAllActive ? BLUE : 'rgba(0,61,107,0.15)'}`, backgroundColor: isAllActive ? BLUE : 'rgba(0,61,107,0.04)', color: isAllActive ? '#FFF' : NAVY, fontSize: 12, fontWeight: isAllActive ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '-0.01em', boxShadow: isAllActive ? '0 2px 8px rgba(0,159,227,0.35)' : 'none' }}>
                  All
                </button>

                {/* Year buttons */}
                {years.map(y => (
                  <button key={y} type="button" onClick={() => setTimeFilter({ type: 'year', year: y })}
                    style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${isYearActive(y) ? BLUE : 'rgba(0,61,107,0.15)'}`, backgroundColor: isYearActive(y) ? BLUE : 'rgba(0,61,107,0.04)', color: isYearActive(y) ? '#FFF' : NAVY, fontSize: 12, fontWeight: isYearActive(y) ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: isYearActive(y) ? '0 2px 8px rgba(0,159,227,0.35)' : 'none' }}>
                    {y}
                  </button>
                ))}

                <div style={{ width: 1, height: 20, backgroundColor: 'rgba(0,61,107,0.12)' }} />

                {/* YTD/QTD/MTD/L12M */}
                {periodBtns.map(({ label, type }) => (
                  <button key={type} type="button" onClick={() => setTimeFilter({ type })}
                    style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${isPeriodActive(type) ? '#005a9e' : 'rgba(0,61,107,0.15)'}`, backgroundColor: isPeriodActive(type) ? '#005a9e' : 'rgba(0,61,107,0.04)', color: isPeriodActive(type) ? '#FFF' : NAVY, fontSize: 12, fontWeight: isPeriodActive(type) ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: isPeriodActive(type) ? '0 2px 8px rgba(0,90,158,0.28)' : 'none' }}>
                    {label}
                  </button>
                ))}

                <div style={{ width: 1, height: 20, backgroundColor: 'rgba(0,61,107,0.12)' }} />

                {/* Custom date range */}
                <button type="button" onClick={() => setTimeFilter({ type: 'custom', from: customFrom || undefined, to: customTo || undefined })}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${isCustomActive ? '#005a9e' : 'rgba(0,61,107,0.15)'}`, backgroundColor: isCustomActive ? '#005a9e' : 'rgba(0,61,107,0.04)', color: isCustomActive ? '#FFF' : NAVY, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  Custom
                </button>
                <input type="date" value={customFrom} onChange={e => { setCustomFrom(e.target.value); if (customTo) setTimeFilter({ type: 'custom', from: e.target.value, to: customTo }); }}
                  style={{ fontSize: 11, padding: '4px 8px', border: '1.5px solid rgba(0,61,107,0.18)', borderRadius: 8, outline: 'none', color: NAVY, fontFamily: 'inherit', cursor: 'pointer' }} />
                <span style={{ fontSize: 11, color: LABEL }}>→</span>
                <input type="date" value={customTo} onChange={e => { setCustomTo(e.target.value); if (customFrom) setTimeFilter({ type: 'custom', from: customFrom, to: e.target.value }); }}
                  style={{ fontSize: 11, padding: '4px 8px', border: '1.5px solid rgba(0,61,107,0.18)', borderRadius: 8, outline: 'none', color: NAVY, fontFamily: 'inherit', cursor: 'pointer' }} />
              </div>
            </div>
          );
        })()}

        {/* ── Filters card ── */}
        <div style={CARD}>
          <FilterBar
            filters={filtersWithLiveOptions}
            selected={filterSelection}
            onSelectionChange={handleFilterChange}
            onClearAll={handleClearAll}
            loading={filtersLoading}
            measureData={measureData}
            measureLabel={firstMetric}
            measuresLoading={measuresLoading}
            filterExclude={filterExclude}
            onExcludeModeChange={handleExcludeModeChange}
          />
        </div>

        {/* ── Drill-down controls ── */}
        {(() => {
          const dims       = parameterSelection['dimension'] ?? ['Category'];
          const currentDim = dims[0];
          const currentCol = DIMENSION_COLUMN_MAP[currentDim] ?? currentDim;
          const filterDef  = FILTERS_CONFIG.find(f => f.columnName.toLowerCase() === currentCol.toLowerCase());
          const selection  = filterDef ? (filterSelection[filterDef.id] ?? []) : [];
          const nextDim    = getNextDrillDimension(currentDim);
          const canDrill   = selection.length === 1 && nextDim !== null;

          return (
            <>
              {/* Drill path breadcrumb */}
              {drillPath.length > 0 && (
                <div style={{ ...CARD, padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderLeft: `3px solid ${BLUE}` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>Drill path:</span>
                  {drillPath.map((step, i) => (
                    <React.Fragment key={i}>
                      <button type="button" onClick={() => handleDrillBack(i)}
                        title="Click to go back to this level"
                        style={{ background: 'none', border: '1px solid rgba(0,159,227,0.30)', borderRadius: 6, cursor: 'pointer', padding: '3px 9px', fontSize: 11, color: BLUE, fontWeight: 600, transition: 'all 0.12s ease' }}>
                        <span style={{ color: 'rgba(0,61,107,0.45)', fontWeight: 400 }}>{step.dimension}: </span>
                        {step.value}
                      </button>
                      {i < drillPath.length - 1 && <span style={{ color: 'rgba(0,61,107,0.30)', fontSize: 13 }}>›</span>}
                    </React.Fragment>
                  ))}
                  <span style={{ color: 'rgba(0,61,107,0.30)', fontSize: 13 }}>›</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, backgroundColor: 'rgba(0,159,227,0.12)', padding: '3px 9px', borderRadius: 6 }}>{currentDim}</span>
                  <button type="button" onClick={handleDrillReset}
                    style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 6, cursor: 'pointer', padding: '3px 10px', fontSize: 11, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>
                    ↩ Reset drill
                  </button>
                </div>
              )}

              {/* Drill-in button */}
              {canDrill && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button type="button" onClick={handleDrillIn}
                    style={{
                      padding: '7px 18px', borderRadius: 20,
                      border: `1.5px solid ${BLUE}`,
                      backgroundColor: 'rgba(0,159,227,0.08)',
                      color: BLUE, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    Drill into "{selection[0]}" → {nextDim}
                  </button>
                  <span style={{ fontSize: 11, color: LABEL }}>
                    Narrows to {nextDim} breakdown within {currentDim} = {selection[0]}
                  </span>
                </div>
              )}
            </>
          );
        })()}

        {/* ── Query preview ── */}
        <QueryPreview
          query={searchQuery}
          hasSelections={hasSelections}
          dateAnnotation={timeFilter ? `(${describeTimeFilter(timeFilter)})` : undefined}
        />

        {/* ── Embed card ── */}
        <div style={{ ...CARD, marginBottom: '0.5rem', overflow: 'hidden' }}>
          <div style={{ height: '62vh', minHeight: 460 }}>
            <SearchEmbed
              key={embedKey}
              ref={searchRef}
              dataSource={TOY_STORE_MODEL_ID}
              hideDataSources
              forceTable
              searchOptions={{
                searchTokenString: searchQuery,
                executeSearch: true,
              }}
              hiddenActions={hiddenActions}
              disabledActions={disabledActions}
              onError={onError}
              onVizPointClick={handleVizPointClick as any}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
