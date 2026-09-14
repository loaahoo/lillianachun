"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PublicTrack {
  id: string;
  title: string;
  src: string;
}

export default function GalleryMusicPlayer() {
  const [tracks, setTracks] = useState<PublicTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    void fetch("/api/music")
      .then((res) => res.json())
      .then((data) => setTracks(data.tracks ?? []))
      .catch(() => setTracks([]));
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }, []);

  if (!tracks.length) return null;
  const current = tracks[index];

  function toggleMute() {
    if (autoplayBlocked) {
      setMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
      void play();
      return;
    }
    setMuted((value) => !value);
  }

  function nextTrack() {
    if (tracks.length === 1) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      void play();
      return;
    }
    setIndex((value) => (value + 1) % tracks.length);
  }

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={current.src}
        autoPlay
        muted={muted}
        loop={tracks.length === 1}
        playsInline
        preload="auto"
        onCanPlay={() => void play()}
        onEnded={nextTrack}
      />
      <span className="hidden max-w-44 truncate rounded-full bg-black/25 px-3 py-2 text-xs text-white/80 lg:block">
        ♪ {current.title}
      </span>
      <button
        type="button"
        onClick={toggleMute}
        className="rounded-full bg-white/15 px-4 py-2 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
        aria-label={autoplayBlocked ? "Start gallery music" : muted ? "Unmute gallery music" : "Mute gallery music"}
      >
        {autoplayBlocked ? "▶ Music" : muted ? "🔇 Unmute" : "🔊 Mute"}
      </button>
    </div>
  );
}
