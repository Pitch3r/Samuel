import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PrimeArc } from "@/components/brand/prime-arc";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

export type Crumb = { name: string; href: string };

export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
  aside,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  const trail = crumbs ? [{ name: "Home", href: "/" }, ...crumbs] : undefined;
  return (
    <section className={cn("on-dark relative isolate overflow-hidden bg-navy pt-36 pb-20 text-white sm:pt-40 sm:pb-24 lg:pb-28", className)}>
      {trail && <BreadcrumbJsonLd items={trail} />}
      <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_85%_-10%,rgb(43_103_197/0.28),transparent_60%)]"
      />
      <PrimeArc
        tone="dark"
        className="-top-[18rem] -right-[20rem] -z-10 size-[44rem] sm:-right-[14rem] lg:-top-[16rem] lg:-right-[10rem] lg:size-[52rem]"
      />
      <Container className={cn(aside && "grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end")}>
        <div className="max-w-3xl">
          {trail && (
            <Reveal>
              <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
                  {trail.map((crumb, index) => (
                    <li key={crumb.href} className="flex items-center gap-1.5">
                      {index > 0 && <ChevronRight className="size-3.5 text-white/35" aria-hidden="true" />}
                      {index === trail.length - 1 ? (
                        <span aria-current="page" className="text-white/90">
                          {crumb.name}
                        </span>
                      ) : (
                        <Link href={crumb.href} className="transition-colors hover:text-white">
                          {crumb.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className={cn("font-display text-h1 font-bold text-white", eyebrow && "mt-5")}>{title}</h1>
          </Reveal>
          {lead && (
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-2xl text-lead text-white/75">{lead}</p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.18}>
              <div className="mt-9">{children}</div>
            </Reveal>
          )}
        </div>
        {aside && <Reveal delay={0.2}>{aside}</Reveal>}
      </Container>
    </section>
  );
}
