"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { fetchHistory, deleteResult } from "@/lib/api";

const MODE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  answers: { label: "Answers",       color: "#4f8ef7", bg: "rgba(79,142,247,0.12)" },
  notes:   { label: "Notes",         color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  both:    { label: "Answers+Notes", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

function getFileAvatar(filename: string) {
  const name = filename.replace(/\.[^.]+$/, "").trim();
  const words = name.split(/[\s_\-]+/).filter(Boolean);
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  const colors = [
    { bg: "rgba(79,142,247,0.15)",  color: "#4f8ef7" },
    { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
    { bg: "rgba(52,211,153,0.15)",  color: "#34d399" },
    { bg: "rgba(251,146,60,0.15)",  color: "#fb923c" },
    { bg: "rgba(248,113,113,0.15)", color: "#f87171" },
    { bg: "rgba(250,204,21,0.15)",  color: "#facc15" },
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return { initials, ...colors[idx] };
}

function shortName(filename: string) {
  const name = filename.replace(/\.[^.]+$/, "");
  return name.length > 38 ? name.slice(0, 38) + "…" : name;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "");
      setUserId(user.id);
      fetchHistory(user.id)
        .then((data) => setHistory(data.history))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const firstName = userEmail.split("@")[0];

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 20px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0,
        background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(16px)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))',
            border: '1px solid rgba(79,142,247,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#ng)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f8ef7" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: 'var(--text)' }}>
            StudyAI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{userEmail}</span>
          <button onClick={handleLogout} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '5px 12px', color: 'var(--text-muted)', fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--text)'; (e.target as HTMLElement).style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
          >Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
            color: 'var(--text)', marginBottom: 8, lineHeight: 1.2
          }}>
            Hey, {firstName} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Ready to study? Upload a past paper or notes below.
          </p>
        </div>

        {/* Stats row */}
        {!loading && history.length > 0 && (
          <div className="animate-fade-up stagger-1" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12, marginBottom: 32
          }}>
            {[
              { label: "Sessions",  value: history.length, color: '#4f8ef7' },
              { label: "This week", value: history.filter(h => new Date(h.created_at) > new Date(Date.now() - 7*86400000)).length, color: '#34d399' },
              { label: "Papers",    value: history.filter(h => h.mode !== 'notes').length, color: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px'
              }}>
                <p style={{ color: stat.color, fontSize: '1.5rem', fontWeight: 600, lineHeight: 1, marginBottom: 4 }}>
                  {stat.value}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload CTA */}
        <div className="animate-fade-up stagger-1" style={{ marginBottom: 36 }}>
          <Link href="/upload" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(79,142,247,0.1) 0%, rgba(167,139,250,0.1) 100%)',
            border: '1px solid rgba(79,142,247,0.25)',
            borderRadius: 16, padding: '18px 22px', textDecoration: 'none',
            transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(167,139,250,0.15) 100%)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.25)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79,142,247,0.1) 0%, rgba(167,139,250,0.1) 100%)'; }}
          >
            <div>
              <p style={{ color: '#a0b8ff', fontWeight: 600, fontSize: '0.95rem', marginBottom: 3 }}>
                Start a new session
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Upload PDF or TXT · Past paper or notes
              </p>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: '#fff', fontSize: 22, lineHeight: 1, fontWeight: 300 }}>+</span>
            </div>
          </Link>
        </div>

        {/* History */}
        <div className="animate-fade-up stagger-2">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14
          }}>
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.72rem',
              fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase'
            }}>Recent sessions</p>
            {history.length > 0 && (
              <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>{history.length} total</span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', gap: 6, padding: '20px 0', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                  animation: 'pulse-dot 1.2s ease infinite', animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && history.length === 0 && (
            <div style={{
              border: '1px dashed var(--border)', borderRadius: 14,
              padding: '40px 24px', textAlign: 'center'
            }}>
              <p style={{ fontSize: 28, marginBottom: 10 }}>📚</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No sessions yet</p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginTop: 4 }}>
                Your study sessions will appear here
              </p>
            </div>
          )}

          {/* Session list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((item, i) => {
              const avatar = getFileAvatar(item.file_name);
              const modeConf = MODE_CONFIG[item.mode] || MODE_CONFIG.both;
              return (
                <div key={item.id}
                  className={`animate-fade-up stagger-${Math.min(i + 1, 4)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '13px 16px', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: avatar.bg, border: `1px solid ${avatar.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ color: avatar.color, fontSize: '0.8rem', fontWeight: 700 }}>
                      {avatar.initials}
                    </span>
                  </div>

                  {/* Info — clickable */}
                  <Link href={`/results?id=${item.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <p style={{
                      color: 'var(--text)', fontSize: '0.88rem', fontWeight: 500,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {shortName(item.file_name)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span style={{
                        background: modeConf.bg, color: modeConf.color,
                        fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px',
                        borderRadius: 20, letterSpacing: '0.04em'
                      }}>
                        {modeConf.label}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!confirm("Delete this session?")) return;
                      try {
                        await deleteResult(userId, item.id);
                        setHistory(prev => prev.filter(h => h.id !== item.id));
                      } catch {}
                    }}
                    style={{
                      background: 'none', border: 'none', padding: '6px 8px',
                      color: 'var(--text-subtle)', cursor: 'pointer', fontSize: '0.85rem',
                      borderRadius: 6, transition: 'all 0.15s', flexShrink: 0
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--danger)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-subtle)'; }}
                    title="Delete session"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
