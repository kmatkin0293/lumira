import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { SearchEmbed, SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { THOUGHTSPOT_MODEL_ID, VIEWPORT_LESS_TOP_HEADER } from '../config/thoughtspot';
import { useTier } from '../config/TierContext';
import { formatThoughtSpotEmbedError } from '../utils/thoughtspotErrors';

type TabId = 'stella' | 'explore';

const BG      = '#F5F6FF';
const BG_2    = '#EAECFF';
const INK     = '#0F1875';
const LABEL   = 'rgba(0,0,0,0.45)';
const BLUE    = '#2B3CC1';
const NAVY    = '#0F1875';

// ─── Paywall config ───────────────────────────────────────────────────────────
const SESSION_KEY     = 'oc_ai_questions_answered';
const FREE_QUESTIONS  = 4;   // number of free answers before paywall kicks in

function getAnsweredCount(): number {
  return parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10);
}
function incrementAnsweredCount(): number {
  const next = getAnsweredCount() + 1;
  sessionStorage.setItem(SESSION_KEY, String(next));
  return next;
}

// ─── Upgrade modal (Pay Now / Schedule Meeting) ───────────────────────────────

const DARK   = '#0F1875';
const DARK2  = '#1A2699';
const SLOT_TIMES = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM'];
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function buildCalendar(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null)];
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function UpgradeModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void; }) {
  const [upgradeTab, setUpgradeTab]   = useState<'pay' | 'schedule'>('schedule');
  const [calYear,    setCalYear]      = useState(() => new Date().getFullYear());
  const [calMonth,   setCalMonth]     = useState(() => new Date().getMonth());
  const [selDay,     setSelDay]       = useState<number | null>(null);
  const [selTime,    setSelTime]      = useState<string | null>(null);
  const [confirmed,  setConfirmed]    = useState(false);

  const today = new Date();
  const isPast = (d: number) =>
    calYear < today.getFullYear() ||
    (calYear === today.getFullYear() && calMonth < today.getMonth()) ||
    (calYear === today.getFullYear() && calMonth === today.getMonth() && d < today.getDate());

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); setSelDay(null); setSelTime(null); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); setSelDay(null); setSelTime(null); };

  const weeks = buildCalendar(calYear, calMonth);
  const dayLabel = selDay ? `${DAYS_SHORT[(new Date(calYear, calMonth, selDay).getDay() + 7) % 7 === 0 ? 0 : new Date(calYear, calMonth, selDay).getDay()]}, ${MONTHS[calMonth].slice(0,3)} ${selDay}` : null;

  const handleConfirm = () => { setConfirmed(true); setTimeout(() => { onConfirm(); }, 1800); };

  const cardStyle: React.CSSProperties = {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 3001,
    backgroundColor: DARK,
    borderRadius: 16,
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    width: '100%', maxWidth: 460,
    maxHeight: '90vh', overflowY: 'auto',
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: '#FFFFFF',
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 3000 }} onClick={onClose} />
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {confirmed ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{upgradeTab === 'pay' ? 'Payment received!' : 'Meeting booked!'}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>
              {upgradeTab === 'pay' ? 'Your 500-query pack is now active.' : `See you on ${dayLabel} at ${selTime}. Check your email for the invite.`}
            </div>
          </div>
        ) : (
          <>
            {/* Product header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Query Pack — 500 queries</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#FFD600' }}>$500</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>Resets your counter to 500 queries immediately</div>
                  </div>
                </div>
                <button type="button" onClick={onClose}
                  style={{ marginLeft: 12, width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {([['pay','💳','Pay Now'],['schedule','📅','Schedule Meeting']] as const).map(([id, icon, label]) => (
                  <button key={id} type="button" onClick={() => setUpgradeTab(id)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', transition: 'all 0.15s',
                      backgroundColor: upgradeTab === id ? '#FFFFFF' : 'rgba(255,255,255,0.10)',
                      color: upgradeTab === id ? DARK : 'rgba(255,255,255,0.65)',
                    }}>
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Now tab */}
            {upgradeTab === 'pay' && (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Card number</label>
                  <input placeholder="1234 5678 9012 3456" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Expiry</label>
                    <input placeholder="MM / YY" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>CVC</label>
                    <input placeholder="•••" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                </div>
                <button type="button" onClick={handleConfirm}
                  style={{ width: '100%', padding: '13px', borderRadius: 9, border: 'none', backgroundColor: BLUE, color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em', marginBottom: 10 }}>
                  Pay $500
                </button>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', textAlign: 'center', margin: 0 }}>
                  Demo — no payment is taken. For production pricing talk to your account team.
                </p>
              </div>
            )}

            {/* Schedule Meeting tab */}
            {upgradeTab === 'schedule' && (
              <div style={{ padding: '1.25rem 1.5rem' }}>
                {/* Host */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFD600', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 20, fontWeight: 800, color: DARK }}>
                    31
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Schedule with Brian</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', marginTop: 3 }}>30 min · Account Manager</div>
                </div>

                {/* Month navigation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', padding: '4px 8px', fontSize: 18, lineHeight: 1 }}>‹</button>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{MONTHS[calMonth]} {calYear}</span>
                  <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', padding: '4px 8px', fontSize: 18, lineHeight: 1 }}>›</button>
                </div>

                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                  {DAYS_SHORT.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
                    {week.map((day, di) => {
                      const past = day !== null && isPast(day);
                      const selected = day === selDay;
                      return (
                        <button key={di} type="button"
                          disabled={day === null || past}
                          onClick={() => { if (day && !past) { setSelDay(day); setSelTime(null); } }}
                          style={{
                            textAlign: 'center', padding: '7px 2px', borderRadius: 8, border: 'none', cursor: day && !past ? 'pointer' : 'default',
                            backgroundColor: selected ? BLUE : 'transparent',
                            color: !day ? 'transparent' : past ? 'rgba(255,255,255,0.20)' : selected ? '#FFFFFF' : '#FFFFFF',
                            fontSize: 13, fontWeight: selected ? 700 : 400,
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => { if (day && !past && !selected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(43,60,193,0.40)'; }}
                          onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                        >
                          {day ?? ''}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Selected date + time slots */}
                {selDay && (
                  <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'rgba(255,255,255,0.80)' }}>{dayLabel}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {SLOT_TIMES.map(t => (
                        <button key={t} type="button" onClick={() => setSelTime(t)}
                          style={{ padding: '8px 4px', borderRadius: 7, border: `1px solid ${selTime === t ? BLUE : 'rgba(255,255,255,0.18)'}`, backgroundColor: selTime === t ? BLUE : 'rgba(255,255,255,0.07)', color: '#FFFFFF', fontSize: 12, fontWeight: selTime === t ? 700 : 400, cursor: 'pointer', transition: 'all 0.12s' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm button */}
                {selDay && selTime && (
                  <button type="button" onClick={handleConfirm}
                    style={{ marginTop: 16, width: '100%', padding: '13px', borderRadius: 9, border: 'none', backgroundColor: BLUE, color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Confirm — {dayLabel} at {selTime}
                  </button>
                )}

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '12px 0 0' }}>
                  Demo — no meeting will be booked. Talk to your account team for production pricing.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── Tab card ─────────────────────────────────────────────────────────────────

function TabCard({ active, title, subtitle, onClick }: {
  active: boolean; title: string; subtitle: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '1 1 160px', minWidth: 140, textAlign: 'left',
        padding: '1rem 1.25rem', borderRadius: 8,
        border: active ? `1px solid ${BLUE}` : '1px solid rgba(43,60,193,0.15)',
        backgroundColor: active ? BLUE : '#FFFFFF',
        color: active ? '#FFFFFF' : NAVY,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ fontSize: 12, fontWeight: 400, color: active ? 'rgba(255,255,255,0.70)' : 'rgba(43,60,193,0.55)' }}>{subtitle}</div>
    </button>
  );
}

// ─── Tier upgrade prompt (Starter / Essentials users) ────────────────────────

function IrisUpgrade({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', padding: '3rem 2rem', textAlign: 'center', maxWidth: 480, margin: '2rem auto', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ width: 44, height: 44, background: BLUE, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="22" height="22" viewBox="0 0 18.835 18.5" fill="none">
          <path d="M6.54354 18.2234C6.51409 18.3665 6.62682 18.5 6.77712 18.5H12.0582C12.2085 18.5 12.3213 18.3665 12.2918 18.2234L11.1497 12.6749C11.1047 12.4562 11.3732 12.3085 11.5433 12.4584L15.7934 16.2025C15.9066 16.3022 16.0859 16.2741 16.161 16.1449L18.8045 11.5953C18.8778 11.4693 18.8151 11.3096 18.674 11.2629L13.2589 9.4688C13.0438 9.39756 13.0438 9.10232 13.2589 9.03108L18.674 7.23714C18.8151 7.1904 18.8778 7.03073 18.8045 6.90466L16.161 2.35513C16.0859 2.2259 15.9066 2.19779 15.7934 2.29749L11.5433 6.0415C11.3732 6.19138 11.1047 6.04364 11.1497 5.82493L12.2918 0.276568C12.3213 0.133482 12.2085 0 12.0582 0H6.77712C6.62682 0 6.51409 0.133482 6.54354 0.276568L7.68563 5.8248C7.73065 6.04351 7.46213 6.19125 7.292 6.04138L3.04191 2.29749C2.92873 2.19778 2.74949 2.22589 2.6744 2.35513L0.0308405 6.90466C-0.0424109 7.03073 0.020278 7.1904 0.161377 7.23714L5.5765 9.03108C5.79153 9.10232 5.79153 9.39756 5.57651 9.4688L0.16137 11.2629C0.0202738 11.3096 -0.0424129 11.4693 0.0308376 11.5953L2.67439 16.1449C2.74948 16.2741 2.92873 16.3022 3.04191 16.2025L7.29202 12.4585C7.46216 12.3086 7.73068 12.4563 7.68566 12.6751L6.54354 18.2234Z" fill={LABEL} />
        </svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Meet Lumira AI</h2>
      <p style={{ fontSize: 14, color: 'rgba(17,17,17,0.55)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
        Ask questions in plain language about your commerce and channel data. Upgrade to Pro to unlock Lumira AI, your intelligent commerce analyst.
      </p>
      <button type="button" onClick={onUpgrade}
        style={{ backgroundColor: BLUE, color: '#F7F6F5', border: 'none', padding: '10px 28px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em' }}>
        Upgrade to Pro
      </button>
    </div>
  );
}

// ─── Premium paywall modal ────────────────────────────────────────────────────

const FEATURES = [
  'Unlimited Ask Lumira AI questions',
  'Drill-down & underlying-data access',
  'CSV, Excel & PDF exports',
  'Priority channel & product insights',
  'Dedicated onboarding & support',
];

function PremiumModal({ questionsLeft, onUpgrade, onDismiss }: {
  questionsLeft: number;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(10,18,96,0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          width: '100%', maxWidth: 420,
          padding: '2rem',
          position: 'relative',
          fontFamily: "'Inter', -apple-system, sans-serif",
          animation: 'fadeInUp 0.25s ease both',
        }}>
          {/* Close */}
          <button
            type="button"
            onClick={onDismiss}
            style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,0.12)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.45)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Icon */}
          <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            {/* Sparkle / star icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>

          {/* Label */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>
            Lumira Premium
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Unlock unlimited Lumira AI
          </h2>

          {/* Subtitle */}
          <p style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.55)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            You have{' '}
            <strong style={{ color: NAVY }}>{questionsLeft} free question{questionsLeft !== 1 ? 's' : ''} left</strong>{' '}
            on the trial. Upgrade to Premium for unlimited access across your network.
          </p>

          {/* Feature list */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
            {FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: INK, marginBottom: 9 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            type="button"
            onClick={onUpgrade}
            style={{
              width: '100%', padding: '13px', borderRadius: 9, border: 'none',
              backgroundColor: BLUE, color: '#FFFFFF',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 12,
            }}
          >
            Upgrade to Premium
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Maybe later */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onDismiss}
              style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(0,0,0,0.45)', cursor: 'pointer', padding: '4px 8px' }}
            >
              Maybe later
            </button>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.30)', textAlign: 'center', margin: '1rem 0 0', lineHeight: 1.5 }}>
            Demo experience — no payment is taken. Talk to your Lumira account team for production pricing.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [tab, setTab]                   = useState<TabId>('stella');
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(undefined);
  const { hiddenActions, disabledActions, spotterEnabled, setTier } = useTier();
  const spotterRef   = useRef<any>(null);
  const searchRef    = useRef<any>(null);
  const spotterReady = useRef(false);
  const pendingChip  = useRef<string | null>(null);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // ── Paywall state ─────────────────────────────────────────────────────────
  const [answeredCount, setAnsweredCount] = useState<number>(getAnsweredCount);
  const [showPaywall,   setShowPaywall]   = useState<boolean>(false);
  const [showUpgrade,   setShowUpgrade]   = useState<boolean>(false);
  const [dismissed,     setDismissed]     = useState<boolean>(false); // "Maybe later" for this session

  const isPaywalled = answeredCount >= FREE_QUESTIONS && !dismissed;

  const onError = useCallback((err: { data?: { errorMessage?: string }; message?: string }) => {
    console.error('[ThoughtSpot Analytics]', formatThoughtSpotEmbedError(err), err);
  }, []);

  // Called when SpotterEmbed returns data — i.e. a question was answered
  const handleData = useCallback((_payload: any) => {
    const newCount = incrementAnsweredCount();
    setAnsweredCount(newCount);
  }, []);

  const handleRefresh = () => {
    try {
      if (tab === 'stella') spotterRef.current?.trigger(HostEvent.Reload);
      else searchRef.current?.trigger(HostEvent.Reload);
    } catch (e) {
      console.warn('Reload trigger', e);
    }
  };

  // Stable onLoad handler — must NOT be inline or the SDK re-inits the iframe on every re-render
  const handleSpotterLoad = useCallback(() => {
    spotterReady.current = true;
    if (pendingChip.current && spotterRef.current) {
      spotterRef.current.trigger(HostEvent.SpotterSearch, { query: pendingChip.current, executeSearch: true });
      pendingChip.current = null;
    }
  }, []);

  const handleChip = useCallback((q: string) => {
    setActiveChip(q);
    if (spotterReady.current && spotterRef.current) {
      // Embed ready — fire directly, keeps conversation alive
      spotterRef.current.trigger(HostEvent.SpotterSearch, { query: q, executeSearch: true });
    } else {
      // Embed not ready yet — queue it for onLoad
      pendingChip.current = q;
    }
  }, []);

  // Questions left to show in modal (0 = already over limit)
  const questionsLeft = Math.max(0, FREE_QUESTIONS - answeredCount);

  return (
    <div style={{ height: VIEWPORT_LESS_TOP_HEADER, display: 'flex', flexDirection: 'column', backgroundColor: BG, overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(43,60,193,0.12)' }}>
        <div style={{ backgroundColor: BG, padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: LABEL, marginRight: 12 }}>Lumira</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: INK, letterSpacing: '-0.02em' }}>Lumira AI Agent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Free question counter badge */}
            {spotterEnabled && answeredCount < FREE_QUESTIONS && (
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontWeight: 700, color: NAVY }}>{FREE_QUESTIONS - answeredCount}</span>
                <span>free question{FREE_QUESTIONS - answeredCount !== 1 ? 's' : ''} remaining</span>
              </div>
            )}
            {spotterEnabled && answeredCount >= FREE_QUESTIONS && !dismissed && (
              <div
                style={{ fontSize: 12, color: BLUE, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => setShowUpgrade(true)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Upgrade to Premium
              </div>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid rgba(43,60,193,0.25)', background: '#FFFFFF', color: BLUE, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tab cards */}
        <div style={{ backgroundColor: BG_2, padding: '0.6rem 2rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <TabCard active={tab === 'stella'} title="◈ Lumira AI" subtitle="Ask about your commerce data" onClick={() => setTab('stella')} />
            <TabCard active={tab === 'explore'} title="Explore Data" subtitle="Build custom commerce queries" onClick={() => setTab('explore')} />
          </div>
        </div>

      </div>

      {/* ── Content area ── */}
      <div style={{ padding: '0.75rem 2rem', flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'row', gap: '1rem', backgroundColor: BG, overflow: 'hidden' }}>
        {tab === 'stella' && !spotterEnabled ? (
          <IrisUpgrade onUpgrade={() => setShowUpgrade(true)} />
        ) : (
          <>
            {/* Spotter / Search embed */}
            <div style={{ flex: '1 1 0', minHeight: 0, position: 'relative', backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 16px rgba(43,60,193,0.10)', border: '1px solid rgba(43,60,193,0.12)' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {tab === 'stella' && spotterEnabled && (
                <SpotterEmbed
                  key="stella-persistent"
                  ref={spotterRef}
                  worksheetId={THOUGHTSPOT_MODEL_ID}
                  onError={onError}
                  onData={handleData as any}
                  onLoad={handleSpotterLoad}
                  hideSampleQuestions={false}
                  updatedSpotterChatPrompt
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
              )}
              {tab === 'explore' && (
                <SearchEmbed
                  ref={searchRef}
                  dataSource={THOUGHTSPOT_MODEL_ID}
                  hiddenActions={hiddenActions}
                  disabledActions={disabledActions}
                  onError={onError}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
              )}
            </div>

            {/* ── Paywall overlay — blocks interaction after free limit hit ── */}
            {tab === 'stella' && isPaywalled && (
              <div
                style={{
                  position: 'absolute', inset: 0,
                  zIndex: 50,
                  cursor: 'pointer',
                }}
                onClick={() => setShowPaywall(true)}
              >
                {/* Blur + modal when showPaywall is true */}
                {showPaywall && (
                  <PremiumModal
                    questionsLeft={questionsLeft}
                    onUpgrade={() => {
                      setShowPaywall(false);
                      setShowUpgrade(true);
                    }}
                    onDismiss={() => {
                      setShowPaywall(false);
                      setDismissed(true);
                    }}
                  />
                )}

                {/* Subtle "click to continue" banner when overlay is active but modal is closed */}
                {!showPaywall && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(15,24,117,0.08)',
                    backdropFilter: 'blur(1px)',
                  }}>
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${BLUE}`,
                      borderRadius: 10,
                      padding: '14px 24px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: '0 4px 20px rgba(43,60,193,0.15)',
                      cursor: 'pointer',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Free limit reached — click to unlock Premium</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Right panel — sample questions (Lumira AI tab only) */}
            {tab === 'stella' && spotterEnabled && (
              <div style={{
                width: 210, flexShrink: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid rgba(43,60,193,0.12)',
                boxShadow: '0 2px 16px rgba(43,60,193,0.08)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 14px 8px',
                  borderBottom: '1px solid rgba(43,60,193,0.08)',
                  fontSize: 10.5, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: LABEL,
                }}>
                  Suggested questions
                </div>
                <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto', flex: 1 }}>
                  {[
                    { label: 'Units sold by channel',          q: 'units sold by channel' },
                    { label: 'Top categories by revenue',       q: 'top categories by net revenue' },
                    { label: 'Inventory by brand',              q: 'quantity on hand by brand' },
                    { label: 'Revenue vs last month',           q: 'net revenue this month vs last month' },
                    { label: 'Sell-through by category',        q: 'sell through rate by category' },
                    { label: 'Products needing restock',        q: 'products with low stock and high sell through rate' },
                    { label: 'Return rate by category',         q: 'return rate by category' },
                    { label: 'Net margin by brand',             q: 'net margin by brand' },
                  ].map(({ label, q }) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleChip(q)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 7,
                        border: `1px solid ${activeChip === q ? BLUE : 'rgba(43,60,193,0.14)'}`,
                        backgroundColor: activeChip === q ? BLUE : 'transparent',
                        color: activeChip === q ? '#FFFFFF' : NAVY,
                        fontSize: 12.5,
                        fontWeight: activeChip === q ? 600 : 400,
                        cursor: 'pointer',
                        textAlign: 'left',
                        lineHeight: 1.35,
                        transition: 'all 0.12s',
                        width: '100%',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Upgrade modal (Pay Now / Schedule Meeting) ── */}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onConfirm={() => {
            setShowUpgrade(false);
            setTier('Pro');
            setDismissed(true);
          }}
        />
      )}
    </div>
  );
}
