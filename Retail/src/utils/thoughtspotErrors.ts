type ErrPayload = {
  data?: { errorMessage?: string; message?: string; code?: string };
  message?: string;
};

function explainGraphql(msg: string, code?: string): string {
  return [
    `ThoughtSpot returned an API error${code ? ` (${code})` : ''}.`,
    msg || 'A GraphQL request from the embedded app failed on the cluster.',
    'This is usually not a bug in your React code: confirm the embed user can access the worksheet or liveboard,',
    'log in to the same ThoughtSpot cluster in another tab with that user, and ask your admin to check cluster health and CORS / allowed origins for your app URL.',
  ].join(' ');
}

function tryParseJson(text: string): { code?: string; message?: string } | null {
  try {
    const j = JSON.parse(text) as { data?: { code?: string; message?: string }; code?: string; message?: string };
    const inner = j?.data ?? j;
    const code = inner?.code;
    const message = typeof inner?.message === 'string' ? inner.message : undefined;
    if (code || message) return { code, message };
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Turns ThoughtSpot embed errors into readable copy (including GRAPHQL_API_ERRORS).
 */
export function formatThoughtSpotEmbedError(err: unknown): string {
  if (err == null) return 'Unknown embed error';

  if (typeof err === 'string') {
    const parsed = tryParseJson(err);
    if (parsed?.code === 'GRAPHQL_API_ERRORS' || err.includes('GRAPHQL_API_ERRORS')) {
      return explainGraphql(parsed?.message ?? '', parsed?.code);
    }
    if (parsed?.message) return parsed.message;
    return err.length > 500 ? `${err.slice(0, 500)}…` : err;
  }

  const e = err as ErrPayload & { code?: string };
  const nested = e?.data;
  if (nested?.code === 'GRAPHQL_API_ERRORS' || (e as { code?: string }).code === 'GRAPHQL_API_ERRORS') {
    return explainGraphql(nested?.message ?? '', nested?.code ?? (e as { code?: string }).code);
  }

  const direct =
    e?.data?.errorMessage ??
    e?.data?.message ??
    (typeof e?.message === 'string' ? e.message : undefined);

  if (typeof direct === 'string') {
    if (direct.trim().startsWith('{')) {
      const parsed = tryParseJson(direct);
      if (parsed?.code === 'GRAPHQL_API_ERRORS' || direct.includes('GRAPHQL_API_ERRORS')) {
        return explainGraphql(parsed?.message ?? '', parsed?.code);
      }
      if (parsed?.message) return parsed.message;
    }
    if (direct.includes('GRAPHQL_API_ERRORS')) {
      const parsed = tryParseJson(direct);
      return explainGraphql(parsed?.message ?? direct, parsed?.code ?? 'GRAPHQL_API_ERRORS');
    }
    return direct;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
