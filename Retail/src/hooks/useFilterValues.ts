/**
 * useFilterValues
 *
 * Fetches distinct data values for each filter column from ThoughtSpot's
 * Search Data API in parallel, replacing the hardcoded option lists in
 * FilterBar with live values from the Toy Store Demo Model.
 *
 * Falls back to the static options supplied in the FilterDef if the fetch
 * fails for any individual column, so the UI always stays functional.
 */

import { useEffect, useRef, useState } from 'react';
import { FilterDef } from '../components/FilterBar';
import { fetchColumnValues } from '../services/thoughtspotApi';
import { TOY_STORE_MODEL_ID } from '../config/thoughtspot';

export type LiveFilterValues = Record<string, string[]>;

export interface UseFilterValuesResult {
  /** Map of filter id → live option values (or static fallback if still loading / errored) */
  liveOptions: LiveFilterValues;
  /** True while any column fetch is still in-flight */
  loading: boolean;
  /** Map of filter id → error message for any columns that failed */
  errors: Record<string, string>;
}

export function useFilterValues(filters: FilterDef[]): UseFilterValuesResult {
  const [liveOptions, setLiveOptions] = useState<LiveFilterValues>(
    // Seed with the static fallback values so the UI is immediately usable
    Object.fromEntries(filters.map((f) => [f.id, f.options]))
  );
  const [loading, setLoading]   = useState(true);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const mountedRef               = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setErrors({});

    // Fetch each column independently so a single failure doesn't block others
    const fetches = filters.map(async (f) => {
      try {
        const values = await fetchColumnValues(f.columnName, TOY_STORE_MODEL_ID);
        return { id: f.id, values, error: null };
      } catch (err) {
        console.warn(`[useFilterValues] Failed to fetch values for "${f.columnName}":`, err);
        return { id: f.id, values: f.options, error: String(err) };
      }
    });

    Promise.all(fetches).then((results) => {
      if (!mountedRef.current) return;

      const nextOptions: LiveFilterValues = {};
      const nextErrors: Record<string, string> = {};

      for (const { id, values, error } of results) {
        nextOptions[id] = values;
        if (error) nextErrors[id] = error;
      }

      setLiveOptions(nextOptions);
      setErrors(nextErrors);
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once — filter column list is static at mount time

  return { liveOptions, loading, errors };
}
