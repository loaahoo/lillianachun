"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pikake } from "@/components/TropicalDecor";

interface ApprovedPhoto {
  id: number;
  uploaderName: string;
  caption: string | null;
  url: string;
}

const SLIDE_MS = 6000;

export default function GalleryView() {
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showUi, setShowUi] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/photos/approved")
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos ?? []))
      .catch(() => setPhotos([]))
      .finally(() => setLoaded(true));
  }, []);

  const next = useCallback(
    () => setIndex((i) => (photos.length ? (i + 1) % photos.length : 0)),
    [photos.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (photos.length ? (i - 1 + photos.length) % photos.length : 0)),
    [photos.length]
  );

  // Auto-advance
  useEffect(() => {
    if (!playing || photos.length < 2) return;
    const t = setInterval(next, SLIDE_MS);
    return () => clearInterval(t);
  }, [playing, photos.length, next]);

  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "f" || e.key === "F") toggleFullscreen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Auto-hide UI chrome while playing
  function pokeUi() {
    setShowUi(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUi(false), 3500);
  }
  useEffect(() => {
    pokeUi();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="animate-pulse font-display text-2xl">Loading memories…</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
        <Pikake className="h-14 w-14 text-white/80" />
        <h1 className="font-display text-3xl">No photos yet</h1>
        <p className="max-w-md text-white/70">
          Once the family approves the first photos of Nanna, they&apos;ll play
          here as a full-screen slideshow.
        </p>
        <Link
          href="/#share-a-photo"
          className="mt-2 rounded-full bg-hibiscus px-8 py-3 font-bold text-white transition-colors hover:bg-hibiscus/90"
        >
          Share the first photo
        </Link>
        <Link href="/" className="text-sm text-white/60 underline hover:text-white">
          Back to home
        </Link>
      </div>
    );
  }

  const current = photos[index];

  return (
    <div
      className="relative flex min-h-screen select-none flex-col items-center justify-center overflow-hidden bg-black"
      onMouseMove={pokeUi}
      onTouchStart={pokeUi}
    >
      {/* Blurred backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
      />

      {/* Main slide */}
      <figure key={current.id} className="animate-fade-slow relative z-10 flex h-screen w-full flex-col items-center justify-center p-4 pb-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.caption ?? `Photo of Nanna shared by ${current.uploaderName}`}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />
        <figcaption className="absolute bottom-8 left-1/2 w-[min(90%,40rem)] -translate-x-1/2 rounded-2xl bg-black/60 px-6 py-3 text-center text-white backdrop-blur">
          {current.caption && <p className="text-lg">{current.caption}</p>}
          <p className="text-sm text-white/70">
            Shared by {current.uploaderName} · {index + 1} / {photos.length}
          </p>
        </figcaption>
      </figure>

      {/* Controls */}
      <div
        className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 transition-opacity duration-500 ${
          showUi ? "opacity-100" : "opacity-0"
        }`}
      >
        <Link
          href="/"
          className="rounded-full bg-white/15 px-5 py-2 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          ← Home
        </Link>
        <h1 className="hidden font-display text-2xl text-white sm:block">
          Nanna&apos;s 100 Years of Aloha
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full bg-white/15 px-5 py-2 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          >
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-full bg-white/15 px-5 py-2 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
            aria-label="Toggle fullscreen"
          >
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="Previous photo"
        className={`absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-4 text-2xl text-white backdrop-blur transition-opacity duration-500 hover:bg-white/25 ${
          showUi ? "opacity-100" : "opacity-0"
        }`}
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next photo"
        className={`absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 p-4 text-2xl text-white backdrop-blur transition-opacity duration-500 hover:bg-white/25 ${
          showUi ? "opacity-100" : "opacity-0"
        }`}
      >
        ›
      </button>
    </div>
  );
}
