import { Action } from '@thoughtspot/visual-embed-sdk';

export type Tier = 'Starter' | 'Essentials' | 'Pro';

/** AI-related actions hidden on Starter & Essentials */
const AI_ACTIONS: Action[] = [
  Action.AIHighlights,
  Action.SpotIQAnalyze,
  Action.SpotterChatConnectors,
  Action.SpotterChatConnectorResources,
];

/** Iris (Spotter) actions hidden on Essentials (and Starter inherits via STARTER_ONLY_HIDDEN) */
const ESSENTIALS_HIDDEN: Action[] = [
  Action.AskAi,
];

/** Actions hidden on Starter only */
const STARTER_ONLY_HIDDEN: Action[] = [
  Action.Pin,
  Action.AskAi,
  Action.AddFilter,
  Action.AxisMenuFilter,
  Action.CrossFilter,
];

/** Interactive actions disabled on Starter only */
const INTERACTIVE_ACTIONS: Action[] = [
  Action.DrillDown,
  Action.DrillInclude,
  Action.DrillExclude,
  Action.Explore,
  Action.AxisMenuSort,
];

export function getHiddenActions(tier: Tier): Action[] {
  switch (tier) {
    case 'Starter':
      return [...AI_ACTIONS, ...STARTER_ONLY_HIDDEN];
    case 'Essentials':
      return [...AI_ACTIONS, ...ESSENTIALS_HIDDEN];
    case 'Pro':
    default:
      return [];
  }
}

export function getDisabledActions(tier: Tier): Action[] {
  switch (tier) {
    case 'Starter':
      return [...INTERACTIVE_ACTIONS];
    case 'Essentials':
    case 'Pro':
    default:
      return [];
  }
}

export function isSpotterEnabled(tier: Tier): boolean {
  return tier === 'Pro';
}
