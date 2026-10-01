"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button type="button" variant="primary" onClick={() => window.print()}>
      <Download className="size-4" aria-hidden="true" />
      Download as PDF
    </Button>
  );
}
