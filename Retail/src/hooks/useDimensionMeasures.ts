/**
 * useDimensionMeasures
 *
 * For every filter column, fetches the aggregate measure value for each
 * distinct dimension value from ThoughtSpot's Search Data API in parallel.
 *
 * Re-fetches automatically whenever the `measureColumn` changes (i.e. when
 * the user changes the Metric Picker selection).
 *
 * Returns a map:  filterId → { dimensionValue → measureValue }
 */

import { useEffect, useRef, useState } from 'react';
import { FilterDef } from '../components/FilterBar';
import { fetchDimensionMeasureValues } from '../services/thoughtspotApi';
import { TOY_STORE_MODEL_ID } from '../config/thoughtspot';

/** filterId → { dimensionValue → number } */
export type DimensionMeasureMap = Record<string, Record<string, number>>;

export interface UseDimensionMeasuresResult {
  /** The measure data per filter, or {} while loading */
  measureData: DimensionMeasureMap;
  /** True while any fetch is in-flight */
  loading: boolean;
}

export function useDimensionMeasures(
  filters: FilterDef[],
  measureColumn: string,
): UseDimensionMeasuresResult {
  const [measureData, setMeasureData] = useState<DimensionMeasureMap>({});
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setMeasureData({});

    const fetches = filters.map(async (f) => {
      try {
        const values = await fetchDimensionMeasureValues(
          f.columnName,
          measureColumn,
          TOY_STORE_MODEL_ID,
        );
        return { id: f.id, values };
      } catch (err) {
        console.warn(
          `[useDimensionMeasures] Failed to fetch "${measureColumn}" for "${f.columnName}":`,
          err,
        );
        return { id: f.id, values: {} };
      }
    });

    Promise.all(fetches).then((results) => {
      if (!mountedRef.current) return;
      const next: DimensionMeasureMap = {};
      for (const { id, values } of results) next[id] = values;
      setMeasureData(next);
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
    };
  }, [measureColumn]); // Re-fetch whenever the selected metric changes

  return { measureData, loading };
}
