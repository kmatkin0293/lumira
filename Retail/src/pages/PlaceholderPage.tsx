import React from 'react';

const BG = '#FFFFFF';
const LABEL = 'rgba(0,0,0,0.45)';

type Props = { title: string; description?: string };

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div style={{ minHeight: '100%', backgroundColor: BG }}>
      <div style={{ padding: '1.75rem 2.5rem 1.5rem' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: LABEL, marginBottom: 6 }}>Lumira</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0F1875', margin: 0, letterSpacing: '-0.03em' }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(17,17,17,0.55)', margin: '6px 0 0', maxWidth: 520 }}>
          {description ?? 'This section is coming soon.'}
        </p>
      </div>
    </div>
  );
}
