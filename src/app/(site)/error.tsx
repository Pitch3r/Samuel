"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="on-dark relative isolate flex min-h-[70svh] items-center bg-navy pt-32 pb-24 text-white">
      <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />
      <Container>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-5 max-w-3xl font-display text-h1 font-bold text-white">We could not load this page.</h1>
        <p className="mt-6 max-w-xl text-lead text-white/75">
          Please try again. If the problem continues, contact us and we will help directly.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button variant="gold" size="lg" onClick={() => retry()}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </Button>
          <ButtonLink href="/contact" variant="outline-light" size="lg">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
