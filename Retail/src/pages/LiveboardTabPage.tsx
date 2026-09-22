import React, { useCallback } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { THOUGHTSPOT_LIVEBOARD_ID, TOP_HEADER_PX, LIVEBOARD_NO_HEADER_CUSTOMIZATIONS } from '../config/thoughtspot';

import { useTier } from '../config/TierContext';
import { formatThoughtSpotEmbedError } from '../utils/thoughtspotErrors';

const BG = '#F0F2FF';
const LABEL = 'rgba(0,0,0,0.45)';
const EMBED_MIN_H = `calc(100vh - ${TOP_HEADER_PX}px - 160px)`;

interface Props { title: string; description?: string; tabId: string; liveboardId?: string; }

export default function LiveboardTabPage({ title, description, tabId, liveboardId }: Props) {
  const { hiddenActions, disabledActions } = useTier();
  const resolvedLiveboardId = liveboardId ?? THOUGHTSPOT_LIVEBOARD_ID;

  const onError = useCallback((err: { data?: { errorMessage?: string }; message?: string }) => {
    console.error(`[ThoughtSpot – ${title}]`, formatThoughtSpotEmbedError(err), err);
  }, [title]);

  return (
    <div style={{ backgroundColor: BG, minHeight: `calc(100vh - ${TOP_HEADER_PX}px)` }}>

      <div style={{ padding: '1.75rem 2.5rem 1.25rem' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: LABEL, marginBottom: 6 }}>
          Lumira
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0F1875', margin: 0, letterSpacing: '-0.03em' }}>{title}</h1>
        {description && (
          <p style={{ fontSize: 14, color: 'rgba(17,17,17,0.55)', margin: '4px 0 0', maxWidth: 600 }}>
            {description}
          </p>
        )}
      </div>

      <div style={{ padding: '0 2.5rem 2rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'visible', minHeight: EMBED_MIN_H, border: '1px solid rgba(43,60,193,0.10)' }}>
          <LiveboardEmbed
            key={tabId}
            liveboardId={resolvedLiveboardId}
            activeTabId={tabId}
            fullHeight
            isLiveboardStylingAndGroupingEnabled
            hiddenActions={hiddenActions}
            disabledActions={disabledActions}
            customizations={LIVEBOARD_NO_HEADER_CUSTOMIZATIONS}
            onError={onError}
            style={{ width: '100%', minHeight: EMBED_MIN_H, display: 'block', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
