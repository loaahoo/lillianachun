"use client";

import { useRef, useState } from "react";

export default function PhotoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function onFileChange(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) {
      setError(!file ? "Please choose a photo to share." : "Please tell us your name.");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("uploaderName", name.trim());
    form.append("caption", caption.trim());
    try {
      const res = await fetch("/api/photos/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setStatus("done");
      onFileChange(null);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl border-2 border-dashed border-palm/40 bg-white/70 p-8 text-center">
        <p className="text-4xl">🌺</p>
        <h3 className="mt-2 font-display text-2xl text-palm">Mahalo nui loa!</h3>
        <p className="mt-2 text-ink/80">
          Your photo has been received. Once the family approves it, it will
          appear in Nanna&apos;s gallery for everyone to enjoy.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 rounded-full bg-ocean px-6 py-2.5 font-semibold text-white transition-colors hover:bg-ocean-deep"
        >
          Share another photo
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[color:var(--sand-deep)] bg-white/70 p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label
          className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ocean/40 bg-sand/60 p-4 text-center transition-colors hover:border-ocean hover:bg-sand"
          htmlFor="photo-input"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview of your photo"
              className="max-h-56 rounded-xl object-contain"
            />
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <span className="font-semibold text-ocean-deep">
                Tap to choose a photo of Nanna
              </span>
              <span className="text-xs text-ink/60">JPG, PNG, WebP, GIF or HEIC · up to 10 MB</span>
            </>
          )}
          <input
            id="photo-input"
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="uploader-name" className="mb-1 block text-sm font-bold text-ink">
              Your name <span className="text-hibiscus">*</span>
            </label>
            <input
              id="uploader-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Keiko from Waipahu"
              className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="caption" className="mb-1 block text-sm font-bold text-ink">
              Caption or memory <span className="text-ink/50">(optional)</span>
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell us about this moment with Nanna..."
              rows={3}
              className="h-full min-h-20 w-full resize-none rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={status === "uploading"}
            className="rounded-full bg-hibiscus px-6 py-3 font-bold text-white transition-colors hover:bg-hibiscus/90 disabled:opacity-60"
          >
            {status === "uploading" ? "Sending with aloha..." : "Share this photo 🌺"}
          </button>
          {status === "error" && error && (
            <p className="text-sm font-semibold text-hibiscus">{error}</p>
          )}
          <p className="text-xs text-ink/60">
            Photos are reviewed by the family before appearing on the site.
          </p>
        </div>
      </div>
    </form>
  );
}
