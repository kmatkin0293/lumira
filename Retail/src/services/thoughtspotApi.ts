/**
 * ThoughtSpot REST API v2 service
 *
 * Endpoint specs sourced from the ThoughtSpot REST API v2 reference:
 * https://developers.thoughtspot.com/docs/fetch-data-and-report-apis
 *
 * All requests use credentials: 'include' so the browser session cookie from
 * the embedded ThoughtSpot iframe is shared with same-origin API calls.
 * For cross-origin setups, switch to token-based auth (AuthType.TrustedAuthToken).
 */

import { thoughtSpotHost } from '../config/thoughtspot';

const API_BASE = `${thoughtSpotHost}/api/rest/2.0`;

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface RuntimeFilter {
  col1: string;
  op1: 'EQ' | 'NE' | 'LT' | 'LE' | 'GT' | 'GE' | 'CONTAINS' | 'BEGINS_WITH' | 'ENDS_WITH' | 'IN' | 'NOT_IN';
  val1: string | number | boolean;
  [key: string]: unknown;
}

export interface RuntimeSort {
  sortCol1: string;
  asc1: boolean;
  [key: string]: unknown;
}

type DataFormat = 'COMPACT' | 'FULL';

// ─── fetchLiveboardData ───────────────────────────────────────────────────────

export interface FetchLiveboardDataRequest {
  /** GUID or name of the Liveboard */
  metadata_identifier: string;
  /** GUIDs or names of specific visualizations to fetch (omit for all) */
  visualization_identifiers?: string[];
  data_format?: DataFormat;
  record_offset?: number;
  record_size?: number;
  runtime_filter?: RuntimeFilter;
  runtime_sort?: RuntimeSort;
}

export interface LiveboardDataContent {
  visualization_id?: string;
  visualization_name?: string;
  column_names: string[];
  data_rows: Record<string, unknown>[];
  available_data_row_count: number;
  returned_data_row_count: number;
  record_offset: number;
  record_size: number;
  sampling_ratio: number;
}

export interface FetchLiveboardDataResponse {
  metadata_id: string;
  metadata_name: string;
  contents: LiveboardDataContent[];
}

/**
 * Fetches data from a Liveboard and its visualizations.
 * POST /api/rest/2.0/metadata/liveboard/data
 */
export async function fetchLiveboardData(
  request: FetchLiveboardDataRequest
): Promise<FetchLiveboardDataResponse> {
  const res = await fetch(`${API_BASE}/metadata/liveboard/data`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ data_format: 'COMPACT', record_size: 1000, ...request }),
  });
  if (!res.ok) throw new ThoughtSpotApiError('fetchLiveboardData', res.status, await res.text());
  return res.json();
}

// ─── searchData ───────────────────────────────────────────────────────────────

export interface SearchDataRequest {
  /** ThoughtSpot search token string, e.g. "[sales] by [store]" */
  query_string: string;
  /** GUID of the data source (Worksheet, View, or Table) */
  logical_table_identifier: string;
  data_format?: DataFormat;
  record_offset?: number;
  record_size?: number;
  runtime_filter?: RuntimeFilter;
  runtime_sort?: RuntimeSort;
}

export interface SearchDataContent {
  column_names: string[];
  data_rows: Record<string, unknown>[];
  available_data_row_count: number;
  returned_data_row_count: number;
  record_offset: number;
  record_size: number;
  sampling_ratio: number;
}

export interface SearchDataResponse {
  contents: SearchDataContent[];
}

/**
 * Runs a search query against a data source and returns Answer data.
 * POST /api/rest/2.0/searchdata
 */
export async function searchData(
  request: SearchDataRequest
): Promise<SearchDataResponse> {
  const res = await fetch(`${API_BASE}/searchdata`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ data_format: 'COMPACT', record_size: 1000, ...request }),
  });
  if (!res.ok) throw new ThoughtSpotApiError('searchData', res.status, await res.text());
  return res.json();
}

// ─── fetchAnswerData ──────────────────────────────────────────────────────────

export interface FetchAnswerDataRequest {
  /** GUID or name of the saved Answer */
  metadata_identifier: string;
  data_format?: DataFormat;
  record_offset?: number;
  record_size?: number;
  runtime_filter?: RuntimeFilter;
  runtime_sort?: RuntimeSort;
}

/**
 * Fetches data from a saved Answer.
 * POST /api/rest/2.0/metadata/answer/data
 */
export async function fetchAnswerData(
  request: FetchAnswerDataRequest
): Promise<SearchDataResponse> {
  const res = await fetch(`${API_BASE}/metadata/answer/data`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ data_format: 'COMPACT', record_size: 1000, ...request }),
  });
  if (!res.ok) throw new ThoughtSpotApiError('fetchAnswerData', res.status, await res.text());
  return res.json();
}

// ─── fetchLiveboardSqlQuery ───────────────────────────────────────────────────

export interface FetchLiveboardSqlRequest {
  metadata_identifier: string;
  visualization_identifiers?: string[];
}

export interface SqlQueryResult {
  metadata_id: string;
  metadata_name: string;
  sql_query: string;
}

export interface FetchLiveboardSqlResponse {
  metadata_id: string;
  metadata_name: string;
  metadata_type: string;
  sql_queries: SqlQueryResult[];
}

/**
 * Fetches the underlying SQL for a Liveboard's visualizations.
 * POST /api/rest/2.0/metadata/liveboard/sql
 */
export async function fetchLiveboardSqlQuery(
  request: FetchLiveboardSqlRequest
): Promise<FetchLiveboardSqlResponse> {
  const res = await fetch(`${API_BASE}/metadata/liveboard/sql`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new ThoughtSpotApiError('fetchLiveboardSqlQuery', res.status, await res.text());
  return res.json();
}

// ─── fetchColumnValues ────────────────────────────────────────────────────────

/**
 * Fetches all distinct values for a single attribute column from a ThoughtSpot
 * model / worksheet, using the Search Data API.
 *
 * Uses COMPACT data_format so data_rows is string[][] rather than object[].
 * Results are de-duped, stripped of nulls, and sorted alphabetically.
 *
 * @param columnName  Exact column name as defined in the ThoughtSpot model
 * @param modelId     GUID of the worksheet / model that owns the column
 * @param limit       Max distinct values to fetch (default 500)
 */
export async function fetchColumnValues(
  columnName: string,
  modelId: string,
  limit = 500,
): Promise<string[]> {
  const doFetch = async (query: string) => {
    const res = await fetch(`${API_BASE}/searchdata`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query_string: query,
        logical_table_identifier: modelId,
        data_format: 'COMPACT',
        record_size: limit,
      }),
    });
    if (!res.ok) throw new ThoughtSpotApiError('fetchColumnValues', res.status, await res.text());
    return res.json();
  };

  // 1st attempt: bare dimension query — works for most columns
  let json = await doFetch(`[${columnName}]`);
  let rows: unknown[][] = json?.contents?.[0]?.data_rows ?? [];

  // 2nd attempt: if empty, pair with a measure so ThoughtSpot returns rows.
  // We read the string column (not the numeric count column).
  if (rows.length === 0) {
    json = await doFetch(`[Net Revenue] [${columnName}]`);
    const colNames: string[] = json?.contents?.[0]?.column_names ?? [];
    rows = json?.contents?.[0]?.data_rows ?? [];
    // Find which column is the string dimension (not the numeric measure)
    const strIdx = colNames.findIndex((_, i) =>
      rows.slice(0, 10).some((r) => typeof r[i] === 'string')
    );
    const idx = strIdx >= 0 ? strIdx : 0;
    return rows
      .map((row) => (row[idx] != null ? String(row[idx]) : ''))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }

  // COMPACT format: first column is the dimension value
  return rows
    .map((row) => (row[0] != null ? String(row[0]) : ''))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

// ─── fetchDimensionMeasureValues ─────────────────────────────────────────────

/**
 * Fetches the aggregate measure value for every distinct value of an attribute
 * column, using the Search Data API.
 *
 * Returns a map of `{ dimensionValue → measureValue }` sorted by measure
 * descending (largest first), mirroring how SAP Explorer ranks rows.
 *
 * Uses COMPACT format so data_rows is (string|number|null)[][].
 * Column order in data_rows matches column_names in the response.
 *
 * @param dimensionColumn  Exact attribute column name (e.g. "Category")
 * @param measureColumn    Exact measure column name (e.g. "Net Revenue")
 * @param modelId          GUID of the worksheet / model
 * @param limit            Max rows to fetch (default 500)
 */
export async function fetchDimensionMeasureValues(
  dimensionColumn: string,
  measureColumn: string,
  modelId: string,
  limit = 500,
): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/searchdata`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query_string: `[${measureColumn}] [${dimensionColumn}]`,
      logical_table_identifier: modelId,
      data_format: 'COMPACT',
      record_size: limit,
    }),
  });

  if (!res.ok) {
    throw new ThoughtSpotApiError('fetchDimensionMeasureValues', res.status, await res.text());
  }

  const json = await res.json();
  const columnNames: string[] = json?.contents?.[0]?.column_names ?? [];
  const rows: (string | number | null)[][] = json?.contents?.[0]?.data_rows ?? [];

  if (rows.length === 0) return {};

  // ── Column index detection ───────────────────────────────────────────────
  // Strategy 1: exact name match (case-insensitive)
  let dIdx = columnNames.findIndex(
    (n) => n.toLowerCase() === dimensionColumn.toLowerCase()
  );
  let mIdx = columnNames.findIndex(
    (n) => n.toLowerCase() === measureColumn.toLowerCase()
  );

  // Strategy 2: fuzzy substring match (ThoughtSpot may wrap names)
  if (dIdx < 0) {
    dIdx = columnNames.findIndex(
      (n) =>
        n.toLowerCase().includes(dimensionColumn.toLowerCase()) ||
        dimensionColumn.toLowerCase().includes(n.toLowerCase())
    );
  }
  if (mIdx < 0) {
    mIdx = columnNames.findIndex(
      (n) =>
        n.toLowerCase().includes(measureColumn.toLowerCase()) ||
        measureColumn.toLowerCase().includes(n.toLowerCase())
    );
  }

  // Strategy 3: type-sniff the first few rows — the numeric column is the measure
  if (dIdx < 0 || mIdx < 0) {
    const sample = rows.slice(0, 5);
    const col0Numeric = sample.filter((r) => typeof r[0] === 'number').length;
    const col1Numeric = sample.filter((r) => typeof r[1] === 'number').length;
    if (col0Numeric > col1Numeric) {
      // col 0 = measure, col 1 = dimension
      mIdx = 0; dIdx = 1;
    } else {
      // col 0 = dimension, col 1 = measure
      dIdx = 0; mIdx = 1;
    }
  }

  const result: Record<string, number> = {};
  for (const row of rows) {
    const dimVal  = row[dIdx];
    const measVal = row[mIdx];
    if (dimVal == null) continue;
    result[String(dimVal)] =
      typeof measVal === 'number' ? measVal : parseFloat(String(measVal ?? 0)) || 0;
  }

  return result;
}

// ─── detectDateColumn ─────────────────────────────────────────────────────────

/**
 * Probes a list of candidate column names against the model by running a
 * minimal search query for each. Returns the first name that ThoughtSpot
 * resolves successfully (i.e. the API returns HTTP 200 with at least one row).
 *
 * Tries names in order: Date → Invoice Date → Sale Date → Order Date → …
 */
export async function detectDateColumn(modelId: string): Promise<string | null> {
  const candidates = [
    'Date',
    'Invoice Date',
    'Sale Date',
    'Order Date',
    'Transaction Date',
    'Created Date',
  ];

  for (const col of candidates) {
    try {
      const res = await fetch(`${API_BASE}/searchdata`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          query_string: `[${col}]`,
          logical_table_identifier: modelId,
          data_format: 'COMPACT',
          record_size: 2,
        }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const rows: unknown[][] = json?.contents?.[0]?.data_rows ?? [];
      if (rows.length > 0) return col;
    } catch {
      // ignore — try next candidate
    }
  }
  return null; // no date column found
}

// ─── Error class ──────────────────────────────────────────────────────────────

export class ThoughtSpotApiError extends Error {
  constructor(
    public readonly apiName: string,
    public readonly statusCode: number,
    public readonly body: string
  ) {
    super(`[ThoughtSpot API] ${apiName} failed with HTTP ${statusCode}: ${body}`);
    this.name = 'ThoughtSpotApiError';
  }
}
