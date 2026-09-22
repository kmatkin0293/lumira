import React, { useCallback } from 'react';
import { AppEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { Action } from '@thoughtspot/visual-embed-sdk';
import { VIEWPORT_LESS_TOP_HEADER } from '../config/thoughtspot';
import { useTier } from '../config/TierContext';
import { formatThoughtSpotEmbedError } from '../utils/thoughtspotErrors';

export default function Portfolios() {
  const { hiddenActions, disabledActions } = useTier();

  const onError = useCallback((err: { data?: { errorMessage?: string }; message?: string }) => {
    console.error('[ThoughtSpot AppEmbed]', formatThoughtSpotEmbedError(err), err);
  }, []);

  return (
    <div
      style={{
        height: VIEWPORT_LESS_TOP_HEADER,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1D3FA8',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      <div style={{ padding: '1.75rem 2.5rem 1.5rem', backgroundColor: '#1D3FA8', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>LogiCore</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0 }}>Driver Performance</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '6px 0 0' }}>
          Your saved liveboards and analytics collections.
        </p>
      </div>

      <div style={{ padding: '1rem 2.5rem 1.25rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            backgroundColor: '#fff',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AppEmbed
            path="insights/home/liveboards"
            showPrimaryNavbar={false}
            hiddenActions={[
              ...hiddenActions,
              Action.EditACopy,
              Action.MakeACopy,
            ]}
            disabledActions={disabledActions}
            onError={onError}
            additionalFlags={{
              myLibraryDefaultTab: 'MY_LIVEBOARDS',
            }}
            style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
