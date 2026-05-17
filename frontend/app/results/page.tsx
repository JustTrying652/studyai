"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase";
import { fetchResult, deleteResult, sendChatMessage, ChatMessage } from "@/lib/api";

const MODE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  answers: { label: "Answers",         color: "#4f8ef7", bg: "rgba(79,142,247,0.12)" },
  notes:   { label: "Notes",           color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  both:    { label: "Answers + Notes", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userId, setUserId] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      fetchResult(user.id, id)
        .then(setResult)
        .catch(() => setResult(null))
        .finally(() => setLoading(false));
    });
  }, [id]);

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() { window.print(); }

  async function handleDelete() {
    if (!userId || !id) return;
    setDeleting(true);
    try {
      await deleteResult(userId, id);
      router.push("/dashboard");
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function sendMessage() {
    if (!chatInput.trim() || !userId || !id || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatError("");
    const newHistory: ChatMessage[] = [...chatMessages, { role: "user", content: userMessage }];
    setChatMessages(newHistory);
    setChatLoading(true);
    try {
      const { reply } = await sendChatMessage(userId, id, userMessage, chatMessages);
      setChatMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setChatError(err.message || "Failed to get response.");
      setChatMessages(newHistory);
    } finally {
      setChatLoading(false);
    }
  }

  const modeConf = result ? (MODE_CONFIG[result.mode] || MODE_CONFIG.both) : null;

  return (
    <>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .study-prose { color: black !important; }
          .study-prose p, .study-prose li { color: #222 !important; }
          .study-prose h1, .study-prose h2, .study-prose h3 { color: black !important; font-family: Georgia, serif !important; }
          .study-prose code { background: #f5f5f5 !important; color: #333 !important; border: 1px solid #ddd !important; }
          .print-header { display: block !important; margin-bottom: 24px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
        }
        .print-header { display: none; }
      `}</style>

      <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <nav style={{
          borderBottom: '1px solid var(--border)', padding: '0 20px', height: 54,
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#rg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f8ef7" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: 'var(--text)' }}>StudyAI</span>
          </div>
          <Link href="/dashboard" style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '5px 12px', color: 'var(--text-muted)', fontSize: '0.8rem',
            textDecoration: 'none', fontFamily: "'DM Sans', sans-serif"
          }}>← Dashboard</Link>
        </nav>

        <div style={{ maxWidth: 740, margin: '0 auto', padding: '36px 20px 80px' }}>

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

          {!loading && !result && (
            <p style={{ color: 'var(--text-muted)' }}>Result not found.</p>
          )}

          {result && modeConf && (
            <div className="animate-fade-up">

              {/* Print header */}
              <div className="print-header">
                <h2 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{result.file_name.replace(/\.[^.]+$/, '')}</h2>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                  {modeConf.label} · {new Date(result.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Generated by StudyAI
                </p>
              </div>

              {/* Result header */}
              <div style={{ marginBottom: 28, paddingBottom: 22, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    background: modeConf.bg, color: modeConf.color,
                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                    borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase'
                  }}>{modeConf.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(result.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <h1 style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
                    color: 'var(--text)', lineHeight: 1.3, flex: 1
                  }}>
                    {result.file_name.replace(/\.[^.]+$/, '')}
                  </h1>

                  <div className="no-print" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={handleCopy} style={{
                      background: copied ? 'rgba(52,211,153,0.1)' : 'var(--bg-card)',
                      border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '7px 12px',
                      color: copied ? '#34d399' : 'var(--text-muted)', fontSize: '0.78rem',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
                    }}>{copied ? "✓ Copied" : "Copy"}</button>

                    <button onClick={handlePrint} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '7px 12px', color: 'var(--text-muted)',
                      fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                    }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--text)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
                    >Print</button>

                    <button onClick={() => setShowDeleteConfirm(true)} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '7px 12px', color: 'var(--text-muted)',
                      fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                    }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--danger)'; (e.target as HTMLElement).style.borderColor = 'rgba(248,113,113,0.3)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
                    >Delete</button>
                  </div>
                </div>
              </div>

              {/* Delete confirm */}
              {showDeleteConfirm && (
                <div className="animate-fade-in no-print" style={{
                  padding: '16px 18px', borderRadius: 12, marginBottom: 24,
                  background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)'
                }}>
                  <p style={{ color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 500, marginBottom: 12 }}>
                    Delete this session? This cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleDelete} disabled={deleting} style={{
                      background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
                      borderRadius: 8, padding: '7px 16px', color: 'var(--danger)',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                    }}>{deleting ? "Deleting..." : "Yes, delete"}</button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '7px 16px', color: 'var(--text-muted)',
                      fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                    }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* AI result */}
              <div className="study-prose">
                <ReactMarkdown>{result.result}</ReactMarkdown>
              </div>

              {/* ── Chat section ── */}
              <div style={{ marginTop: 48, borderTop: '1px solid var(--border)', paddingTop: 32 }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: 'var(--text)', marginBottom: 3 }}>
                      Ask a question
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Ask anything about this document
                    </p>
                  </div>
                  {chatMessages.length > 0 && (
                    <button onClick={() => setChatMessages([])} style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                      padding: '5px 12px', color: 'var(--text-muted)', fontSize: '0.75rem',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                    }}>Clear</button>
                  )}
                </div>

                {/* Suggestion chips */}
                {chatMessages.length === 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {["Summarise the key points", "Explain in simpler terms", "What are the most important concepts?", "Give me a memory trick"].map(s => (
                      <button key={s} onClick={() => setChatInput(s)} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 20, padding: '5px 13px', color: 'var(--text-muted)',
                        fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
                        fontFamily: "'DM Sans', sans-serif"
                      }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
                      >{s}</button>
                    ))}
                  </div>
                )}

                {/* Scrollable message window */}
                {chatMessages.length > 0 && (
                  <div style={{
                    height: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column',
                    gap: 10, marginBottom: 12, padding: '16px',
                    background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)',
                  }}
                    ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
                  >
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%', padding: '10px 14px', lineHeight: 1.6, fontSize: '0.86rem',
                          borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: msg.role === 'user' ? 'linear-gradient(135deg, #4f8ef7, #a78bfa)' : 'var(--bg-hover)',
                          border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                          color: msg.role === 'user' ? '#fff' : 'var(--text)',
                        }}>
                          {msg.role === 'assistant' ? (
                            <div className="study-prose" style={{ fontSize: '0.86rem' }}>
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : msg.content}
                        </div>
                      </div>
                    ))}

                    {chatLoading && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                          padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
                          background: 'var(--bg-hover)', border: '1px solid var(--border)',
                          display: 'flex', gap: 5, alignItems: 'center'
                        }}>
                          {[0,1,2].map(i => (
                            <div key={i} style={{
                              width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                              animation: 'pulse-dot 1.2s ease infinite', animationDelay: `${i * 0.2}s`
                            }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {chatError && (
                  <p style={{
                    color: 'var(--danger)', fontSize: '0.8rem', marginBottom: 10,
                    padding: '8px 12px', background: 'rgba(248,113,113,0.08)',
                    borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)'
                  }}>{chatError}</p>
                )}

                {/* Input row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ask a question about this document..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    disabled={chatLoading}
                    style={{
                      flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '11px 16px', color: 'var(--text)',
                      fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.2s',
                      fontFamily: "'DM Sans', sans-serif", opacity: chatLoading ? 0.6 : 1
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button onClick={sendMessage} disabled={!chatInput.trim() || chatLoading}
                    style={{
                      background: !chatInput.trim() || chatLoading ? 'var(--bg-card)' : 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
                      border: `1px solid ${!chatInput.trim() || chatLoading ? 'var(--border)' : 'transparent'}`,
                      borderRadius: 10, padding: '11px 18px',
                      color: !chatInput.trim() || chatLoading ? 'var(--text-muted)' : '#fff',
                      fontSize: '0.88rem', fontWeight: 600,
                      cursor: !chatInput.trim() || chatLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap'
                    }}
                  >{chatLoading ? '...' : 'Ask →'}</button>
                </div>

              </div>
              {/* ── End chat section ── */}

            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4f8ef7',
              animation: 'pulse-dot 1.2s ease infinite', animationDelay: `${i * 0.2}s`
            }} />
          ))}
        </div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
