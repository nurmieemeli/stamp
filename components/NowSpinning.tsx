"use client";

import { useRef, useState } from "react";

const BAR_HEIGHTS = [5, 11, 4, 14, 8, 12, 6];

export function NowSpinning({
  trackTitle,
  trackArtist,
  trackPreviewUrl,
  trackArtworkUrl,
  trackUrl,
}: {
  trackTitle: string;
  trackArtist: string;
  trackPreviewUrl: string;
  trackArtworkUrl: string;
  trackUrl: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!trackTitle) return null;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
  }

  return (
    <section className="spinning" aria-label="Now playing">
      {trackPreviewUrl ? (
        <audio
          ref={audioRef}
          src={trackPreviewUrl}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      ) : null}
      {trackArtworkUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- small external thumbnail, not worth next/image's config
        <img className="spinning-art" src={trackArtworkUrl} alt="" />
      ) : null}
      <button
        type="button"
        className="play-toggle"
        aria-pressed={playing}
        aria-label={playing ? "Pause preview" : `Play preview of ${trackTitle}`}
        onClick={toggle}
        disabled={!trackPreviewUrl}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="track-info">
        {trackUrl ? (
          <a className="track-title" href={trackUrl} target="_blank" rel="noopener noreferrer">
            {trackTitle}
          </a>
        ) : (
          <p className="track-title">{trackTitle}</p>
        )}
        {trackArtist ? <p className="track-artist">{trackArtist}</p> : null}
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
