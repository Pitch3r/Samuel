"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CloudUpload, LoaderCircle, X } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";
import { buttonClasses } from "@/components/ui/button";
import { FILE_KINDS, FILE_KIND_LABELS, type FileKind } from "@/lib/constants";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

type UploadResponse = { ok: boolean; message?: string };

/**
 * Sends one file to /api/files/[assignmentId] as multipart form data. Uses
 * XMLHttpRequest rather than fetch so the upload can report its progress.
 */
function upload(url: string, body: FormData, onProgress: (fraction: number) => void) {
  return new Promise<UploadResponse & { status: number }>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      const response = (xhr.response ?? {}) as UploadResponse;
      resolve({ ...response, ok: xhr.status >= 200 && xhr.status < 300 && response.ok !== false, status: xhr.status });
    };
    xhr.onerror = () => resolve({ ok: false, status: 0, message: "The upload was interrupted. Check the connection and try again." });
    xhr.send(body);
  });
}

/** "20 MB" rather than "20.0 MB" for whole megabytes. */
function limitLabel(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return Number.isInteger(mb) ? `${mb} MB` : formatBytes(bytes);
}

export function FileUpload({ assignmentId, maxBytes, defaultKind = "draft" }: { assignmentId: string; maxBytes: number; defaultKind?: FileKind }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<FileKind>(defaultKind);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const busy = progress !== null;

  function choose(next: File | null) {
    setError(null);
    if (next && next.size > maxBytes) {
      setFile(null);
      setError(`"${next.name}" is ${formatBytes(next.size)}. Files can be up to ${limitLabel(maxBytes)}.`);
      return;
    }
    if (next && next.size === 0) {
      setFile(null);
      setError(`"${next.name}" is empty.`);
      return;
    }
    setFile(next);
  }

  function clear() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function send() {
    if (!file || busy) return;
    setError(null);
    setProgress(0);
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    const result = await upload(`/api/files/${encodeURIComponent(assignmentId)}`, body, setProgress);
    setProgress(null);
    if (!result.ok) {
      const message =
        result.status === 401 ? "Your session has ended. Sign in again, then upload the file." : (result.message ?? "The file could not be uploaded. Please try again.");
      setError(message);
      toast.error(message);
      return;
    }
    toast.success(result.message ?? `Uploaded "${file.name}".`);
    clear();
    router.refresh();
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    choose(event.dataTransfer.files[0] ?? null);
  }

  return (
    <div className="space-y-3">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue",
          dragging ? "border-blue bg-blue-tint" : "border-mist bg-cloud/60 hover:border-slate/40",
          busy && "pointer-events-none opacity-70",
        )}
      >
        <CloudUpload className="size-6 text-blue" aria-hidden="true" />
        <span className="text-sm font-semibold text-navy">{file ? file.name : "Drop a file here, or choose one"}</span>
        <span className="text-xs text-slate">{file ? formatBytes(file.size) : `Documents, data, images or archives up to ${limitLabel(maxBytes)}`}</span>
        <input ref={inputRef} type="file" className="sr-only" disabled={busy} onChange={(event) => choose(event.target.files?.[0] ?? null)} />
      </label>

      {file && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor={`file-kind-${assignmentId}`} className="field-label">
              What is it?
            </label>
            <select
              id={`file-kind-${assignmentId}`}
              value={kind}
              onChange={(event) => setKind(event.target.value as FileKind)}
              disabled={busy}
              className="field-input h-10 py-0 text-sm"
            >
              {FILE_KINDS.map((option) => (
                <option key={option} value={option}>
                  {FILE_KIND_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={clear} disabled={busy} className={buttonClasses({ variant: "ghost", className: "h-10" })}>
              <X aria-hidden="true" />
              Cancel
            </button>
            <button type="button" onClick={send} disabled={busy} className={buttonClasses({ className: "h-10" })}>
              {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <CloudUpload aria-hidden="true" />}
              {busy ? "Uploading" : "Upload"}
            </button>
          </div>
        </div>
      )}

      {busy && <ProgressBar value={(progress ?? 0) * 100} showValue label="Upload progress" />}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
