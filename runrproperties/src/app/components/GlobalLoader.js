"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ANIMATION_DURATION = 4500;

export default function GlobalLoader() {
  const [visible, setVisible] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setVisible(true);
    setAnimKey((k) => k + 1);
    const timer = setTimeout(() => setVisible(false), ANIMATION_DURATION);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#fbfcfd",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "all" : "none",
      transition: "opacity 0.4s ease",
    }}>
      <div key={animKey} style={{ position: "relative", width: "280px", height: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Soft glow behind logo - present throughout */}
        <div style={{
          position: "absolute",
          width: "100px", height: "100px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,123,189,0.1) 0%, transparent 70%)",
          animation: "breatheGlow 2s ease-in-out infinite",
          zIndex: 0,
        }} />

        {/* Logo - always visible, the hero of the animation */}
        <img
          src="/logo/runr-logo.svg"
          alt="Runr Properties"
          style={{
            height: "44px",
            width: "auto",
            position: "relative",
            zIndex: 3,
            animation: "logoLife 4.5s ease forwards",
          }}
        />

        {/* Blueprint lines emerging from logo center, growing into house */}
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1,
        }}>
          {/* Radiating lines from center - emerge 0.5s to 1.2s */}
          <line x1="140" y1="140" x2="140" y2="200" stroke="#1e3a5f" strokeWidth="0.6" strokeLinecap="round" style={{
            strokeDasharray: 60,
            strokeDashoffset: 60,
            animation: "drawLine 0.7s ease 0.5s forwards",
            opacity: 0.4,
          }} />
          <line x1="140" y1="140" x2="95" y2="200" stroke="#1e3a5f" strokeWidth="0.5" strokeLinecap="round" style={{
            strokeDasharray: 75,
            strokeDashoffset: 75,
            animation: "drawLine 0.7s ease 0.6s forwards",
            opacity: 0.3,
          }} />
          <line x1="140" y1="140" x2="185" y2="200" stroke="#1e3a5f" strokeWidth="0.5" strokeLinecap="round" style={{
            strokeDasharray: 75,
            strokeDashoffset: 75,
            animation: "drawLine 0.7s ease 0.6s forwards",
            opacity: 0.3,
          }} />

          {/* House blueprint - draws 1.2s to 2.6s */}
          {/* Foundation */}
          <path d="M80 230 L200 230" stroke="#1e3a5f" strokeWidth="1.2" strokeLinecap="round" style={{
            strokeDasharray: 120,
            strokeDashoffset: 120,
            animation: "drawLine 0.5s ease 1.2s forwards",
            opacity: 0.5,
          }} />
          {/* Walls */}
          <path d="M92 230 L92 185 L188 185 L188 230" stroke="#1e3a5f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{
            strokeDasharray: 190,
            strokeDashoffset: 190,
            animation: "drawLine 0.8s ease 1.5s forwards",
            opacity: 0.6,
          }} />
          {/* Roof */}
          <path d="M85 185 L140 158 L195 185" stroke="#1e3a5f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{
            strokeDasharray: 130,
            strokeDashoffset: 130,
            animation: "drawLine 0.6s ease 2.0s forwards",
            opacity: 0.7,
          }} />
          {/* Door */}
          <rect x="128" y="206" width="16" height="24" rx="2" stroke="#1e3a5f" strokeWidth="1" style={{
            strokeDasharray: 80,
            strokeDashoffset: 80,
            animation: "drawLine 0.4s ease 2.3s forwards",
            opacity: 0.5,
          }} />
          {/* Windows */}
          <rect x="98" y="194" width="14" height="14" rx="2" stroke="#3fa66b" strokeWidth="1" fill="none" style={{
            strokeDasharray: 56,
            strokeDashoffset: 56,
            animation: "drawLine 0.4s ease 2.4s forwards",
            opacity: 0.5,
          }} />
          <rect x="168" y="194" width="14" height="14" rx="2" stroke="#3fa66b" strokeWidth="1" fill="none" style={{
            strokeDasharray: 56,
            strokeDashoffset: 56,
            animation: "drawLine 0.4s ease 2.5s forwards",
            opacity: 0.5,
          }} />
          {/* Window glow fills */}
          <rect x="98" y="194" width="14" height="14" rx="2" fill="#3fa66b" style={{
            opacity: 0,
            animation: "windowGlow 0.6s ease 2.7s forwards",
          }} />
          <rect x="168" y="194" width="14" height="14" rx="2" fill="#3fa66b" style={{
            opacity: 0,
            animation: "windowGlow 0.6s ease 2.8s forwards",
          }} />

          {/* House morphs back (fades) while logo stays - 3.2s to 3.8s */}
          <rect x="80" y="155" width="140" height="80" fill="#fbfcfd" style={{
            opacity: 0,
            animation: "houseFade 0.6s ease 3.2s forwards",
          }} />
        </svg>

        {/* Golden light sweep across logo - 3.5s */}
        <div style={{
          position: "absolute",
          width: "160px", height: "60px",
          background: "linear-gradient(105deg, transparent 25%, rgba(212,175,55,0.2) 48%, rgba(255,255,255,0.4) 52%, transparent 75%)",
          backgroundSize: "300% 100%",
          backgroundPosition: "200% 0",
          animation: "goldSweep 0.7s ease 3.5s forwards",
          borderRadius: "8px",
          pointerEvents: "none",
          zIndex: 4,
        }} />
      </div>

      {/* Text - appears at 3.4s */}
      <p style={{
        margin: "16px 0 0",
        fontSize: "0.88rem",
        fontWeight: 500,
        color: "#5a6f85",
        letterSpacing: "0.03em",
        opacity: 0,
        animation: "textFade 0.6s ease 3.4s forwards",
      }}>
        Finding Your Perfect Property...
      </p>

      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes breatheGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes logoLife {
          0% { opacity: 0; transform: scale(0.88); }
          8% { opacity: 1; transform: scale(1); }
          70% { opacity: 1; transform: scale(1); }
          75% { opacity: 1; transform: scale(0.95); }
          82% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes windowGlow {
          to { opacity: 0.15; }
        }
        @keyframes houseFade {
          to { opacity: 1; }
        }
        @keyframes goldSweep {
          from { background-position: 200% 0; }
          to { background-position: -100% 0; }
        }
        @keyframes textFade {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
