import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { SampleSizeCalculator } from "@/components/tools/sample-size-calculator";
import { parseCalculatorParams } from "@/lib/calculator-params";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { sampleSize } from "@/lib/sample-size";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sample size calculator",
  description:
    "Free survey sample size and margin of error calculator, with population size, design effect and response rate. From Primeresearch Consultants, Zambia.",
  alternates: { canonical: "/tools/sample-size-calculator" },
};

const reference = [10, 5, 4, 3, 2].map((margin) => ({
  margin,
  c90: sampleSize({ marginOfError: margin / 100, confidence: 90 }).completes,
  c95: sampleSize({ marginOfError: margin / 100, confidence: 95 }).completes,
  c99: sampleSize({ marginOfError: margin / 100, confidence: 99 }).completes,
}));

const terms = [
  {
    term: "Margin of error",
    detail: "How far the survey estimate may sit from the true population value. Smaller margins need larger samples.",
  },
  {
    term: "Confidence level",
    detail: "How often the true value would fall inside the margin if the survey were repeated. 95% is the usual standard.",
  },
  {
    term: "Expected proportion",
    detail: "Your best guess at the result. 50% is the most cautious choice because it produces the largest sample.",
  },
  {
    term: "Design effect",
    detail: "How much a complex design, such as sampling villages first and then households, inflates the sample you need.",
  },
  {
    term: "Response rate",
    detail: "The share of people approached who complete the interview. It tells you how many contacts to plan for.",
  },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SampleSizePage({ searchParams }: Props) {
  const initial = parseCalculatorParams(await searchParams);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Sample size calculator",
          url: absoluteUrl("/tools/sample-size-calculator"),
          applicationCategory: "EducationalApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "ZMW" },
        }}
      />
      <PageHero
        eyebrow="Free tool"
        title="Sample size calculator"
        lead="Work out how many interviews your survey needs, or the margin of error for the sample you have. Adjust for population size, clustering and non-response."
        crumbs={[{ name: "Sample size calculator", href: "/tools/sample-size-calculator" }]}
      />

      <Section labelledBy="calculator-heading" className="!pt-14 sm:!pt-16">
        <Container>
          <h2 id="calculator-heading" className="sr-only">
            Calculator
          </h2>
          <SampleSizeCalculator initial={initial} />
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="method-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                id="method-heading"
                eyebrow="How it works"
                title="The calculation, in plain language."
                lead="The calculator estimates the sample needed to measure a proportion, such as the share of people who agree with a statement."
              />
              <Reveal className="mt-8 space-y-4 rounded-card border border-mist bg-white p-6 text-[0.95rem] leading-relaxed text-charcoal">
                <p>
                  <strong className="text-navy">1. Base sample.</strong> n = z² × p(1 − p) ÷ e², where z comes from the confidence
                  level, p is the expected proportion and e is the margin of error.
                </p>
                <p>
                  <strong className="text-navy">2. Finite population.</strong> If you enter a population size N, the sample is
                  reduced to n ÷ (1 + (n − 1) ÷ N).
                </p>
                <p>
                  <strong className="text-navy">3. Design effect.</strong> The result is multiplied by the design effect to allow
                  for clustering.
                </p>
                <p>
                  <strong className="text-navy">4. Non-response.</strong> Dividing by the response rate gives the number of people
                  to approach.
                </p>
              </Reveal>
              <Reveal className="mt-6">
                <Link
                  href="/insights/how-to-choose-a-sample-size"
                  className="group inline-flex items-center gap-1.5 font-display text-sm font-semibold text-blue hover:text-navy"
                >
                  Read our guide to choosing a sample size
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>

            <div className="space-y-6">
              <Reveal className="overflow-hidden rounded-card border border-mist bg-white">
                <table className="w-full text-left text-sm">
                  <caption className="border-b border-mist px-6 py-4 text-left font-display text-base font-bold text-navy">
                    Common sample sizes, large population
                  </caption>
                  <thead className="bg-cloud text-xs text-slate">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-semibold">
                        Margin of error
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">
                        90%
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">
                        95%
                      </th>
                      <th scope="col" className="px-6 py-3 text-right font-semibold">
                        99%
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reference.map((row) => (
                      <tr key={row.margin} className="border-t border-mist">
                        <th scope="row" className="px-6 py-3 font-semibold text-navy">
                          ±{row.margin} points
                        </th>
                        <td className="px-4 py-3 text-right tabular-nums">{row.c90.toLocaleString("en-GB")}</td>
                        <td className="px-4 py-3 text-right font-semibold text-navy tabular-nums">{row.c95.toLocaleString("en-GB")}</td>
                        <td className="px-6 py-3 text-right tabular-nums">{row.c99.toLocaleString("en-GB")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-mist px-6 py-3 text-xs text-slate">Expected proportion 50%, simple random sample.</p>
              </Reveal>
              <Reveal>
                <dl className="divide-y divide-mist rounded-card border border-mist bg-white">
                  {terms.map((item) => (
                    <div key={item.term} className="px-6 py-4">
                      <dt className="font-display font-semibold text-navy">{item.term}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-slate">{item.detail}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Need help designing your sample?"
        lead="Stratification, clustering, subgroups and weighting can change the answer. We design samples that hold up to scrutiny."
      />
    </>
  );
}
