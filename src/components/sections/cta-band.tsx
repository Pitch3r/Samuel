import { Mail, Phone } from "lucide-react";
import { PrimeArc } from "@/components/brand/prime-arc";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";

export function CtaBand({
  title = "Have a question that needs an answer you can trust?",
  lead = "Tell us what you need to decide and we will propose the study to answer it.",
}: {
  title?: string;
  lead?: string;
}) {
  return (
    <section aria-labelledby="cta-heading" className="relative bg-white py-20 sm:py-24">
      <Container>
        <Reveal>
          <div className="on-dark relative isolate overflow-hidden rounded-[2rem] bg-navy px-5 py-12 text-white min-[380px]:px-7 sm:px-14 sm:py-16 lg:px-20 lg:py-20">
            <div aria-hidden="true" className="bg-grid-dark absolute inset-0 -z-10 opacity-50" />
            <PrimeArc
              tone="dark"
              segmentStart={200}
              segmentSweep={56}
              className="-right-[16rem] -bottom-[22rem] -z-10 size-[40rem] lg:-right-[10rem]"
            />
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <p className="eyebrow">Start a conversation</p>
                <h2 id="cta-heading" className="mt-5 font-display text-h2 font-bold text-white">
                  {title}
                </h2>
                <p className="mt-5 max-w-xl text-lead text-white/75">{lead}</p>
              </div>
              <div className="flex flex-col gap-4 lg:items-end">
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch xl:flex-row">
                  <ButtonLink href="/start-a-project" variant="gold" size="lg" arrow>
                    Request a proposal
                  </ButtonLink>
                  <ButtonLink href="/contact" variant="outline-light" size="lg">
                    Talk to us
                  </ButtonLink>
                </div>
                <div className="flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:gap-6 lg:justify-end">
                  <a href={`mailto:${site.contact.email}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Mail className="size-4 text-gold" aria-hidden="true" />
                    {site.contact.email}
                  </a>
                  <a href={`tel:${site.contact.phoneHref}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Phone className="size-4 text-gold" aria-hidden="true" />
                    {site.contact.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
