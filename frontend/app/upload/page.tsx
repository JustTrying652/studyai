"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { uploadFile, processFile, ProcessMode } from "@/lib/api";

const MODES = [
  { value: "answers" as ProcessMode, label: "Answer Questions", desc: "Best for past papers with questions", color: "#4f8ef7", bg: "rgba(79,142,247,0.1)" },
  { value: "notes"   as ProcessMode, label: "Generate Notes",   desc: "Best for lecture notes & content",  color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  { value: "both"    as ProcessMode, label: "Both",             desc: "Answers + revision notes",          color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
];

// Step-by-step status messages
const STEPS = [
  { key: "uploading",    color: "#4f8ef7", messages: ["Uploading your file...", "Sending to server..."] },
  { key: "extracting",   color: "#34d399", messages: ["Reading the document...", "Extracting text..."] },
  { key: "processing",   color: "#a78bfa", messages: ["AI is analysing...", "Generating response...", "Almost done..."] },
];

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ProcessMode>("both");
  const [step, setStep] = useState<"idle" | "uploading" | "extracting" | "processing" | "error">("idle");
  const [stepMsgIdx, setStepMsgIdx] = useState(0);
  const [error, setError] = useState("");
  const [isScanned, setIsScanned] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
    });
  }, []);

  // Cycle through messages within a step
  useEffect(() => {
    if (step === "idle" || step === "error") return;
    const stepDef = STEPS.find(s => s.key === step);
    if (!stepDef || stepDef.messages.length <= 1) return;
    const interval = setInterval(() => {
      setStepMsgIdx(i => (i + 1) % stepDef.messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [step]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.name.endsWith(".txt"))) {
      setFile(dropped); setIsScanned(false);
    }
  }, []);

  async function handleSubmit() {
    if (!file || !userId) return;
    setError(""); setIsScanned(false); setStepMsgIdx(0);

    try {
      setStep("uploading");
      const { file_path } = await uploadFile(file, userId);

      setStep("extracting"); setStepMsgIdx(0);
      // Small delay so user sees the extracting step
      await new Promise(r => setTimeout(r, 600));

      setStep("processing"); setStepMsgIdx(0);
      const result = await processFile(file_path, mode, userId);
      router.push(`/results?id=${result.id}`);
    } catch (err: any) {
      const msg: string = err.message || "Something went wrong.";
      if (msg.includes("SCANNED_PDF") || msg.includes("scanned")) {
        setIsScanned(true);
        setError("");
      } else {
        setError(msg);
      }
      setStep("error");
    }
  }

  const busy = step === "uploading" || step === "extracting" || step === "processing";
  const selectedMode = MODES.find(m => m.value === mode)!;
  const currentStepDef = STEPS.find(s => s.key === step);
  const currentMsg = currentStepDef ? currentStepDef.messages[stepMsgIdx % currentStepDef.messages.length] : "";

  return (
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#ug)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="ug" x1="0%" y1="0%" x2="100%" y2="100%">
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
        <button onClick={() => router.back()} style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 8,
          padding: '5px 12px', color: 'var(--text-muted)', fontSize: '0.8rem',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
        }}>← Back</button>
      </nav>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '36px 20px 80px' }}>

        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.5rem, 5vw, 1.9rem)',
            color: 'var(--text)', marginBottom: 6
          }}>New session</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Upload a past paper or notes to get started.
          </p>
        </div>

        {/* Drop zone */}
        <div className="animate-fade-up stagger-1"
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !busy && document.getElementById('file-input')?.click()}
          style={{
            border: `1.5px dashed ${dragging || file ? 'rgba(79,142,247,0.5)' : 'var(--border)'}`,
            borderRadius: 16, padding: '32px 20px', textAlign: 'center',
            background: dragging ? 'rgba(79,142,247,0.06)' : file ? 'rgba(79,142,247,0.04)' : 'var(--bg-card)',
            transition: 'all 0.2s', marginBottom: 20,
            cursor: busy ? 'default' : 'pointer'
          }}
        >
          <input type="file" accept=".pdf,.txt" id="file-input" style={{ display: 'none' }}
            onChange={(e) => { setFile(e.target.files?.[0] || null); setIsScanned(false); }} />
          {file ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
              <p style={{ color: '#a0b8ff', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{file.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB · {busy ? "Processing..." : "Tap to change"}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 10 }}>☁️</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>
                Drop file here or tap to browse
              </p>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>PDF or TXT · Max 10MB</p>
            </div>
          )}
        </div>

        {/* Scanned PDF warning */}
        {isScanned && (
          <div className="animate-fade-up" style={{
            padding: '14px 16px', borderRadius: 12, marginBottom: 16,
            background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)'
          }}>
            <p style={{ color: '#fb923c', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
              📸 Scanned PDF detected
            </p>
            <p style={{ color: '#fb923c', fontSize: '0.78rem', opacity: 0.8, lineHeight: 1.5 }}>
              This PDF contains images instead of text — it was likely scanned from a physical paper.
              Please use a PDF with selectable text, or retype the content as a TXT file.
            </p>
          </div>
        )}

        {/* Mode selector */}
        <div className="animate-fade-up stagger-2" style={{ marginBottom: 28 }}>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10
          }}>What should AI do?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MODES.map((m) => (
              <button key={m.value} onClick={() => !busy && setMode(m.value)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: mode === m.value ? m.bg : 'var(--bg-card)',
                  border: `1px solid ${mode === m.value ? m.color + '50' : 'var(--border)'}`,
                  borderRadius: 12, padding: '13px 16px',
                  cursor: busy ? 'default' : 'pointer',
                  transition: 'all 0.15s', textAlign: 'left', width: '100%',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                <div>
                  <p style={{ color: mode === m.value ? m.color : 'var(--text)', fontSize: '0.88rem', fontWeight: 500, marginBottom: 2 }}>
                    {m.label}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.desc}</p>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: `1.5px solid ${mode === m.value ? m.color : 'var(--border)'}`,
                  background: mode === m.value ? m.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                }}>
                  {mode === m.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#080b12' }} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step-by-step progress */}
        {busy && (
          <div className="animate-fade-in" style={{
            padding: '16px 18px', borderRadius: 12, marginBottom: 16,
            background: `${currentStepDef?.color}0f`,
            border: `1px solid ${currentStepDef?.color}30`
          }}>
            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              {STEPS.map((s, i) => {
                const stepIdx = STEPS.findIndex(st => st.key === step);
                const done = i < stepIdx;
                const active = s.key === step;
                return (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: done ? s.color : active ? s.color + '20' : 'var(--bg-hover)',
                      border: `1.5px solid ${done || active ? s.color : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      {done
                        ? <span style={{ color: '#080b12', fontSize: 11, fontWeight: 700 }}>✓</span>
                        : active
                          ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, animation: 'pulse-dot 1s ease infinite' }} />
                          : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--border)' }} />
                      }
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 20, height: 1.5, background: done ? s.color + '60' : 'var(--border)', borderRadius: 1, transition: 'all 0.3s' }} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Current message */}
            <p style={{ color: currentStepDef?.color, fontSize: '0.83rem', fontWeight: 500 }}>
              {currentMsg}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
              This may take 10–30 seconds depending on document length
            </p>
          </div>
        )}

        {error && (
          <div style={{
            color: 'var(--danger)', fontSize: '0.82rem', padding: '10px 14px',
            background: 'rgba(248,113,113,0.08)', borderRadius: 8,
            border: '1px solid rgba(248,113,113,0.2)', marginBottom: 16
          }}>{error}</div>
        )}

        <div className="animate-fade-up stagger-3">
          <button onClick={handleSubmit} disabled={!file || !userId || busy}
            style={{
              width: '100%',
              background: !file || !userId || busy
                ? 'var(--bg-card)'
                : `linear-gradient(135deg, ${selectedMode.color}, #a78bfa)`,
              color: !file || !userId || busy ? 'var(--text-muted)' : '#fff',
              border: `1px solid ${!file || !userId || busy ? 'var(--border)' : 'transparent'}`,
              borderRadius: 12, padding: '14px',
              fontSize: '0.92rem', fontWeight: 600,
              cursor: !file || !userId || busy ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
            }}
          >
            {busy ? currentMsg : "Process document"}
          </button>
        </div>
      </div>
    </main>
  );
}