import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-animate { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hero-animate-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; opacity: 0; }
        .hero-animate-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s forwards; opacity: 0; }
        .hero-animate-4 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s forwards; opacity: 0; }
        .float { animation: float 4s ease-in-out infinite; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary:hover { border-color: rgba(79,142,247,0.5) !important; color: #a0b8ff !important; }
        .feature-card:hover { border-color: rgba(79,142,247,0.3) !important; transform: translateY(-2px); }
        .step-card:hover { border-color: rgba(79,142,247,0.25) !important; }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', position: 'relative', zIndex: 1, overflowX: 'hidden' }}>

        {/* Nav */}
        <nav style={{
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))',
              border: '1px solid rgba(79,142,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f8ef7" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: 'var(--text)' }}>StudyAI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" style={{
              color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none',
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
            }}
              className="btn-secondary"
            >Sign in</Link>
            <Link href="/login" style={{
              background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
              color: '#fff', fontSize: '0.85rem', textDecoration: 'none',
              padding: '6px 16px', borderRadius: 8, fontWeight: 600,
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
            }}
              className="btn-primary"
            >Get started</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{
          maxWidth: 860, margin: '0 auto',
          padding: 'clamp(60px, 10vw, 100px) 24px clamp(60px, 8vw, 80px)',
          textAlign: 'center'
        }}>
          {/* Badge */}
          <div className="hero-animate" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <span style={{
              background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)',
              borderRadius: 20, padding: '5px 14px', fontSize: '0.78rem',
              color: '#a0b8ff', fontWeight: 500, letterSpacing: '0.04em'
            }}>
              ✦ AI-Powered Study Assistant
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-animate-2" style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(2.4rem, 7vw, 4.2rem)',
            lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #eef0f6 30%, #a0b8ff 70%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Stop re-reading.<br />Start understanding.
          </h1>

          {/* Subtext */}
          <p className="hero-animate-3" style={{
            color: '#6b7a9e', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px',
          }}>
            Upload any past paper or study notes. StudyAI instantly generates
            answers, revision notes, and lets you ask follow-up questions —
            so you study smarter, not longer.
          </p>

          {/* CTAs */}
          <div className="hero-animate-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
              color: '#fff', textDecoration: 'none',
              padding: '14px 32px', borderRadius: 12,
              fontSize: '0.95rem', fontWeight: 700,
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 0 40px rgba(79,142,247,0.25)',
              letterSpacing: '0.01em'
            }} className="btn-primary">
              Start studying free →
            </Link>
            <a href="#how-it-works" style={{
              color: 'var(--text-muted)', textDecoration: 'none',
              padding: '14px 28px', borderRadius: 12,
              fontSize: '0.95rem', fontWeight: 500,
              border: '1px solid var(--border)',
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
            }} className="btn-secondary">
              See how it works
            </a>
          </div>

          {/* Hero visual */}
          <div className="float" style={{ marginTop: 60 }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '20px 24px', maxWidth: 520, margin: '0 auto',
              textAlign: 'left', boxShadow: '0 0 80px rgba(79,142,247,0.08)'
            }}>
              {/* Fake file header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(79,142,247,0.15)', border: '1px solid rgba(79,142,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16 }}>📄</span>
                </div>
                <div>
                  <p style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>CCS3251_WirelessComputing.pdf</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>Answers + Notes · Just now</p>
                </div>
                <span style={{
                  marginLeft: 'auto', background: 'rgba(52,211,153,0.1)', color: '#34d399',
                  fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20
                }}>✓ Done</span>
              </div>
              {/* Fake content lines */}
              {[
                { w: '100%', color: 'rgba(79,142,247,0.6)', h: 10 },
                { w: '88%', color: 'rgba(255,255,255,0.08)', h: 8 },
                { w: '94%', color: 'rgba(255,255,255,0.08)', h: 8 },
                { w: '72%', color: 'rgba(255,255,255,0.08)', h: 8 },
              ].map((line, i) => (
                <div key={i} style={{ height: line.h, borderRadius: 4, background: line.color, width: line.w, marginBottom: 10 }} />
              ))}
              {/* Fake chat bubble */}
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 10 }}>
                <p style={{ color: '#a0b8ff', fontSize: '0.75rem', marginBottom: 6 }}>💬 "Explain question 3 in simpler terms"</p>
                <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,0.06)', width: '90%', marginBottom: 6 }} />
                <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,0.06)', width: '75%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          padding: '28px 24px'
        }}>
          <div style={{
            maxWidth: 700, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center'
          }}>
            {[
              { value: "10s", label: "Average processing time" },
              { value: "3", label: "Modes — Answers, Notes, Both" },
              { value: "100%", label: "Free to get started" },
            ].map(stat => (
              <div key={stat.label}>
                <p style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                  background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', marginBottom: 4
                }}>{stat.value}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(60px, 8vw, 90px) 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: '#4f8ef7', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              HOW IT WORKS
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--text)', lineHeight: 1.2 }}>
              Three steps to study smarter
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { step: "01", icon: "☁️", title: "Upload your document", desc: "Drop in any PDF or text file — past papers, lecture notes, textbook chapters." },
              { step: "02", icon: "⚡", title: "AI processes it instantly", desc: "Choose answers, notes, or both. Our AI reads the document and generates study content in seconds." },
              { step: "03", icon: "💬", title: "Ask follow-up questions", desc: "Not clear on something? Chat directly with the document to get deeper explanations." },
            ].map(item => (
              <div key={item.step} className="step-card" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px 22px', transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <span style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>{item.step}</span>
                </div>
                <h3 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(79,142,247,0.03) 50%, transparent 100%)',
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          padding: 'clamp(60px, 8vw, 90px) 24px'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                FEATURES
              </p>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--text)', lineHeight: 1.2 }}>
                Everything you need to revise
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                { icon: "📝", title: "Instant Answers", desc: "Upload a past paper and get model answers for every question immediately.", color: "#4f8ef7", bg: "rgba(79,142,247,0.08)" },
                { icon: "📚", title: "Smart Notes", desc: "Transforms dense lecture notes into clean, scannable revision summaries.", color: "#34d399", bg: "rgba(52,211,153,0.08)" },
                { icon: "💬", title: "Document Chat", desc: "Ask any question about your document and get instant, contextual answers.", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
                { icon: "🖨️", title: "Print & Export", desc: "Print your generated notes or copy them anywhere in one click.", color: "#fb923c", bg: "rgba(251,146,60,0.08)" },
                { icon: "📱", title: "Works on Mobile", desc: "Study from your phone or tablet — fully responsive on any screen size.", color: "#f87171", bg: "rgba(248,113,113,0.08)" },
                { icon: "🔒", title: "Private & Secure", desc: "Your documents and sessions are private — only you can see them.", color: "#facc15", bg: "rgba(250,204,21,0.08)" },
              ].map(f => (
                <div key={f.title} className="feature-card" style={{
                  background: f.bg, border: `1px solid ${f.color}20`,
                  borderRadius: 14, padding: '20px 18px', transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: 22, display: 'block', marginBottom: 12 }}>{f.icon}</span>
                  <h3 style={{ color: f.color, fontSize: '0.88rem', fontWeight: 600, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(70px, 10vw, 100px) 24px', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.15, marginBottom: 20,
            background: 'linear-gradient(135deg, #eef0f6 30%, #a0b8ff 70%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>
            Ready to study smarter?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 36, lineHeight: 1.6 }}>
            Join students who are already using StudyAI to ace their exams.
            Free to use, no credit card required.
          </p>
          <Link href="/login" style={{
            background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
            color: '#fff', textDecoration: 'none',
            padding: '16px 40px', borderRadius: 12,
            fontSize: '1rem', fontWeight: 700,
            transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 0 60px rgba(79,142,247,0.3)',
            display: 'inline-block', letterSpacing: '0.01em'
          }} className="btn-primary">
            Create free account →
          </Link>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))',
              border: '1px solid rgba(79,142,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: 9, color: '#4f8ef7', fontWeight: 700 }}>S</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, color: 'var(--text-muted)' }}>StudyAI</span>
          </div>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>
            Built for students, by a student.
          </p>
          <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textDecoration: 'none' }}>
            Sign  →
          </Link>
        </footer>

      </main>
    </>
  );
}
