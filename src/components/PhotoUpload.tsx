"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPTED = /\.(jpe?g|png|webp|gif|heic|heif)$/i;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB, matches the API
const MAX_BATCH = 100;

type ItemStatus = "queued" | "uploading" | "done" | "error";

interface QueueItem {
  id: string;
  file: File;
  preview: string;
  status: ItemStatus;
  error?: string;
}

function isImage(file: File): boolean {
  return file.type.startsWith("image/") || ACCEPTED.test(file.name);
}

/** Recursively walk a dropped directory entry collecting image files. */
async function walkEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    const file = await new Promise<File | null>(resolve =>
      (entry as FileSystemFileEntry).file(resolve, () => resolve(null))
    );
    return file && isImage(file) ? [file] : [];
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const out: File[] = [];
    // readEntries returns results in chunks; keep calling until empty.
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>(resolve =>
        reader.readEntries(resolve, () => resolve([]))
      );
      if (batch.length === 0) break;
      for (const child of batch) out.push(...(await walkEntry(child)));
    }
    return out;
  }
  return [];
}

/** Extract image files from a drop event — supports files AND folders. */
async function filesFromDrop(dt: DataTransfer): Promise<File[]> {
  const items = Array.from(dt.items ?? []);
  const entries = items
    .map(item => (typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null))
    .filter((e): e is FileSystemEntry => e != null);

  if (entries.length > 0) {
    const nested = await Promise.all(entries.map(walkEntry));
    return nested.flat();
  }
  // Fallback for browsers without directory entry support
  return Array.from(dt.files ?? []).filter(isImage);
}

let nextId = 0;

export default function PhotoUpload() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [finished, setFinished] = useState<{ done: number; failed: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    setFinished(null);
    setFormError("");
    setQueue(prev => {
      const room = Math.max(0, MAX_BATCH - prev.length);
      const additions = files
        .filter(isImage)
        .slice(0, room)
        .map(file => ({
          id: `f${nextId++}`,
          file,
          preview: URL.createObjectURL(file),
          status: (file.size > MAX_SIZE ? "error" : "queued") as ItemStatus,
          error: file.size > MAX_SIZE ? "Over 10 MB" : undefined,
        }));
      return [...prev, ...additions];
    });
  }, []);

  function removeItem(id: string) {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (busy) return;
    const files = await filesFromDrop(e.dataTransfer);
    if (files.length === 0) {
      setFormError("No images found in what you dropped — try JPG, PNG, WebP, GIF or HEIC files.");
      return;
    }
    addFiles(files);
  }

  async function uploadOne(item: QueueItem): Promise<boolean> {
    const form = new FormData();
    form.append("file", item.file);
    form.append("uploaderName", name.trim());
    form.append("caption", caption.trim());
    try {
      const res = await fetch("/api/photos/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setQueue(prev => prev.map(i => (i.id === item.id ? { ...i, status: "done" } : i)));
      return true;
    } catch (err) {
      setQueue(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: "error", error: err instanceof Error ? err.message : "Failed" }
            : i
        )
      );
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pending = queue.filter(i => i.status === "queued" || i.status === "error");
    if (pending.length === 0) {
      setFormError("Add at least one photo first.");
      return;
    }
    if (!name.trim()) {
      setFormError("Please tell us your name.");
      return;
    }
    setFormError("");
    setBusy(true);
    setFinished(null);

    const uploadable = pending.filter(i => i.file.size <= MAX_SIZE);
    setQueue(prev =>
      prev.map(i => (uploadable.some(u => u.id === i.id) ? { ...i, status: "uploading", error: undefined } : i))
    );

    // Upload with limited concurrency (3 at a time) to stay gentle on serverless limits.
    let done = 0;
    let failed = pending.length - uploadable.length;
    const workers = Array.from({ length: Math.min(3, uploadable.length) }, async (_, w) => {
      for (let idx = w; idx < uploadable.length; idx += Math.min(3, uploadable.length)) {
        const ok = await uploadOne(uploadable[idx]);
        if (ok) done++;
        else failed++;
      }
    });
    await Promise.all(workers);

    setBusy(false);
    setFinished({ done, failed });
  }

  function resetForMore() {
    queue.forEach(i => URL.revokeObjectURL(i.preview));
    setQueue([]);
    setCaption("");
    setFinished(null);
    if (inputRef.current) inputRef.current.value = "";
    if (folderRef.current) folderRef.current.value = "";
  }

  const queuedCount = queue.filter(i => i.status === "queued").length;
  const doneCount = queue.filter(i => i.status === "done").length;

  if (finished && finished.failed === 0 && finished.done > 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-palm/40 bg-white/70 p-8 text-center">
        <p className="text-4xl">🌺</p>
        <h3 className="mt-2 font-display text-2xl text-palm">Mahalo nui loa!</h3>
        <p className="mt-2 text-ink/80">
          {finished.done === 1
            ? "Your photo has been received."
            : `All ${finished.done} photos have been received.`}{" "}
          Once the family approves them, they&apos;ll appear in Nanna&apos;s gallery for
          everyone to enjoy.
        </p>
        <button
          onClick={resetForMore}
          className="mt-4 rounded-full bg-ocean px-6 py-2.5 font-semibold text-white transition-colors hover:bg-ocean-deep"
        >
          Share more photos
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[color:var(--sand-deep)] bg-white/70 p-6 shadow-sm sm:p-8"
    >
      {/* Drop zone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-hibiscus bg-hibiscus/10"
            : "border-ocean/40 bg-sand/60 hover:border-ocean hover:bg-sand"
        }`}
      >
        <span className="text-3xl">{dragOver ? "🌺" : "📷"}</span>
        <p className="font-semibold text-ocean-deep">
          {dragOver
            ? "Drop them right here!"
            : "Drag & drop photos — or even whole folders — here"}
        </p>
        <p className="text-xs text-ink/60">
          JPG, PNG, WebP, GIF or HEIC · up to 10 MB each · up to {MAX_BATCH} at a time
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border-2 border-ocean px-5 py-2 text-sm font-bold text-ocean-deep transition-colors hover:bg-ocean hover:text-white"
          >
            Choose photos
          </button>
          <button
            type="button"
            onClick={() => folderRef.current?.click()}
            className="rounded-full border-2 border-ocean/50 px-5 py-2 text-sm font-bold text-ocean-deep/80 transition-colors hover:bg-ocean hover:text-white"
          >
            Choose a folder
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="sr-only"
          onChange={e => addFiles(Array.from(e.target.files ?? []))}
        />
        <input
          ref={folderRef}
          type="file"
          className="sr-only"
          // @ts-expect-error non-standard but widely supported folder picker
          webkitdirectory=""
          multiple
          onChange={e => addFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* Queue preview grid */}
      {queue.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">
              {queue.length} photo{queue.length === 1 ? "" : "s"}
              {doneCount > 0 ? ` · ${doneCount} uploaded` : ""}
            </p>
            {!busy && (
              <button
                type="button"
                onClick={resetForMore}
                className="text-sm font-semibold text-hibiscus hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
            {queue.map(item => (
              <li key={item.id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className={`aspect-square w-full rounded-xl object-cover ${
                    item.status === "error" ? "opacity-50 ring-2 ring-hibiscus" : ""
                  } ${item.status === "done" ? "ring-2 ring-palm" : ""}`}
                />
                <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {item.status === "queued" && "Ready"}
                  {item.status === "uploading" && "Uploading…"}
                  {item.status === "done" && "✓ Sent"}
                  {item.status === "error" && (item.error || "Failed")}
                </span>
                {!busy && item.status !== "done" && (
                  <button
                    type="button"
                    aria-label={`Remove ${item.file.name}`}
                    onClick={() => removeItem(item.id)}
                    className="absolute -right-1.5 -top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white group-hover:flex"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Name + caption + submit */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="uploader-name" className="mb-1 block text-sm font-bold text-ink">
            Your name <span className="text-hibiscus">*</span>
          </label>
          <input
            id="uploader-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Keiko from Waipahu"
            className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
            required
          />
        </div>
        <div>
          <label htmlFor="caption" className="mb-1 block text-sm font-bold text-ink">
            Caption for this batch <span className="text-ink/50">(optional)</span>
          </label>
          <input
            id="caption"
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="e.g. Nanna's 90th birthday at the beach"
            className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="submit"
          disabled={busy || queuedCount === 0}
          className="rounded-full bg-hibiscus px-6 py-3 font-bold text-white transition-colors hover:bg-hibiscus/90 disabled:opacity-60"
        >
          {busy
            ? `Sending with aloha… (${doneCount}/${queue.length})`
            : queuedCount > 1
              ? `Share these ${queuedCount} photos 🌺`
              : "Share this photo 🌺"}
        </button>
        {formError && <p className="text-sm font-semibold text-hibiscus">{formError}</p>}
        {finished && finished.failed > 0 && (
          <p className="text-sm font-semibold text-hibiscus">
            {finished.done} uploaded, {finished.failed} failed — you can retry the failed
            ones by pressing the button again.
          </p>
        )}
        <p className="text-xs text-ink/60">
          Photos are reviewed by the family before appearing on the site.
        </p>
      </div>
    </form>
  );
}
