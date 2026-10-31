"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A native <dialog> with a trigger button. Children receive a close function,
 * so a form inside can close the dialog when its action succeeds.
 */
export function Modal({
  trigger,
  title,
  description,
  children,
  variant = "primary",
  size = "md",
  triggerClassName,
  wide = false,
}: {
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  children: (close: () => void) => ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  triggerClassName?: string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button type="button" className={buttonClasses({ variant, size, className: triggerClassName })} onClick={() => setOpen(true)}>
        {trigger}
      </button>
      <dialog
        ref={ref}
        onClose={close}
        onClick={(event) => {
          if (event.target === ref.current) close();
        }}
        className={cn(
          "m-auto w-[calc(100%-2rem)] rounded-panel border border-mist bg-white p-0 text-charcoal shadow-lift backdrop:bg-navy/40 backdrop:backdrop-blur-[2px]",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
        aria-labelledby={title ? undefined : undefined}
      >
        {open && (
          <div className="max-h-[85dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-mist px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-slate">{description}</p>}
              </div>
              <button type="button" onClick={close} className="rounded-lg p-1.5 text-slate hover:bg-cloud hover:text-navy" aria-label="Close">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="px-6 py-5">{children(close)}</div>
          </div>
        )}
      </dialog>
    </>
  );
}
