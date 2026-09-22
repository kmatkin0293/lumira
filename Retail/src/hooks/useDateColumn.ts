import { useEffect, useState } from 'react';
import { detectDateColumn } from '../services/thoughtspotApi';

/**
 * Probes the ThoughtSpot model for the first date column that resolves.
 * Falls back to 'Date' if detection fails (e.g. not yet authenticated).
 */
export function useDateColumn(modelId: string): {
  dateColumn: string;
  dateColumnDetected: boolean;
  dateColumnLoading: boolean;
} {
  const [dateColumn,         setDateColumn]         = useState('Date');
  const [dateColumnDetected, setDateColumnDetected] = useState(false);
  const [dateColumnLoading,  setDateColumnLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    setDateColumnLoading(true);
    detectDateColumn(modelId).then(col => {
      if (cancelled) return;
      if (col) {
        setDateColumn(col);
        setDateColumnDetected(true);
      }
      setDateColumnLoading(false);
    }).catch(() => {
      if (!cancelled) setDateColumnLoading(false);
    });
    return () => { cancelled = true; };
  }, [modelId]);

  return { dateColumn, dateColumnDetected, dateColumnLoading };
}
