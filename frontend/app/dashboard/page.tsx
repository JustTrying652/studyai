"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { fetchHistory, deleteResult, fetchSubjects, createSubject, deleteSubject, assignSubject } from "@/lib/api";

const MODE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  answers: { label: "Answers",       color: "#4f8ef7", bg: "rgba(79,142,247,0.12)" },
  notes:   { label: "Notes",         color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  both:    { label: "Answers+Notes", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

const SUBJECT_COLORS = ["#4f8ef7", "#a78bfa", "#34d399", "#fb923c", "#f87171", "#facc15"];

function getFileAvatar(filename: string) {
  const name = filename.replace(/\.[^.]+$/, "").trim();
  const words = name.split(/[\s_\-]+/).filter(Boolean);
  const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
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

// Individual session row — has its own ref for the assign button
function SessionRow({
  item, subjects, userId,
  isDeleting, isAssigning,
  onAssignOpen, onAssignClose,
  onAssign, onDelete, onDeleteConfirm, onDeleteCancel,
}: any) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatar = getFileAvatar(item.file_name);
  const modeConf = MODE_CONFIG[item.mode] || MODE_CONFIG.both;
  const itemSubject = subjects.find((s: any) => s.id === item.subject_id);

  function handleAssignClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isAssigning) { onAssignClose(); return; }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      onAssignOpen(item.id, rect);
    }
  }

  return (
    <div>
      {isDeleting && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 4
        }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Delete this session?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onDeleteConfirm} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '4px 12px', color: 'var(--danger)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
            <button onClick={onDeleteCancel} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-card)', border: `1px solid ${isDeleting ? 'rgba(248,113,113,0.2)' : 'var(--border)'}`,
        borderRadius: 12, padding: '13px 14px', transition: 'all 0.15s',
      }}
        onMouseEnter={e => { if (!isDeleting) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}}
        onMouseLeave={e => { if (!isDeleting) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}}
      >
        {/* Avatar */}
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: avatar.bg, border: `1px solid ${avatar.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: avatar.color, fontSize: '0.8rem', fontWeight: 700 }}>{avatar.initials}</span>
        </div>

        {/* Info */}
        <Link href={`/results?id=${item.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
          <p style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shortName(item.file_name)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            <span style={{ background: modeConf.bg, color: modeConf.color, fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
              {modeConf.label}
            </span>
            {itemSubject && (
              <span style={{ background: `${itemSubject.color}18`, color: itemSubject.color, fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: itemSubject.color }} />
                {itemSubject.name}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </Link>

        {/* Assign button */}
        <button
          ref={btnRef}
          onClick={handleAssignClick}
          title="Assign subject"
          style={{
            background: isAssigning ? 'var(--bg-hover)' : 'none',
            border: isAssigning ? '1px solid var(--border)' : 'none',
            padding: '6px 7px', color: itemSubject ? itemSubject.color : 'var(--text-subtle)',
            cursor: 'pointer', fontSize: '1rem', borderRadius: 6, transition: 'all 0.15s',
            lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = itemSubject ? itemSubject.color : 'var(--text-subtle)')}
        >⊕</button>

        {/* Delete button */}
        <button onClick={() => onDelete()}
          style={{ background: 'none', border: 'none', padding: '6px 6px', color: isDeleting ? 'var(--danger)' : 'var(--text-subtle)', cursor: 'pointer', fontSize: '0.85rem', borderRadius: 6, transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--danger)'}
          onMouseLeave={e => (e.target as HTMLElement).style.color = isDeleting ? 'var(--danger)' : 'var(--text-subtle)'}
          title="Delete session"
        >✕</button>
      </div>

      {/* Assign dropdown — inline, right-aligned, above or below based on space */}
      {isAssigning && (
        <div
          ref={dropdownRef}
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', right: 0, marginTop: 4,
            zIndex: 999, background: 'var(--bg-card)',
            border: '1px solid var(--border-hover)', borderRadius: 12,
            padding: '8px', minWidth: 190,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
            Assign to subject
          </p>
          {item.subject_id && (
            <button onClick={() => onAssign(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 10px', color: 'var(--danger)', fontSize: '0.82rem', cursor: 'pointer', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >✕ Remove subject</button>
          )}
          {subjects.length === 0 && (
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', padding: '6px 10px' }}>No subjects yet — create one above</p>
          )}
          {subjects.map((s: any) => {
            const isActive = item.subject_id === s.id;
            return (
              <button key={s.id} onClick={() => onAssign(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                textAlign: 'left', background: isActive ? `${s.color}15` : 'none',
                border: 'none', padding: '8px 10px',
                color: isActive ? s.color : 'var(--text)',
                fontSize: '0.82rem', cursor: 'pointer', borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif", transition: 'background 0.1s'
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                {s.name}
                {isActive && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [history, setHistory] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0]);
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email || "");
      setUserId(user.id);
      const [histData, subData] = await Promise.all([
        fetchHistory(user.id).catch(() => ({ history: [] })),
        fetchSubjects(user.id).catch(() => ({ subjects: [] })),
      ]);
      setHistory(histData.history);
      setSubjects(subData.subjects);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    function handleClick() { setAssigningTo(null); }
    if (assigningTo) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [assigningTo]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleCreateSubject() {
    if (!newSubjectName.trim() || !userId) return;
    setCreatingSubject(true);
    try {
      const s = await createSubject(userId, newSubjectName.trim(), newSubjectColor);
      setSubjects(prev => [...prev, s]);
      setNewSubjectName("");
      setShowNewSubject(false);
    } catch {}
    setCreatingSubject(false);
  }

  async function handleDeleteSubject(subjectId: string) {
    try {
      await deleteSubject(userId, subjectId);
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      setHistory(prev => prev.map(h => h.subject_id === subjectId ? { ...h, subject_id: null } : h));
      if (activeSubject === subjectId) setActiveSubject(null);
    } catch {}
  }

  async function handleAssign(resultId: string, subjectId: string | null) {
    try {
      await assignSubject(userId, resultId, subjectId);
      setHistory(prev => prev.map(h => h.id === resultId ? { ...h, subject_id: subjectId } : h));
    } catch {}
    setAssigningTo(null);
  }

  async function handleDelete(itemId: string) {
    try {
      await deleteResult(userId, itemId);
      setHistory(prev => prev.filter(h => h.id !== itemId));
    } catch {}
    setDeletingId(null);
  }

  const firstName = userEmail.split("@")[0];
  const filteredHistory = activeSubject
    ? history.filter(h => h.subject_id === activeSubject)
    : history;

  return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <nav style={{
        borderBottom: '1px solid var(--border)', padding: '0 20px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(16px)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(79,142,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#ng)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs><linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4f8ef7" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient></defs>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: 'var(--text)' }}>StudyAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{userEmail}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--text)'; (e.target as HTMLElement).style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
          >Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 80px' }}>

        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
            Hey, {firstName} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Ready to study? Upload a past paper or notes below.</p>
        </div>

        {!loading && history.length > 0 && (
          <div className="animate-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: "Sessions",  value: history.length, color: '#4f8ef7' },
              { label: "This week", value: history.filter(h => new Date(h.created_at) > new Date(Date.now() - 7*86400000)).length, color: '#34d399' },
              { label: "Subjects",  value: subjects.length, color: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ color: stat.color, fontSize: '1.5rem', fontWeight: 600, lineHeight: 1, marginBottom: 4 }}>{stat.value}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="animate-fade-up stagger-1" style={{ marginBottom: 32 }}>
          <Link href="/upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(79,142,247,0.1) 0%, rgba(167,139,250,0.1) 100%)', border: '1px solid rgba(79,142,247,0.25)', borderRadius: 16, padding: '18px 22px', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(167,139,250,0.15) 100%)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.25)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79,142,247,0.1) 0%, rgba(167,139,250,0.1) 100%)'; }}
          >
            <div>
              <p style={{ color: '#a0b8ff', fontWeight: 600, fontSize: '0.95rem', marginBottom: 3 }}>Start a new session</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Upload PDF or TXT · Past paper or notes</p>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 22, lineHeight: 1, fontWeight: 300 }}>+</span>
            </div>
          </Link>
        </div>

        {/* Subjects */}
        <div className="animate-fade-up stagger-2" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Subjects</p>
            <button onClick={() => setShowNewSubject(v => !v)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ New</button>
          </div>

          {showNewSubject && (
            <div className="animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
              <input type="text" placeholder="Subject name e.g. Wireless Computing"
                value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateSubject()}
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                autoFocus
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Color:</p>
                {SUBJECT_COLORS.map(c => (
                  <button key={c} onClick={() => setNewSubjectColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: `2px solid ${newSubjectColor === c ? '#fff' : 'transparent'}`, cursor: 'pointer', flexShrink: 0 }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCreateSubject} disabled={!newSubjectName.trim() || creatingSubject}
                  style={{ background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  {creatingSubject ? "Creating..." : "Create"}
                </button>
                <button onClick={() => setShowNewSubject(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button onClick={() => setActiveSubject(null)} style={{
              background: activeSubject === null ? 'rgba(79,142,247,0.1)' : 'var(--bg-card)',
              border: `1px solid ${activeSubject === null ? 'rgba(79,142,247,0.4)' : 'var(--border)'}`,
              borderRadius: 20, padding: '5px 14px', color: activeSubject === null ? '#a0b8ff' : 'var(--text-muted)',
              fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif"
            }}>All sessions</button>
            {subjects.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => setActiveSubject(activeSubject === s.id ? null : s.id)} style={{
                  background: activeSubject === s.id ? `${s.color}18` : 'var(--bg-card)',
                  border: `1px solid ${activeSubject === s.id ? s.color + '50' : 'var(--border)'}`,
                  borderRadius: '20px 0 0 20px', padding: '5px 12px 5px 14px',
                  color: activeSubject === s.id ? s.color : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  {s.name}
                </button>
                <button onClick={() => handleDeleteSubject(s.id)} style={{
                  background: activeSubject === s.id ? `${s.color}18` : 'var(--bg-card)',
                  border: `1px solid ${activeSubject === s.id ? s.color + '50' : 'var(--border)'}`,
                  borderLeft: 'none', borderRadius: '0 20px 20px 0', padding: '5px 10px',
                  color: 'var(--text-subtle)', fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif"
                }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--danger)'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-subtle)'}
                >✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div className="animate-fade-up stagger-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {activeSubject ? subjects.find(s => s.id === activeSubject)?.name : 'Recent sessions'}
            </p>
            {filteredHistory.length > 0 && <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>{filteredHistory.length} total</span>}
          </div>

          {loading && (
            <div style={{ display: 'flex', gap: 6, padding: '20px 0', alignItems: 'center' }}>
              {[0,1,2].map(i => (<div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />))}
            </div>
          )}

          {!loading && filteredHistory.length === 0 && (
            <div style={{ border: '1px dashed var(--border)', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 28, marginBottom: 10 }}>📚</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{activeSubject ? "No sessions in this subject yet" : "No sessions yet"}</p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', marginTop: 4 }}>{activeSubject ? "Use the ⊕ icon on any session to assign it here" : "Your study sessions will appear here"}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
            {filteredHistory.map((item, i) => (
              <div key={item.id} className={`animate-fade-up stagger-${Math.min(i + 1, 4)}`} style={{ position: 'relative' }}>
                <SessionRow
                  item={item}
                  subjects={subjects}
                  userId={userId}
                  isDeleting={deletingId === item.id}
                  isAssigning={assigningTo === item.id}
                  onAssignOpen={(id: string) => setAssigningTo(id)}
                  onAssignClose={() => setAssigningTo(null)}
                  onAssign={(subjectId: string | null) => handleAssign(item.id, subjectId)}
                  onDelete={() => setDeletingId(deletingId === item.id ? null : item.id)}
                  onDeleteConfirm={() => handleDelete(item.id)}
                  onDeleteCancel={() => setDeletingId(null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
