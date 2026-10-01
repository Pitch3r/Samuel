import { CircleCheck } from "lucide-react";
import { PrimeArc } from "@/components/brand/prime-arc";
import { InsightEngine } from "@/components/home/insight-engine";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const proofPoints = [
  "Registered in Zambia, ISIC 7320",
  "Ethics and data protection built in",
  "Design to decision under one roof",
];

export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="on-dark relative isolate overflow-hidden bg-navy pt-32 pb-20 text-white sm:pt-36 lg:flex lg:min-h-[min(100svh,64rem)] lg:items-center lg:pt-28 lg:pb-24"
    >
      <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(55rem_38rem_at_80%_10%,rgb(43_103_197/0.32),transparent_62%),radial-gradient(40rem_30rem_at_0%_100%,rgb(43_103_197/0.16),transparent_60%)]"
      />
      <PrimeArc
        tone="dark"
        segmentStart={236}
        segmentSweep={26}
        className="-top-[21rem] -right-[24.75rem] -z-10 size-[36rem] lg:hidden"
      />
      <PrimeArc
        tone="dark"
        segmentStart={160}
        segmentSweep={36}
        thickness={11}
        className="-top-[21rem] -right-[28rem] -z-10 hidden size-[80rem] lg:block 2xl:-right-[22rem]"
      />

      <Container size="wide" className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-24">
          <div>
            <Reveal>
              <p className="eyebrow">Research and advisory · Lusaka, Zambia</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 id="hero-heading" className="mt-6 font-display text-display font-extrabold text-white">
                Every decision deserves{" "}
                <span className="text-gold">
                  evidence<span className="-ml-[0.07em]">.</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-7 max-w-xl text-lead text-white/75">
                Primeresearch Consultants is a Zambian research and advisory firm. We design studies, collect and analyse data,
                and turn findings into decisions for businesses, public institutions, development partners and the academic
                community.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/start-a-project" variant="gold" size="lg" arrow>
                  Talk to us about your research
                </ButtonLink>
                <ButtonLink href="/services" variant="outline-light" size="lg">
                  See our services
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <ul className="mt-12 grid gap-3 text-sm text-white/75 sm:grid-cols-3 sm:gap-5">
                {proofPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-white/50" strokeWidth={2} aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={30} className="relative">
            <InsightEngine />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
