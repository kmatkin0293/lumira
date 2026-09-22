import React, { useCallback, useRef, useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import {
  TOP_HEADER_PX,
  LIVEBOARD_NO_HEADER_CUSTOMIZATIONS,
} from '../config/thoughtspot';
import { useTier } from '../config/TierContext';
import { formatThoughtSpotEmbedError } from '../utils/thoughtspotErrors';

// ─── Constants ────────────────────────────────────────────────────────────────

const BG          = '#F0F2FF';
const LABEL       = 'rgba(0,0,0,0.45)';
const EMBED_MIN_H = `calc(100vh - ${TOP_HEADER_PX}px - 160px)`;
const BLUE        = '#2B3CC1';
const NAVY        = '#0F1875';

const TABS = [
  { id: 'tab1', label: 'Overview', liveboardId: '10428234-5aed-45cd-b248-eab776150946', tabId: '1c8444c3-2baf-4acc-8541-fcaca51a8e9f' },
  { id: 'tab2', label: 'Detail',   liveboardId: '5e3313c4-d293-4218-a9c5-af117f7c3015', tabId: '00e30fcb-7f53-4619-84ab-b7a9e3a69272' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { tier, hiddenActions, disabledActions } = useTier();
  const isPro = tier === 'Pro';
  const [selectedTab, setSelectedTab] = useState('tab1');
  const liveboardRef = useRef<any>(null);
  const active = TABS.find((t) => t.id === selectedTab)!;

  const onError = useCallback(
    (err: { data?: { errorMessage?: string }; message?: string }) => {
      console.error('[ThoughtSpot Liveboard]', formatThoughtSpotEmbedError(err), err);
    },
    []
  );

  // For Pro users, open the AI Highlights panel as soon as the liveboard renders
  const onLiveboardRendered = useCallback(() => {
    if (isPro && liveboardRef.current) {
      liveboardRef.current.trigger(HostEvent.AIHighlights);
    }
  }, [isPro]);

  return (
    <div style={{ backgroundColor: BG, minHeight: `calc(100vh - ${TOP_HEADER_PX}px)` }}>

      {/* ── Page header ── */}
      <div style={{ padding: '1.75rem 2.5rem 1rem' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: LABEL, marginBottom: 6 }}>
          Lumira
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, margin: '0 0 1rem', letterSpacing: '-0.03em' }}>
          Commerce Overview
        </h1>

        {/* Tab pill switcher */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((tab) => {
            const isActive = tab.id === selectedTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: '7px 20px',
                  borderRadius: 6,
                  border: `1px solid ${isActive ? BLUE : 'rgba(0,0,0,0.15)'}`,
                  background: isActive ? BLUE : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'rgba(17,17,17,0.70)',
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Liveboard embed ── */}
      <div style={{ padding: '0 2.5rem 2rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'visible', minHeight: EMBED_MIN_H, border: '1px solid rgba(43,60,193,0.10)' }}>
          <LiveboardEmbed
            key={active.tabId}
            ref={liveboardRef}
            liveboardId={active.liveboardId}
            activeTabId={active.tabId}
            fullHeight
            hideTabPanel
            isLiveboardStylingAndGroupingEnabled
            hiddenActions={hiddenActions}
            disabledActions={disabledActions}
            customizations={LIVEBOARD_NO_HEADER_CUSTOMIZATIONS}
            onError={onError}
            onLiveboardRendered={onLiveboardRendered}
            style={{ width: '100%', minHeight: EMBED_MIN_H, display: 'block', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
