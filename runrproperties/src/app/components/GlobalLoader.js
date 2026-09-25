"use client";

import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on the very first initial website entrance of the session
    const hasLoaded = sessionStorage.getItem("runr_app_loaded");
    if (!hasLoaded) {
      setVisible(true);
      sessionStorage.setItem("runr_app_loaded", "true");
      const timer = setTimeout(() => {
        setVisible(false);
      }, 600); // 600ms crisp initial welcome, never blocks route navigation
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="loaderWrapper"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.3s ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        {/* Scene */}
        <div className="scene" style={{ position: "relative" }}>
          <svg
            className="citySvg"
            viewBox="0 0 300 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: "300px",
              height: "180px",
              filter: "drop-shadow(0 8px 24px rgba(0,123,189,0.15))",
            }}
          >
            {/* Building 1 - Left tall */}
            <rect className="b1" x="30" y="60" width="50" height="110" rx="3" stroke="#007bbd" strokeWidth="2.5" fill="#e6f4fb" />
            <rect x="40" y="75" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="58" y="75" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="40" y="95" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="58" y="95" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="40" y="115" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="58" y="115" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />

            {/* Building 2 - Center tallest */}
            <rect className="b2" x="100" y="20" width="65" height="150" rx="3" stroke="#007bbd" strokeWidth="2.5" fill="#cce9f6" />
            <rect x="112" y="35" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            <rect x="132" y="35" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            <rect x="112" y="58" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            <rect x="132" y="58" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            <rect x="112" y="81" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            <rect x="132" y="81" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            <rect x="112" y="104" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            <rect x="132" y="104" width="12" height="12" rx="1" fill="#007bbd" opacity="0.6" className="win" />
            {/* Antenna */}
            <line x1="132" y1="20" x2="132" y2="5" stroke="#007bbd" strokeWidth="2" strokeLinecap="round" className="antenna" />
            <circle cx="132" cy="4" r="2.5" fill="#007bbd" className="antennaDot" />

            {/* Building 3 - Right medium */}
            <rect className="b3" x="185" y="50" width="55" height="120" rx="3" stroke="#007bbd" strokeWidth="2.5" fill="#e6f4fb" />
            <rect x="196" y="65" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="214" y="65" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="196" y="85" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="214" y="85" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="196" y="105" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />
            <rect x="214" y="105" width="10" height="10" rx="1" fill="#007bbd" opacity="0.5" className="win" />

            {/* Building 4 - Far right small */}
            <rect className="b4" x="255" y="90" width="35" height="80" rx="3" stroke="#007bbd" strokeWidth="2" fill="#e6f4fb" opacity="0.7" />

            {/* Ground / Road */}
            <line x1="10" y1="170" x2="290" y2="170" stroke="#007bbd" strokeWidth="2" strokeLinecap="round" />

            {/* Moving car */}
            <g className="car">
              <rect x="0" y="158" width="28" height="12" rx="3" fill="#007bbd" />
              <rect x="5" y="153" width="18" height="8" rx="2" fill="#005f94" />
              <circle cx="6" cy="171" r="4" fill="#003a5c" />
              <circle cx="22" cy="171" r="4" fill="#003a5c" />
              <rect x="8" y="155" width="5" height="5" rx="1" fill="#cce9f6" opacity="0.8" />
              <rect x="15" y="155" width="5" height="5" rx="1" fill="#cce9f6" opacity="0.8" />
            </g>

            {/* Crane */}
            <g className="crane">
              <line x1="155" y1="20" x2="155" y2="0" stroke="#007bbd" strokeWidth="2" />
              <line x1="155" y1="2" x2="195" y2="2" stroke="#007bbd" strokeWidth="2" />
              <line x1="195" y1="2" x2="195" y2="15" stroke="#007bbd" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>
          </svg>
        </div>

        {/* Logo */}
        <img src="/logo/runr-logo-new.svg" alt="runr properties" style={{ height: "36px", width: "auto", marginTop: "-4px" }} />

        {/* Progress bar */}
        <div className="progressTrack" style={{
          width: "200px", height: "3px", background: "#e6f4fb", borderRadius: "99px", overflow: "hidden",
        }}>
          <div className="progressBar" style={{
            height: "100%", background: "#007bbd", borderRadius: "99px",
          }} />
        </div>
      </div>

      <style>{`
        .b1 { animation: riseUp 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; transform-origin: bottom; transform-box: fill-box; }
        .b2 { animation: riseUp 0.5s cubic-bezier(0.34,1.56,0.64,1) 0s both; transform-origin: bottom; transform-box: fill-box; }
        .b3 { animation: riseUp 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; transform-origin: bottom; transform-box: fill-box; }
        .b4 { animation: riseUp 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both; transform-origin: bottom; transform-box: fill-box; }

        @keyframes riseUp {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }

        .win { animation: winGlow 1.2s ease-in-out infinite alternate; }
        @keyframes winGlow { from { opacity: 0.2; } to { opacity: 0.8; } }

        .antennaDot { animation: blink 0.8s ease-in-out infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; fill: #007bbd; } 50% { opacity: 0.3; fill: #ff4444; } }

        .car { animation: driveCar 2s linear infinite; }
        @keyframes driveCar { from { transform: translateX(-40px); } to { transform: translateX(320px); } }

        .crane { animation: sway 1.5s ease-in-out infinite alternate; transform-origin: 155px 20px; }
        @keyframes sway { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }

        .progressBar { animation: progress 1.5s ease-in-out infinite; }
        @keyframes progress {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
