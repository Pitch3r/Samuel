"use client";

import { useRef, type ReactNode } from "react";

/** A GET filter form that submits whenever a control changes. Works without JavaScript via its button. */
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
        if (target.tagName === "SELECT" || (target as HTMLInputElement).type === "date" || (target as HTMLInputElement).type === "checkbox") {
          ref.current?.requestSubmit();
        }
      }}
    >
      {children}
    </form>
  );
}
