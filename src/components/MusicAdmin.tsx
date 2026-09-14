"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import type { MusicTrack } from "@/lib/music";

const MAX_SIZE = 30 * 1024 * 1024;

interface UploadedBlob {
  url: string;
  pathname: string;
}

function titleFromFilename(filename: string) {
  return filename.replace(/\.mp3$/i, "").replace(/[_-]+/g, " ").trim();
}

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function MusicAdmin() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetch("/api/admin/music", { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTracks(data.tracks ?? []);
      })
      .catch(() => setMessage("Could not load the gallery playlist."))
      .finally(() => setLoading(false));
  }, []);

  async function registerBlob(blob: UploadedBlob, file: File) {
    const res = await fetch("/api/admin/music", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleFromFilename(file.name),
        url: blob.url,
        pathname: blob.pathname,
        mimeType: file.type || "audio/mpeg",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not add the song.");
    setTracks((current) => [...current, data.track]);
  }

  async function uploadFile(file: File) {
    const pathname = `nanna-music/${Date.now()}-${safeFilename(file.name)}`;
    const common = {
      handleUploadUrl: "/api/admin/music/upload",
      contentType: "audio/mpeg",
      onUploadProgress: ({ percentage }: { percentage: number }) => setProgress(percentage),
    };
    let blob: UploadedBlob;
    try {
      blob = await upload(pathname, file, { ...common, access: "private" });
    } catch (err) {
      const text = err instanceof Error ? err.message.toLowerCase() : "";
      if (!text.includes("public") && !text.includes("private") && !text.includes("access")) throw err;
      blob = await upload(pathname, file, { ...common, access: "public" });
    }
    await registerBlob(blob, file);
  }

  async function addSongs(files: File[]) {
    const accepted = files.filter((file) => file.name.toLowerCase().endsWith(".mp3"));
    if (!accepted.length) {
      setMessage("Choose one or more MP3 files.");
      return;
    }
    const oversized = accepted.find((file) => file.size > MAX_SIZE);
    if (oversized) {
      setMessage(`${oversized.name} is larger than the 30 MB limit.`);
      return;
    }
    setUploading(true);
    setProgress(0);
    setMessage("");
    try {
      for (const file of accepted) await uploadFile(file);
      setMessage(`✓ Added ${accepted.length === 1 ? "1 song" : `${accepted.length} songs`} to the gallery playlist.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "One of the songs could not be uploaded.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= tracks.length) return;
    const previous = tracks;
    const next = [...tracks];
    [next[index], next[destination]] = [next[destination], next[index]];
    setTracks(next);
    setMessage("");
    try {
      const res = await fetch("/api/admin/music", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map((track) => track.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTracks(previous);
      setMessage("Could not update the playlist order.");
    }
  }

  async function remove(track: MusicTrack) {
    if (!window.confirm(`Remove “${track.title}” from the playlist?`)) return;
    setMessage("");
    try {
      const res = await fetch("/api/admin/music", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: track.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTracks(data.tracks ?? []);
      setMessage("✓ Song removed.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not remove that song.");
    }
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-display text-2xl text-ocean-deep">Gallery music</h2>
      <p className="mt-1 text-sm text-ink/60">
        Upload MP3s in the order you want them played. After the last song, the playlist starts over.
      </p>

      <div className="mt-5 rounded-2xl border-2 border-dashed border-ocean/35 bg-sand/50 p-5 text-center">
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,.mp3"
          multiple
          disabled={uploading}
          onChange={(event) => void addSongs(Array.from(event.target.files ?? []))}
          className="sr-only"
          id="music-files"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-full bg-ocean px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ocean-deep disabled:opacity-60"
        >
          {uploading ? `Uploading… ${Math.round(progress)}%` : "+ Add MP3 files"}
        </button>
        <p className="mt-2 text-xs text-ink/50">MP3 only · up to 30 MB per song</p>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-ink/60">Loading playlist…</p>
      ) : tracks.length === 0 ? (
        <p className="mt-5 rounded-xl bg-sand/60 p-5 text-center text-sm text-ink/60">
          No songs added yet.
        </p>
      ) : (
        <ol className="mt-5 space-y-2">
          {tracks.map((track, index) => (
            <li key={track.id} className="flex items-center gap-3 rounded-xl border border-sand-deep p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-sm font-black text-ocean-deep">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">{track.title}</span>
              <button
                type="button"
                onClick={() => void move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${track.title} up`}
                className="rounded-full px-3 py-1.5 font-bold text-ocean disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => void move(index, 1)}
                disabled={index === tracks.length - 1}
                aria-label={`Move ${track.title} down`}
                className="rounded-full px-3 py-1.5 font-bold text-ocean disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => void remove(track)}
                className="rounded-full px-3 py-1.5 text-sm font-bold text-hibiscus hover:bg-hibiscus/10"
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
      )}
      {message && (
        <p className={`mt-4 text-sm font-semibold ${message.startsWith("✓") ? "text-palm" : "text-hibiscus"}`}>
          {message}
        </p>
      )}
    </section>
  );
}
