"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClasses } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Must match the checks in /api/avatar/[uid]. */
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024;

type Reply = { ok?: boolean; message?: string };

/**
 * Profile photo: pick a JPEG, PNG or WebP image up to 3 MB, preview it, then
 * save. The file goes to /api/avatar/[uid] (a route handler rather than a
 * server action, because photos can be larger than the action body limit).
 */
export function PhotoUploader({
  uid,
  name,
  photoVersion,
  self,
}: {
  uid: string;
  name: string;
  photoVersion: string | null;
  /** Wording: "your photo" rather than "their photo". */
  self: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const url = `/api/avatar/${encodeURIComponent(uid)}`;

  // Release the preview's object URL when it changes or the component goes away.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function reset() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function choose(next: File | null) {
    setError(null);
    if (!next) return reset();
    if (!TYPES.includes(next.type)) {
      reset();
      setError("Choose a JPEG, PNG or WebP image.");
      return;
    }
    if (next.size > MAX_BYTES) {
      reset();
      setError(`That image is ${formatBytes(next.size)}. Photos can be up to 3 MB.`);
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function send(method: "POST" | "DELETE") {
    setError(null);
    setBusy(method === "POST" ? "upload" : "remove");
    let body: FormData | undefined;
    if (method === "POST") {
      if (!file) return setBusy(null);
      body = new FormData();
      body.append("photo", file);
    }
    try {
      const response = await fetch(url, { method, body });
      const reply = (await response.json().catch(() => ({}))) as Reply;
      if (!response.ok || reply.ok === false) {
        const message = response.status === 401 ? "Your session has ended. Sign in again, then try once more." : (reply.message ?? "That did not work. Please try again.");
        setError(message);
        toast.error(message);
        return;
      }
      toast.success(reply.message ?? (method === "POST" ? "Photo saved." : "Photo removed."));
      reset();
      router.refresh();
    } catch {
      const message = "The connection was interrupted. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0 self-start">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview of an unsaved file
          <img src={preview} alt="Preview of the new photo" className="size-24 rounded-full object-cover ring-2 ring-blue" />
        ) : (
          <Avatar name={name} uid={uid} photoVersion={photoVersion} size="xl" className="ring-mist" />
        )}
        <span className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full bg-white text-navy shadow-card ring-1 ring-mist">
          <Camera className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-charcoal">
          {file ? (
            <>
              <span className="font-semibold text-navy">{file.name}</span> <span className="text-slate">({formatBytes(file.size)})</span>
            </>
          ) : photoVersion ? (
            `This photo appears on ${self ? "your" : "their"} profile, on assignments and in the team list.`
          ) : (
            `No photo yet. ${self ? "Your" : "Their"} initials are shown instead.`
          )}
        </p>
        <p className="mt-1 text-xs text-slate">JPEG, PNG or WebP, up to 3 MB. A square head-and-shoulders photo works best.</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {file ? (
            <>
              <Button onClick={() => send("POST")} disabled={busy !== null}>
                {busy === "upload" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                {busy === "upload" ? "Saving photo" : "Save photo"}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={busy !== null}>
                <X aria-hidden="true" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <label
                className={cn(
                  buttonClasses({ variant: "secondary" }),
                  "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue",
                  busy && "pointer-events-none opacity-55",
                )}
              >
                <Camera aria-hidden="true" />
                {photoVersion ? "Change photo" : "Upload photo"}
                <input
                  ref={inputRef}
                  type="file"
                  accept={TYPES.join(",")}
                  className="sr-only"
                  disabled={busy !== null}
                  onChange={(event) => choose(event.target.files?.[0] ?? null)}
                />
              </label>
              {photoVersion && (
                <Button
                  variant="ghost"
                  className="text-danger hover:bg-danger-tint"
                  disabled={busy !== null}
                  onClick={() => {
                    if (window.confirm(`Remove ${self ? "your" : "this"} profile photo?`)) void send("DELETE");
                  }}
                >
                  {busy === "remove" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                  Remove photo
                </Button>
              )}
            </>
          )}
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
