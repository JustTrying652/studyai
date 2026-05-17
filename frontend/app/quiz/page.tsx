"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Question {
  type: "mcq" | "short";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

function QuizContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; given: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    const stored = sessionStorage.getItem(`quiz_${id}`);
    if (!stored) { router.push(`/results?id=${id}`); return; }
    setQuestions(JSON.parse(stored));
  }, [id]);

  if (!questions.length) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f8ef7', animation: 'pulse-dot 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </main>
  );

  const q = questions[current];
  const isLast = current === questions.length - 1;

  function checkAnswer() {
    if (!revealed) {
      const given = q.type === "mcq" ? selected : shortAnswer;
      let correct = false;
      if (q.type === "mcq") {
        correct = selected === q.answer;
      } else {
        // For short answer — just reveal and let student self-assess
        correct = false; // will be set by self-assess buttons
      }
      if (q.type === "mcq") {
        if (correct) setScore(s => s + 1);
        setAnswers(a => [...a, { correct, given }]);
      }
      setRevealed(true);
    }
  }

  function selfAssess(correct: boolean) {
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, { correct, given: shortAnswer }]);
    next();
  }

  function next() {
    if (isLast) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected("");
      setShortAnswer("");
      setRevealed(false);
    }
  }

  const scorePercent = Math.round((score / questions.length) * 100);
  const scoreColor = scorePercent >= 70 ? '#34d399' : scorePercent >= 50 ? '#fb923c' : '#f87171';

  if (done) return (
    <main style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <nav style={{
        borderBottom: '1px solid var(--border)', padding: '0 20px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(79,142,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#4f8ef7', fontSize: 12, fontWeight: 700 }}>S</span>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16 }}>StudyAI</span>
        </div>
        <Link href={`/results?id=${id}`} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', fontFamily: "'DM Sans', sans-serif" }}>
          ← Back to results
        </Link>
      </nav>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        {/* Score circle */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
          background: `conic-gradient(${scoreColor} ${scorePercent}%, var(--bg-card) 0%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: scoreColor, fontSize: '1.4rem', fontWeight: 700 }}>{score}/{questions.length}</span>
          </div>
        </div>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: 8 }}>
          {scorePercent >= 70 ? "Great work! 🎉" : scorePercent >= 50 ? "Good effort! 💪" : "Keep studying! 📚"}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 36 }}>
          You scored {scorePercent}% — {score} out of {questions.length} questions correct.
        </p>

        {/* Answer review */}
        <div style={{ textAlign: 'left', marginBottom: 36 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Review
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: `1px solid ${answers[i]?.correct ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                borderRadius: 12, padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{answers[i]?.correct ? '✅' : '❌'}</span>
                  <p style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>{q.question}</p>
                </div>
                <p style={{ color: '#34d399', fontSize: '0.78rem', marginBottom: 4 }}>
                  ✓ {q.answer}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{q.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setCurrent(0); setSelected(""); setShortAnswer(""); setRevealed(false); setScore(0); setDone(false); setAnswers([]); }}
            style={{
              background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '12px 24px', fontSize: '0.88rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
            }}>
            Retake quiz
          </button>
          <Link href={`/results?id=${id}`} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', borderRadius: 10,
            padding: '12px 24px', fontSize: '0.88rem', textDecoration: 'none',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            Back to results
          </Link>
        </div>
      </div>
    </main>
  );

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
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.2))', border: '1px solid rgba(79,142,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#4f8ef7', fontSize: 12, fontWeight: 700 }}>S</span>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16 }}>StudyAI</span>
        </div>
        <Link href={`/results?id=${id}`} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', fontFamily: "'DM Sans', sans-serif" }}>
          ← Exit quiz
        </Link>
      </nav>

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Question {current + 1} of {questions.length}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Score: {score}
            </p>
          </div>
          <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, transition: 'width 0.3s ease',
              width: `${((current) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #4f8ef7, #a78bfa)'
            }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '28px 24px', marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              background: q.type === 'mcq' ? 'rgba(79,142,247,0.1)' : 'rgba(167,139,250,0.1)',
              color: q.type === 'mcq' ? '#4f8ef7' : '#a78bfa',
              fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px',
              borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase'
            }}>
              {q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
            </span>
          </div>

          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
            color: 'var(--text)', lineHeight: 1.4, marginBottom: 24
          }}>
            {q.question}
          </h2>

          {/* MCQ options */}
          {q.type === 'mcq' && q.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt) => {
                let bg = 'var(--bg)';
                let border = 'var(--border)';
                let color = 'var(--text)';
                if (revealed) {
                  if (opt === q.answer) { bg = 'rgba(52,211,153,0.1)'; border = 'rgba(52,211,153,0.4)'; color = '#34d399'; }
                  else if (opt === selected && opt !== q.answer) { bg = 'rgba(248,113,113,0.1)'; border = 'rgba(248,113,113,0.4)'; color = '#f87171'; }
                } else if (opt === selected) {
                  bg = 'rgba(79,142,247,0.1)'; border = 'rgba(79,142,247,0.4)'; color = '#a0b8ff';
                }
                return (
                  <button key={opt} onClick={() => !revealed && setSelected(opt)}
                    style={{
                      background: bg, border: `1px solid ${border}`,
                      borderRadius: 10, padding: '12px 16px', textAlign: 'left',
                      color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer',
                      transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Short answer input */}
          {q.type === 'short' && (
            <textarea
              placeholder="Type your answer here..."
              value={shortAnswer}
              onChange={e => !revealed && setShortAnswer(e.target.value)}
              disabled={revealed}
              rows={3}
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 16px', color: 'var(--text)',
                fontSize: '0.88rem', outline: 'none', resize: 'none',
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
                opacity: revealed ? 0.7 : 1
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          )}
        </div>

        {/* Explanation after reveal */}
        {revealed && (
          <div style={{
            background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 16
          }}>
            <p style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
              ✓ Correct answer: {q.answer}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>{q.explanation}</p>
          </div>
        )}

        {/* Short answer self-assess */}
        {revealed && q.type === 'short' && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 10 }}>
              Did you get it right?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => selfAssess(true)} style={{
                flex: 1, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
                borderRadius: 10, padding: '10px', color: '#34d399', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>✓ Yes, I got it</button>
              <button onClick={() => selfAssess(false)} style={{
                flex: 1, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 10, padding: '10px', color: '#f87171', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>✗ Not quite</button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!revealed ? (
            <button onClick={checkAnswer}
              disabled={q.type === 'mcq' ? !selected : !shortAnswer.trim()}
              style={{
                flex: 1,
                background: (q.type === 'mcq' ? !selected : !shortAnswer.trim())
                  ? 'var(--bg-card)'
                  : 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
                border: `1px solid ${(q.type === 'mcq' ? !selected : !shortAnswer.trim()) ? 'var(--border)' : 'transparent'}`,
                borderRadius: 10, padding: '13px',
                color: (q.type === 'mcq' ? !selected : !shortAnswer.trim()) ? 'var(--text-muted)' : '#fff',
                fontSize: '0.9rem', fontWeight: 600,
                cursor: (q.type === 'mcq' ? !selected : !shortAnswer.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
              }}>
              Check answer
            </button>
          ) : q.type === 'mcq' ? (
            <button onClick={next} style={{
              flex: 1, background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
              border: 'none', borderRadius: 10, padding: '13px',
              color: '#fff', fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
            }}>
              {isLast ? "See results →" : "Next question →"}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f8ef7', animation: 'pulse-dot 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </main>
    }>
      <QuizContent />
    </Suspense>
  );
}