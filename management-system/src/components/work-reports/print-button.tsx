"use client";

import { Printer } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/** Opens the browser's print dialog; the page hides navigation when printed. */
export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClasses({ variant: "secondary" })}>
      <Printer aria-hidden="true" />
      {label}
    </button>
  );
}
