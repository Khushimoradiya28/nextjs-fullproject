"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalLoader() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "all" : "none",
      transition: "opacity 0.35s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #1e3a5f, #2b5278)", display: "grid", placeItems: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L3 10v11h6v-6h6v6h6V10L12 3z" fill="#3fa66b" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#1e3a5f", letterSpacing: "0.08em", lineHeight: 1 }}>RUNR</p>
          <p style={{ margin: 0, fontSize: "0.52rem", color: "#3fa66b", fontWeight: 700, letterSpacing: "0.22em" }}>PROPERTIES</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fa66b", animation: "dotPulse 1.2s ease infinite", animationDelay: "0s" }} />
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fa66b", animation: "dotPulse 1.2s ease infinite", animationDelay: "0.2s" }} />
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3fa66b", animation: "dotPulse 1.2s ease infinite", animationDelay: "0.4s" }} />
      </div>
      <style>{`@keyframes dotPulse { 0%,80%,100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.2); } }`}</style>
    </div>
  );
}
