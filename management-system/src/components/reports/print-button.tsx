"use client";

import { Printer } from "lucide-react";
import { Button, type ButtonVariant } from "@/components/ui/button";

/** Opens the browser's print dialogue, where the report can also be saved as a PDF. */
export function PrintButton({ variant = "secondary", label = "Print or save as PDF" }: { variant?: ButtonVariant; label?: string }) {
  return (
    <Button variant={variant} className="no-print" onClick={() => window.print()}>
      <Printer aria-hidden="true" />
      {label}
    </Button>
  );
}
