"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(""); setLoading(true);
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard"); router.refresh();
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', position: 'relative', zIndex: 1
    }}>

      {/* Card */}
      <div className="animate-fade-up" style={{
        width: '100%', maxWidth: 400,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: '36px 32px',
        boxShadow: '0 0 60px rgba(79,142,247,0.06)'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Logo mark */}
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(79,142,247,0.2) 0%, rgba(167,139,250,0.2) 100%)',
            border: '1px solid rgba(79,142,247,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Book icon made with divs */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f8ef7" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <line x1="9" y1="7" x2="15" y2="7" />
              <line x1="9" y1="11" x2="15" y2="11" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '1.7rem', color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.01em'
          }}>StudyAI</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {isSignUp
              ? "Create an account to start studying smarter"
              : "Your AI-powered revision companion"}
          </p>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px', background: 'var(--border)',
          margin: '0 0 24px'
        }} />

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em' }}>
              EMAIL
            </label>
            <input
              type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
                fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                fontFamily: "'DM Sans', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em' }}>
              PASSWORD
            </label>
            <input
              type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
                fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                fontFamily: "'DM Sans', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              color: 'var(--danger)', fontSize: '0.82rem',
              padding: '10px 14px', background: 'rgba(248,113,113,0.08)',
              borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)'
            }}>{error}</div>
          )}

          <button onClick={handleSubmit} disabled={loading || !email || !password}
            style={{
              marginTop: 4,
              background: loading || !email || !password
                ? 'var(--bg-hover)'
                : 'linear-gradient(135deg, #4f8ef7 0%, #a78bfa 100%)',
              color: loading || !email || !password ? 'var(--text-muted)' : '#fff',
              border: 'none', borderRadius: 10, padding: '13px',
              fontSize: '0.92rem', fontWeight: 600,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s', fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.01em'
            }}
          >
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: 20 }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            style={{
              color: 'var(--accent)', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '0.83rem', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500
            }}>
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>

      {/* Bottom tagline */}
      <p className="animate-fade-up stagger-2" style={{
        color: 'var(--text-subtle)', fontSize: '0.78rem',
        marginTop: 24, textAlign: 'center'
      }}>
        Upload past papers · Get AI answers · Study smarter
      </p>
    </main>
  );
}
