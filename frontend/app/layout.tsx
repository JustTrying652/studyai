"use client";

import { useState, useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Set dark on first load
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  function toggle() {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }

  return (
    <html lang="en">
      <head>
        <title>StudyAI</title>
        <meta name="description" content="Upload past papers or notes and get AI-generated answers and summaries." />
      </head>
      <body style={{ position: 'relative', zIndex: 1 }}>
        <button
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '8px 12px', fontSize: '1rem',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {children}
      </body>
    </html>
  );
}