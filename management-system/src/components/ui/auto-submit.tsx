"use client";

import { useRef, type ReactNode } from "react";

/**
 * A GET filter form that submits when a select or checkbox changes. Date
 * fields wait for an explicit Apply (they fire change events while typing).
 */
export function FilterForm({ children, className, action }: { children: ReactNode; className?: string; action?: string }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      method="get"
      action={action}
      className={className}
      onChange={(event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "SELECT" || (target as HTMLInputElement).type === "checkbox") {
          ref.current?.requestSubmit();
        }
      }}
    >
      {children}
    </form>
  );
}
