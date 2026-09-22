import React, { createContext, useContext, useState, useMemo } from 'react';
import { Action } from '@thoughtspot/visual-embed-sdk';
import { Tier, getHiddenActions, getDisabledActions, isSpotterEnabled } from './tiers';

interface TierContextValue {
  tier: Tier;
  setTier: (tier: Tier) => void;
  hiddenActions: Action[];
  disabledActions: Action[];
  spotterEnabled: boolean;
}

const TierContext = createContext<TierContextValue>({
  tier: 'Pro',
  setTier: () => {},
  hiddenActions: [],
  disabledActions: [],
  spotterEnabled: true,
});

export function TierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>('Pro');

  const value = useMemo<TierContextValue>(() => ({
    tier,
    setTier,
    hiddenActions: getHiddenActions(tier),
    disabledActions: getDisabledActions(tier),
    spotterEnabled: isSpotterEnabled(tier),
  }), [tier]);

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  return useContext(TierContext);
}
