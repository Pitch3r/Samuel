"use client";

import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border !border-mist !shadow-lift !font-sans",
            title: "!font-display !font-semibold !text-navy",
            description: "!text-slate",
          },
        }}
      />
    </MotionConfig>
  );
}
