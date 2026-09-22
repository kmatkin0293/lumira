import React, { useMemo } from 'react';
import { EmbedConfig, useInit } from '@thoughtspot/visual-embed-sdk/react';
import { buildThoughtSpotEmbedConfig } from '../config/thoughtspot';

type Props = { children: React.ReactNode };

/**
 * Initializes the ThoughtSpot SDK once at the app level.
 */
export default function ThoughtSpotShell({ children }: Props) {
  const embedConfig = useMemo<EmbedConfig>(() => buildThoughtSpotEmbedConfig(), []);
  useInit(embedConfig);
  return <>{children}</>;
}
