"use client";

import { useState } from "react";

const BAR_HEIGHTS = [9, 16, 6, 20, 11, 18, 8];

export function NowSpinning({ trackTitle }: { trackTitle: string }) {
  const [playing, setPlaying] = useState(false);

  if (!trackTitle) return null;

  return (
    <section className="spinning" aria-label="Now playing">
      <button
        type="button"
        className={`play-toggle${playing ? " is-playing" : ""}`}
        aria-pressed={playing}
        aria-label={playing ? "Pause preview" : `Play preview of ${trackTitle}`}
        onClick={() => setPlaying((p) => !p)}
      >
        <span className="play-icon" />
      </button>
      <div className="track-info">
        <p className="track-label">Now spinning</p>
        <p className="track-title">{trackTitle}</p>
      </div>
      <div className={`bars${playing ? " is-playing" : ""}`} aria-hidden="true">
        {BAR_HEIGHTS.map((h, i) => (
          <span key={i} style={{ "--h": `${h}px`, "--d": `${i * 90}ms` } as React.CSSProperties} />
        ))}
      </div>
    </section>
  );
}
