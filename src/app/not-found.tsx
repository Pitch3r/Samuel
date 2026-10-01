import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PrimeArc } from "@/components/brand/prime-arc";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const suggestions = [
  { label: "Our services", href: "/services" },
  { label: "Insights", href: "/insights" },
  { label: "Sample size calculator", href: "/tools/sample-size-calculator" },
  { label: "Contact us", href: "/contact" },
];

export default function NotFound() {
  return (
    <Providers>
      <Header />
      <main id="main" className="on-dark relative isolate flex min-h-[80svh] items-center overflow-hidden bg-navy pt-32 pb-24 text-white">
        <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />
        <PrimeArc tone="dark" segmentStart={150} segmentSweep={50} className="-right-[22rem] -bottom-[26rem] -z-10 size-[52rem]" />
        <Container>
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-5 max-w-3xl font-display text-h1 font-bold text-white">This page did not make it into the sample.</h1>
          <p className="mt-6 max-w-xl text-lead text-white/75">
            The page you are looking for may have moved, or the address may be mistyped. Try one of these instead.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="gold" size="lg" arrow>
              Back to the home page
            </ButtonLink>
          </div>
          <ul className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-2">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-display font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.08]"
                >
                  {item.label}
                  <ArrowRight className="size-4 text-white/60 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <Footer />
    </Providers>
  );
}
