import { Download, File, FileArchive, FileImage, FileSpreadsheet, FileText } from "lucide-react";
import { RemoveFileButton } from "@/components/assignments/remove-file-button";
import { Badge, type Tone } from "@/components/ui/badge";
import { FILE_KIND_LABELS, type FileKind } from "@/lib/constants";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { ActionResult, AssignmentFile } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

const KIND_TONES: Record<FileKind, Tone> = { brief: "navy", data: "blue", draft: "neutral", deliverable: "good", other: "neutral" };

function iconFor(file: AssignmentFile) {
  const name = file.name.toLowerCase();
  if (file.contentType.startsWith("image/")) return FileImage;
  if (/\.(xlsx?|csv|sav|dta|rds|ods)$/.test(name) || file.contentType.includes("spreadsheet") || file.contentType.includes("csv")) return FileSpreadsheet;
  if (/\.(zip|rar|7z|gz|tar)$/.test(name) || file.contentType.includes("zip")) return FileArchive;
  if (/\.(pdf|docx?|odt|rtf|txt|md|pptx?)$/.test(name)) return FileText;
  return File;
}

export function fileHref(file: Pick<AssignmentFile, "assignmentId" | "id">) {
  return `/api/files/${encodeURIComponent(file.assignmentId)}/${encodeURIComponent(file.id)}`;
}

/** Files on the assignment, with download links and delete for the uploader or the administrator. */
export function FileList({
  files,
  viewer,
  canRemoveOwn = true,
  deleteAction,
}: {
  files: AssignmentFile[];
  viewer: { uid: string; isAdmin: boolean };
  /** Whether an employee may remove their own uploads right now (not on closed or submitted work). */
  canRemoveOwn?: boolean;
  deleteAction: Action;
}) {
  if (!files.length) return null;
  return (
    <ul className="divide-y divide-mist rounded-xl border border-mist">
      {files.map((file) => {
        const Icon = iconFor(file);
        const canDelete = viewer.isAdmin || (canRemoveOwn && file.uploadedBy === viewer.uid);
        return (
          <li key={file.id} className="flex items-center gap-3 px-3.5 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-tint text-blue">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <a href={fileHref(file)} download className="block truncate text-sm font-semibold text-navy hover:text-blue hover:underline" title={file.name}>
                {file.name}
              </a>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate">
                <Badge tone={KIND_TONES[file.kind]}>{FILE_KIND_LABELS[file.kind]}</Badge>
                <span className="tabular">{formatBytes(file.size)}</span>
                <span>
                  {file.uploadedByName}, {formatDateTime(file.uploadedAt)}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <a href={fileHref(file)} download className="rounded-lg p-2 text-slate hover:bg-cloud hover:text-navy" aria-label={`Download ${file.name}`} title="Download">
                <Download className="size-4" aria-hidden="true" />
              </a>
              {canDelete && <RemoveFileButton assignmentId={file.assignmentId} fileId={file.id} name={file.name} action={deleteAction} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
