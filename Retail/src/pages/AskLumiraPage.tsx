import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { THOUGHTSPOT_MODEL_ID, TOP_HEADER_PX } from '../config/thoughtspot';
import { useTier } from '../config/TierContext';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BLUE   = '#2B3CC1';
const NAVY   = '#0F1875';
const BG     = '#F0F2FF';
const BG2    = '#E5E8FA';
const BORDER = 'rgba(43,60,193,0.12)';
const INK2   = '#515962';

// ─── Sample questions ─────────────────────────────────────────────────────────
const SAMPLE_QUESTIONS = [
  { label: 'Units sold by channel',         query: 'units sold by channel' },
  { label: 'Top performing categories',      query: 'top categories by net revenue' },
  { label: 'Inventory by brand',             query: 'quantity on hand by brand' },
  { label: 'Revenue vs last month',          query: 'net revenue this month vs last month' },
  { label: 'Sell-through by category',       query: 'sell through rate by category' },
  { label: 'Products needing restock',       query: 'products with low stock and high sell through rate' },
];

// ─── General company Q&A ──────────────────────────────────────────────────────
const COMPANY_TRIGGERS = [
  /what (does|is) lumira/i,
  /who is lumira/i,
  /tell me about lumira/i,
  /about lumira/i,
  /lumira('s)? (mission|vision|features?|product|platform|offering|story|history)/i,
  /what (can|do) (you|lumira) (do|offer|help)/i,
  /how does lumira work/i,
];

const COMPANY_BRIEF = `**Lumira** is a retail intelligence platform built for modern commerce teams.

We connect your sales, inventory, channel, and supplier data into a single live view — so every team from buying to marketing can make faster, more confident decisions.

**Key capabilities:**
• **Real-time dashboards** — track revenue, sell-through, stock health, and returns across every channel
• **AI-powered Q&A** — ask plain-English questions and get instant charts backed by live data
• **Restock intelligence** — surface low-stock, high-velocity SKUs before you miss a sale
• **Channel analytics** — compare performance across DTC, marketplace, wholesale, and retail

Lumira AI is the conversational layer built into every screen — just ask, and your data answers.`;

function isGeneralQuestion(q: string) {
  return COMPANY_TRIGGERS.some(rx => rx.test(q));
}

// ─── Gem icon ─────────────────────────────────────────────────────────────────
function LumiraGem({ size = 48, color = BLUE }: { size?: number; color?: string }) {
  const s = size, cx = s / 2, cy = s / 2, r = s * 0.42;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });
  const hex     = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const topPoly = [...pts.slice(0, 3), [cx, cy] as [number, number]]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <polygon points={hex} stroke={color} strokeWidth="2" fill={`${color}14`} strokeLinejoin="round" />
      <polygon points={topPoly} fill={`${color}30`} strokeLinejoin="round" />
      <line x1={pts[0][0]} y1={pts[0][1]} x2={cx} y2={cy} stroke={color} strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1={pts[1][0]} y1={pts[1][1]} x2={cx} y2={cy} stroke={color} strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1={pts[2][0]} y1={pts[2][1]} x2={cx} y2={cy} stroke={color} strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[2][0]} y2={pts[2][1]} stroke={color} strokeWidth="1.2" strokeOpacity="0.4" />
    </svg>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 4px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', backgroundColor: BLUE,
          animation: 'lumiraBounce 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`, opacity: 0.7,
        }} />
      ))}
      <style>{`
        @keyframes lumiraBounce {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40%          { transform:translateY(-6px); opacity:1; }
        }
      `}</style>
    </div>
  );
}

// ─── Company brief renderer ───────────────────────────────────────────────────
function CompanyBrief({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.75, color: NAVY }}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={i}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : <span key={j}>{p}</span>)}
          </div>
        );
      })}
    </div>
  );
}

// ─── General chat message types ───────────────────────────────────────────────
interface ChatMessage {
  id:   number;
  role: 'user' | 'ai' | 'loading';
  text?: string;
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
const MODAL_BG   = '#12175e';
const MODAL_CARD = '#1a2070';
const LAVENDER   = '#a78bfa';
const LAVENDER2  = '#7c6fe0';

const FEATURES = [
  'Unlimited Ask Lumira AI questions',
  'Drill-down & underlying-data access',
  'CSV, Excel & PDF exports',
  'Priority insights & forecasting',
  'Dedicated onboarding & support',
];

const TIME_SLOTS = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'];

function MiniCalendar({ onClose }: { onClose: () => void }) {
  const today = new Date(2026, 8, 16); // Sep 16 2026
  const [month, setMonth] = useState(new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = month.getFullYear();
  const mo   = month.getMonth();
  const monthName = month.toLocaleString('default', { month: 'long' });
  const firstDow = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isAvailable = (d: number) => {
    const dt = new Date(year, mo, d);
    const dow = dt.getDay();
    return dt >= today && dow !== 0 && dow !== 6;
  };

  const selDate = selectedDay
    ? new Date(year, mo, selectedDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null;

  const btn = (label: string, primary = false) => (
    <div style={{
      padding: '8px 0', borderRadius: 8, textAlign: 'center', fontSize: 13,
      cursor: 'pointer', fontWeight: 500,
      backgroundColor: primary ? LAVENDER2 : 'rgba(255,255,255,0.06)',
      border: `1px solid ${primary ? LAVENDER2 : 'rgba(255,255,255,0.12)'}`,
      color: '#fff',
    }}>{label}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Pricing card */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10, padding: '12px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Query Pack — 500 queries</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
            Resets your counter to 500 queries immediately
          </div>
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, color: LAVENDER }}>$500</div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{
          padding: '9px 0', borderRadius: 8, textAlign: 'center', fontSize: 13,
          cursor: 'pointer', fontWeight: 600,
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Pay Now
        </div>
        <div style={{
          padding: '9px 0', borderRadius: 8, textAlign: 'center', fontSize: 13,
          cursor: 'pointer', fontWeight: 600,
          backgroundColor: LAVENDER2, border: `1px solid ${LAVENDER2}`, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Schedule Meeting
        </div>
      </div>

      {/* Calendar header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, margin: '0 auto 8px',
          background: 'linear-gradient(135deg,#ef4444,#dc2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#fff',
        }}>
          {today.getDate()}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Schedule with Alex</div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>30 min · Account Manager</div>
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setMonth(new Date(year, mo - 1, 1))} style={{
          background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: '0 6px',
        }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{monthName} {year}</span>
        <button onClick={() => setMonth(new Date(year, mo + 1, 1))} style={{
          background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: '0 6px',
        }}>›</button>
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, textAlign: 'center' }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', paddingBottom: 2 }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const avail = isAvailable(d);
          const sel   = d === selectedDay;
          return (
            <div key={i} onClick={() => avail && setSelectedDay(d)} style={{
              padding: '5px 0', borderRadius: 6, fontSize: 12, fontWeight: 500,
              cursor: avail ? 'pointer' : 'default',
              color: avail ? '#fff' : 'rgba(255,255,255,0.2)',
              backgroundColor: sel ? LAVENDER2 : avail ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: avail && !sel ? '1px solid rgba(255,255,255,0.12)' : sel ? `1px solid ${LAVENDER2}` : '1px solid transparent',
            }}>{d}</div>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDay && (
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{selDate}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {TIME_SLOTS.map(t => (
              <div key={t} style={{
                padding: '7px 0', borderRadius: 6, textAlign: 'center', fontSize: 12,
                cursor: 'pointer', color: '#fff', fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}>{t}</div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.5 }}>
        Demo experience — no payment is taken and no meeting is booked.
      </div>
      <div onClick={onClose} style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
        Maybe later
      </div>
    </div>
  );
}

function UpgradeModal({ questionsLeft, onClose }: { questionsLeft: number; onClose: () => void }) {
  const [screen, setScreen] = useState<'pitch' | 'checkout'>('pitch');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(10,12,40,0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 420, maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: MODAL_BG,
        borderRadius: 18, padding: '28px 24px 24px',
        position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        border: '1px solid rgba(167,139,250,0.15)',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          fontSize: 18, cursor: 'pointer', lineHeight: 1,
        }}>✕</button>

        {screen === 'pitch' ? (
          <>
            {/* Icon */}
            <div style={{
              width: 54, height: 54, borderRadius: 14,
              backgroundColor: 'rgba(124,111,224,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill={LAVENDER}>
                <path d="M12 2l1.5 4.6H18l-3.9 2.8 1.5 4.6L12 11.2l-3.6 2.8 1.5-4.6L6 6.6h4.5z"/>
                <circle cx="5" cy="19" r="1.5" opacity="0.6"/>
                <circle cx="19" cy="19" r="1.5" opacity="0.6"/>
                <circle cx="12" cy="21" r="1" opacity="0.4"/>
              </svg>
            </div>

            {/* Label */}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: LAVENDER, textTransform: 'uppercase', marginBottom: 8 }}>
              Lumira Pro
            </div>

            {/* Headline */}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>
              Unlock unlimited Lumira AI
            </h2>

            {/* Body */}
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0 0 20px' }}>
              You have <strong style={{ color: '#fff' }}>{questionsLeft}</strong> free questions left on
              the trial. Upgrade to Pro for unlimited access across your team.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={LAVENDER}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: 14, color: '#fff' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div onClick={() => setScreen('checkout')} style={{
              backgroundColor: LAVENDER, color: '#1a1060', fontWeight: 700, fontSize: 15,
              padding: '14px 0', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
              marginBottom: 12,
            }}>
              Upgrade to Pro →
            </div>

            {/* Maybe later */}
            <div onClick={onClose} style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 16 }}>
              Maybe later
            </div>

            {/* Footer */}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.5 }}>
              Demo experience — no payment is taken. Talk to your Lumira account team for production pricing.
            </div>
          </>
        ) : (
          <>
            {/* Back */}
            <button onClick={() => setScreen('pitch')} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
              fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              marginBottom: 16, padding: 0,
            }}>
              ← Back
            </button>
            <MiniCalendar onClose={onClose} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AskLumiraPage() {
  const { hiddenActions, disabledActions, spotterEnabled } = useTier();

  // Spotter state (left panel)
  const [spotterQuery,  setSpotterQuery]  = useState<string | null>(null);
  const [spotterActive, setSpotterActive] = useState(false);
  const [spotterReady,  setSpotterReady]  = useState(false);
  const spotterRef     = useRef<any>(null);
  const pendingQuery   = useRef<string | null>(null);

  // Paywall — use a ref so the count is always fresh inside useCallback closures
  const FREE_QUESTIONS   = 3;
  const questionCountRef = useRef(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // General chat state (right panel)
  const [chatMsgs,   setChatMsgs]   = useState<ChatMessage[]>([]);
  const [input,      setInput]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const counterRef     = useRef(0);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Auto-scroll right panel
  useEffect(() => {
    rightScrollRef.current?.scrollTo({ top: rightScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMsgs]);

  // When embed fires its load event, flush any query that arrived before it was ready
  const handleSpotterLoad = useCallback(() => {
    setSpotterReady(true);
    if (pendingQuery.current && spotterRef.current) {
      spotterRef.current.trigger(HostEvent.SpotterSearch, {
        query: pendingQuery.current, executeSearch: true,
      });
      pendingQuery.current = null;
    }
  }, []);

  const sendToSpotter = useCallback((query: string) => {
    setActiveChip(query);

    if (!spotterActive) {
      // First ever query — mount with searchOptions prop
      setSpotterQuery(query);
      setSpotterActive(true);
      return;
    }

    // Subsequent queries — keep conversation alive, just send via HostEvent
    if (spotterReady && spotterRef.current) {
      spotterRef.current.trigger(HostEvent.SpotterSearch, {
        query, executeSearch: true,
      });
    } else {
      // Embed mounted but not ready yet — queue it
      pendingQuery.current = query;
    }
  }, [spotterActive, spotterReady]);

  const sendGeneral = useCallback(async (query: string) => {
    const uid = ++counterRef.current;
    const aid = ++counterRef.current;
    setChatMsgs(prev => [
      ...prev,
      { id: uid, role: 'user',    text: query },
      { id: aid, role: 'loading'              },
    ]);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setIsLoading(false);
    setChatMsgs(prev => prev.map(m =>
      m.id === aid ? { ...m, role: 'ai' as const, text: COMPANY_BRIEF } : m
    ));
  }, []);

  const send = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    // Paywall check — ref always has current value, no stale closure
    questionCountRef.current += 1;
    if (questionCountRef.current >= FREE_QUESTIONS) {
      setShowUpgrade(true);
      return;
    }

    setInput('');
    if (isGeneralQuestion(query)) {
      await sendGeneral(query);
    } else {
      sendToSpotter(query);
    }
  }, [isLoading, sendGeneral, sendToSpotter]);

  const handleChip    = (query: string) => send(query);
  const handleSubmit  = (e: React.FormEvent) => { e.preventDefault(); send(input); };

  const PAGE_H = `calc(100vh - ${TOP_HEADER_PX}px)`;

  // ── Upgrade gate for non-Pro users ──────────────────────────────────────────
  if (!spotterEnabled) return (
    <div style={{
      height: PAGE_H, backgroundColor: BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {[280, 420, 560].map(d => (
        <div key={d} style={{
          position: 'absolute', width: d, height: d, borderRadius: '50%',
          border: `1px solid rgba(43,60,193,${(0.07 - d * 0.00009).toFixed(3)})`,
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />
      ))}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420, padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <LumiraGem size={64} color="rgba(43,60,193,0.25)" />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          backgroundColor: BLUE, color: '#FFF', borderRadius: 20,
          padding: '4px 14px', fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem',
        }}>
          Pro Feature
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', margin: '0 0 0.75rem', lineHeight: 1.1 }}>
          Unlock Ask Lumira
        </h2>
        <p style={{ fontSize: 14, color: INK2, lineHeight: 1.7, margin: '0 0 2rem' }}>
          Ask Lumira is available on the Pro plan. Upgrade to get unlimited AI-powered
          data questions, live charts, and conversational analytics for your whole team.
        </p>
        <div style={{
          backgroundColor: BLUE, color: '#FFF', fontWeight: 700, fontSize: 14,
          padding: '13px 32px', borderRadius: 10, cursor: 'pointer',
          display: 'inline-block', letterSpacing: '-0.01em',
          boxShadow: '0 4px 16px rgba(43,60,193,0.3)',
        }}>
          Upgrade to Pro →
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: INK2 }}>
          Demo experience — switch to Pro in the sidebar to preview.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: PAGE_H, backgroundColor: BG, overflow: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════════════
          LEFT — Spotter 3 (full experience) / hero
         ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: '0 0 68%',
        borderRight: `1px solid ${BORDER}`,
        backgroundColor: spotterActive ? '#FFFFFF' : BG,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
      }}>

        {/* Hero — shown until first data question */}
        {!spotterActive && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '3rem 4rem', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {[280, 420, 560].map(d => (
              <div key={d} style={{
                position: 'absolute', width: d, height: d, borderRadius: '50%',
                border: `1px solid rgba(43,60,193,${(0.07 - d * 0.00009).toFixed(3)})`,
                top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                pointerEvents: 'none',
              }} />
            ))}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <LumiraGem size={64} />
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: BLUE, color: '#FFF', borderRadius: 20,
                padding: '4px 14px', fontSize: 10.5, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                Powered by Lumira AI
              </div>
              <h1 style={{
                fontSize: 'clamp(28px,3vw,40px)', fontWeight: 800, color: NAVY,
                letterSpacing: '-0.03em', margin: '0 0 1rem', lineHeight: 1.1,
              }}>
                Ask Lumira
              </h1>
              <p style={{ fontSize: 14.5, color: INK2, lineHeight: 1.7, margin: '0 0 2rem', maxWidth: 420 }}>
                Ask a data question using the panel on the right, or click a suggested question
                below to see a live Spotter answer here.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {SAMPLE_QUESTIONS.map(q => (
                  <button key={q.query} type="button" onClick={() => handleChip(q.query)} style={{
                    padding: '7px 14px', borderRadius: 20,
                    border: `1px solid ${BORDER}`,
                    backgroundColor: activeChip === q.query ? BLUE : '#FFFFFF',
                    color: activeChip === q.query ? '#FFF' : NAVY,
                    fontSize: 12.5, fontWeight: activeChip === q.query ? 600 : 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: '0 1px 4px rgba(43,60,193,0.06)',
                  }}>{q.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Spotter 3 embed — mounted once active, persists for conversation continuity */}
        <div style={{
          display: spotterActive ? 'flex' : 'none',
          flex: 1, flexDirection: 'column', overflow: 'hidden',
        }}>
          {spotterActive && (
            <SpotterEmbed
              ref={spotterRef}
              onLoad={handleSpotterLoad}
              worksheetId={THOUGHTSPOT_MODEL_ID}
              updatedSpotterChatPrompt
              hideSourceSelection
              hideSampleQuestions={false}
              spotterChatConfig={{
                hideToolResponseCardBranding: true,
                toolResponseCardBrandingLabel: 'Lumira AI',
              }}
              hiddenActions={hiddenActions}
              disabledActions={disabledActions}
              {...(spotterQuery ? { searchOptions: { searchQuery: spotterQuery } } : {})}
              customizations={{
                style: {
                  customCSS: {
                    rules_UNSTABLE: {
                      /* Hide the Spotter input bar — questions come from the right panel */
                      '[data-testid="spotter-input-box"]': { display: 'none !important' },
                      '[class*="inputContainer"]':          { display: 'none !important' },
                      '[class*="QueryBox"]':                { display: 'none !important' },
                      '[class*="queryBox"]':                { display: 'none !important' },
                      '[class*="input-area"]':              { display: 'none !important' },
                      '[class*="InputArea"]':               { display: 'none !important' },
                      '[class*="spotterFooter"]':           { display: 'none !important' },
                      '[class*="SpotterFooter"]':           { display: 'none !important' },
                      '[class*="conversation-input"]':      { display: 'none !important' },
                      '[class*="ConversationInput"]':       { display: 'none !important' },
                      '[class*="chatInput"]':               { display: 'none !important' },
                      '[class*="ChatInput"]':               { display: 'none !important' },
                      '[class*="footerContainer"]':         { display: 'none !important' },
                      '[class*="FooterContainer"]':         { display: 'none !important' },
                      '[placeholder="Enter your question"]':{ display: 'none !important' },
                    } as any,
                  },
                },
              }}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT — general Q&A chat + data question input
         ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: '0 0 32%',
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
        }}>
          <LumiraGem size={28} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>Lumira AI</div>
            <div style={{ fontSize: 11, color: INK2 }}>Commerce intelligence</div>
          </div>
          <div style={{
            marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#16a34a', boxShadow: '0 0 0 3px rgba(22,163,74,0.20)',
          }} />
        </div>

        {/* Chat feed */}
        <div
          ref={rightScrollRef}
          style={{
            flex: 1, overflowY: 'auto',
            padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: 10,
            backgroundColor: BG,
          }}
        >
          {chatMsgs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: INK2, fontSize: 13, lineHeight: 1.65 }}>
              Data questions will open in Spotter on the left.
              Ask me anything about Lumira here.
            </div>
          )}

          {chatMsgs.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start', gap: 7,
            }}>
              {msg.role !== 'user' && (
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  backgroundColor: BG2, border: `1px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2,
                }}>
                  <LumiraGem size={13} />
                </div>
              )}
              <div style={{
                maxWidth: '85%',
                backgroundColor: msg.role === 'user' ? BLUE : '#FFFFFF',
                color: msg.role === 'user' ? '#FFF' : NAVY,
                borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                padding: '9px 13px',
                fontSize: 13, lineHeight: 1.5,
                boxShadow: '0 1px 4px rgba(43,60,193,0.08)',
                border: msg.role !== 'user' ? `1px solid ${BORDER}` : 'none',
              }}>
                {msg.role === 'user'    && msg.text}
                {msg.role === 'loading' && <TypingDots />}
                {msg.role === 'ai'      && <CompanyBrief text={msg.text ?? ''} />}
              </div>
            </div>
          ))}

          {/* Data question status pills */}
          {spotterActive && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 20,
              backgroundColor: '#eff6ff',
              border: '1px solid rgba(43,60,193,0.18)',
              alignSelf: 'flex-end',
              fontSize: 11.5, color: BLUE, fontWeight: 500,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Spotter is answering on the left
            </div>
          )}

          {/* Sample chips */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: INK2, marginBottom: 6, fontWeight: 500 }}>
              {chatMsgs.length === 0 ? 'Try a data question:' : 'Try asking:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SAMPLE_QUESTIONS.map(q => (
                <button key={q.query} type="button" onClick={() => handleChip(q.query)} style={{
                  padding: '5px 11px', borderRadius: 16,
                  border: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF',
                  color: NAVY, fontSize: 11.5, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.12s',
                }}>{q.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{
          padding: '0.75rem 1rem',
          borderTop: `1px solid ${BORDER}`,
          backgroundColor: '#FFFFFF',
          display: 'flex', gap: 8, alignItems: 'center',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={isLoading}
            style={{
              flex: 1, padding: '9px 13px', borderRadius: 22,
              border: `1px solid ${BORDER}`,
              fontSize: 13, color: NAVY, backgroundColor: BG,
              outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: isLoading || !input.trim() ? BG2 : BLUE,
              border: 'none',
              cursor: isLoading || !input.trim() ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={isLoading || !input.trim() ? INK2 : '#FFFFFF'}
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Upgrade modal — shown after FREE_QUESTIONS are used */}
      {showUpgrade && (
        <UpgradeModal
          questionsLeft={Math.max(0, FREE_QUESTIONS - questionCountRef.current + 1)}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  );
}
