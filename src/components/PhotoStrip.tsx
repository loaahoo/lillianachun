"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { shuffle } from "@/lib/shuffle";

interface ApprovedPhoto {
  id: number;
  uploaderName: string;
  caption: string | null;
  url: string;
}

export default function PhotoStrip() {
  const [photos, setPhotos] = useState<ApprovedPhoto[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/photos/approved")
      .then((r) => r.json())
      .then((d) => setPhotos(shuffle(d.photos ?? [])))
      .catch(() => setPhotos([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  if (photos.length === 0) {
    return (
      <p className="text-center text-ink/60">
        No photos yet — be the first to share a memory of Nanna!
      </p>
    );
  }

  const doubled = [...photos, ...photos];
  // ~5s per photo keeps the pace slow and readable regardless of how many
  // photos the family uploads (min 60s so tiny sets don't whip around).
  const duration = Math.max(60, photos.length * 5);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl">
        <div
          className="animate-marquee flex w-max gap-4"
          style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
        >
          {doubled.map((p, i) => (
            <figure key={`${p.id}-${i}`} className="w-56 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.caption ?? `Photo of Nanna shared by ${p.uploaderName}`}
                className="h-40 w-56 rounded-2xl object-cover shadow-md"
                loading="lazy"
              />
              <figcaption className="mt-1 truncate text-xs text-ink/60">
                {p.caption || `Shared by ${p.uploaderName}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/gallery"
          className="inline-block rounded-full bg-ocean px-8 py-3 font-bold text-white transition-colors hover:bg-ocean-deep"
        >
          View the full-screen gallery →
        </Link>
      </div>
    </div>
  );
}
