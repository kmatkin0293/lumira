import React, { useState, useId } from 'react';

const INK  = '#0F1875';
const BG   = '#F0F2FF';
const BLUE = '#2B3CC1';
const YELLOW = '#FFD600';

/** Lumira mark — gem icon for dark (blue) panel */
function LumiraMarkWhite() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.15)" />
      <polygon points="18,6 27,13 27,23 18,30 9,23 9,13" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <polygon points="18,6 27,13 18,18 9,13" fill="rgba(255,255,255,0.30)" />
      <line x1="18" y1="6"  x2="18" y2="18" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="9"  y1="13" x2="27" y2="13" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
    </svg>
  );
}

/** Lumira mark — gem icon for light panel */
function LumiraMarkDark() {
  return (
    <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill={BLUE} />
      <polygon points="18,6 27,13 27,23 18,30 9,23 9,13" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <polygon points="18,6 27,13 18,18 9,13" fill="rgba(255,255,255,0.30)" />
      <line x1="18" y1="6"  x2="18" y2="18" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="9"  y1="13" x2="27" y2="13" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
    </svg>
  );
}

interface Props {
  onSignIn: () => void;
}

export default function SignInPage({ onSignIn }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [emailFocus, setEmailFocus]     = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const emailId    = useId();
  const passwordId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate network latency, then sign in
    setTimeout(() => {
      setLoading(false);
      onSignIn();
    }, 900);
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: INK,
    backgroundColor: '#FFFFFF',
    border: `1px solid ${focused ? BLUE : 'rgba(0,0,0,0.18)'}`,
    borderRadius: 7,
    outline: 'none',
    letterSpacing: '-0.01em',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box' as const,
  });

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Left panel — Lumira deep blue brand ──────────────────────── */}
      <div
        style={{
          width: '44%',
          minWidth: 360,
          backgroundColor: BLUE,
          display: 'flex',
          flexDirection: 'column',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LumiraMarkWhite />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Lumira
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.60)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Retail Intelligence
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ marginTop: 'auto', marginBottom: 'auto', paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '4px 10px', borderRadius: 20, marginBottom: '1.5rem',
            }}
          >
            AI-Powered Analytics
          </div>
          <h1
            style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 1.25rem',
            }}
          >
            Smarter retail{' '}
            <em style={{ fontStyle: 'italic', color: YELLOW }}>starts here.</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: '0 0 2.5rem', maxWidth: 340 }}>
            Lumira gives retail teams a single source of truth — live sales data,
            channel performance, and AI-driven insights, all in one place.
          </p>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { v: '140M+', l: 'Global customers' },
              { v: '100M+', l: 'Products listed' },
              { v: '40+',   l: 'Retail channels' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 22, fontWeight: 700, color: YELLOW, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
          © 2026 Lumira. All rights reserved.
        </div>

        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            right: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            border: '1px solid rgba(247,246,245,0.05)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '1px solid rgba(247,246,245,0.06)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Right panel — sign-in form ───────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          backgroundColor: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo (hidden on wide screens via flex visibility) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2.5rem' }}>
            <LumiraMarkDark />
            <span style={{ fontWeight: 800, fontSize: 15, color: INK, letterSpacing: '-0.02em' }}>
              Lumira
            </span>
          </div>

          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: INK,
              letterSpacing: '-0.03em',
              margin: '0 0 6px',
            }}
          >
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.50)', margin: '0 0 2rem' }}>
            Sign in to your Lumira Analytics account.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor={emailId}
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6, letterSpacing: '-0.01em' }}
              >
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                placeholder="you@lumira.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                style={inputStyle(emailFocus)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label
                htmlFor={passwordId}
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6, letterSpacing: '-0.01em' }}
              >
                Password
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                style={inputStyle(passwordFocus)}
              />
            </div>

            {/* Forgot */}
            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(0,0,0,0.45)', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  fontSize: 13, color: '#C0392B',
                  backgroundColor: 'rgba(192,57,43,0.08)',
                  border: '1px solid rgba(192,57,43,0.18)',
                  borderRadius: 6, padding: '9px 12px',
                  marginBottom: '1rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? 'rgba(43,60,193,0.5)' : BLUE,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 7,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.01em',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.10)' }} />
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.10)' }} />
          </div>

          {/* SSO button */}
          <button
            type="button"
            onClick={() => onSignIn()}
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: '#FFFFFF',
              color: INK,
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 7,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            {/* Google 'G' */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Demo hint */}
          <p
            style={{
              marginTop: '2rem',
              fontSize: 12,
              color: 'rgba(0,0,0,0.35)',
              textAlign: 'center',
              lineHeight: 1.5,
              padding: '10px 12px',
              backgroundColor: 'rgba(0,0,0,0.04)',
              borderRadius: 7,
            }}
          >
            Demo access — enter any email and password, or use Google to proceed.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
