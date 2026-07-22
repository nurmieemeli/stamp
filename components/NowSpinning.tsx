"use client";

import { useState } from "react";

const BAR_HEIGHTS = [5, 11, 4, 14, 8, 12, 6];

export function NowSpinning({ trackTitle }: { trackTitle: string }) {
  const [playing, setPlaying] = useState(false);

  if (!trackTitle) return null;

  return (
    <section className="spinning" aria-label="Now playing">
      <button
        type="button"
        className="play-toggle"
        aria-pressed={playing}
        aria-label={playing ? "Pause preview" : `Play preview of ${trackTitle}`}
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="track-info">
        <p className="track-title">{trackTitle}</p>
      </div>
      <div className={`bars${playing ? " is-playing" : ""}`} aria-hidden="true">
        {BAR_HEIGHTS.map((h, i) => (
          <span key={i} style={{ "--h": `${h}px`, "--d": `${i * 90}ms` } as React.CSSProperties} />
        ))}
      </div>
      <span className="state">{playing ? "playing" : "paused"}</span>
    </section>
  );
}
