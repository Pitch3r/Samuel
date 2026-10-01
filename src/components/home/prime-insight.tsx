import { BrandGlyph } from "@/components/brand/brand-glyph";
import { PrimeArc } from "@/components/brand/prime-arc";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { site } from "@/config/site";

const ideas = [
  {
    kind: "lens" as const,
    title: "Focus",
    detail: "We start from the decision and look carefully, so the study answers the question you actually have.",
  },
  {
    kind: "segment" as const,
    title: "The part that matters",
    detail: "We separate signal from noise and put the finding that matters at the front of the report.",
  },
  {
    kind: "precision" as const,
    title: "Precision",
    detail: "Sound samples, tested instruments and checked data. Nothing in our reports is decoration.",
  },
];

const facts = [
  { value: "8", label: "practice areas" },
  { value: "10", label: "sectors served" },
  { value: "10", label: "provinces covered" },
  { value: "6", label: "stage quality method" },
];

export function PrimeInsight() {
  return (
    <Section labelledBy="prime-insight-heading" className="overflow-hidden">
      <PrimeArc tone="light" segmentStart={300} segmentSweep={50} className="-bottom-[24rem] -left-[24rem] -z-10 size-[44rem]" />
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Our aim</p>
            <h2 id="prime-insight-heading" className="mt-5 font-display text-h2 font-bold">
              {site.primeInsight}
            </h2>
            <p className="mt-6 text-lead text-slate">
              Research produces a great deal of information. Our job is to find the part that matters, the prime insight, and
              present it so clearly that the right decision becomes obvious.
            </p>
            <p className="mt-5 leading-relaxed text-charcoal">{site.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/about" variant="navy" arrow>
                About Primeresearch
              </ButtonLink>
              <ButtonLink href="/approach" variant="outline">
                Our approach
              </ButtonLink>
            </div>
          </Reveal>

          <div>
            <Stagger className="grid gap-4 sm:grid-cols-3" stagger={0.12}>
              {ideas.map((idea) => (
                <StaggerItem key={idea.title} className="rounded-card border border-mist bg-cloud p-6">
                  <BrandGlyph kind={idea.kind} />
                  <h3 className="mt-5 font-display text-lg font-bold text-navy">{idea.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{idea.detail}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1}>
              <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-card border border-mist sm:grid-cols-4">
                {facts.map((fact, index) => (
                  <div
                    key={fact.label}
                    className={
                      "flex flex-col gap-1 bg-white p-5 " +
                      (index % 2 === 1 ? "border-l border-mist " : "") +
                      (index >= 2 ? "border-t border-mist sm:border-t-0 " : "") +
                      (index === 2 ? "sm:border-l " : "")
                    }
                  >
                    <dt className="order-2 text-xs leading-snug text-slate">{fact.label}</dt>
                    <dd className="order-1 font-display text-3xl font-bold text-navy">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
