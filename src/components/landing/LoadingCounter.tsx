"use client";

import { useEffect, useState } from "react";
import type { LandingMedia } from "@/lib/landing/media";

function scatter(i: number) {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12543.633;
  const fx = a - Math.floor(a);
  const fy = b - Math.floor(b);
  return { x: 5 + fx * 82, y: 8 + fy * 74, rot: (fx - 0.5) * 12, w: 72 + fy * 70 };
}

export function LoadingCounter({ media }: { media: LandingMedia[] }) {
  const total = media.length;
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const fading = count >= total;

  useEffect(() => {
    for (const m of media) {
      const img = new Image();
      img.src = m.url;
    }
  }, [media]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(total);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= total) clearInterval(id);
    }, 110);
    return () => clearInterval(id);
  }, [total]);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [fading]);

  if (gone) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#f8f7f4",
        opacity: fading ? 0 : 1,
        transition: "opacity 650ms ease",
        pointerEvents: fading ? "none" : "auto",
        overflow: "hidden"
      }}
    >
      {media.slice(0, count).map((m, i) => {
        const p = scatter(i);
        return (
          <img
            key={m.url}
            src={m.url}
            alt=""
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.w,
              height: "auto",
              transform: `rotate(${p.rot}deg)`,
              opacity: 0.9,
              animation: "drop-in 460ms cubic-bezier(0.2,0.7,0.2,1) both",
              pointerEvents: "none"
            }}
          />
        );
      })}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "clamp(72px,13vw,176px)",
              fontWeight: 600,
              lineHeight: 1,
              color: "#1c1b19",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em"
            }}
          >
            {count}
          </div>
          <div style={{ marginTop: 14, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6f6a62" }}>
            objects of interest
          </div>
        </div>
      </div>
    </div>
  );
}
