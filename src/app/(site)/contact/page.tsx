import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, ClipboardList, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { Accordion } from "@/components/ui/accordion";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { generalFaqs } from "@/content/faqs";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Primeresearch Consultants in Lusaka about market research, polling, evaluation, data analysis, academic support or training.",
  alternates: { canonical: "/contact" },
};

const faqs = generalFaqs.slice(0, 4);

export default function ContactPage() {
  const details = [
    { icon: Mail, label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Phone, label: "Phone", value: site.contact.phone, href: `tel:${site.contact.phoneHref}` },
    ...(site.contact.whatsapp
      ? [{ icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${site.contact.whatsapp}` }]
      : []),
    {
      icon: MapPin,
      label: "Office",
      value: `${site.contact.address.street}, ${site.contact.address.city}, ${site.contact.address.country}`,
      href: site.contact.mapUrl,
    },
    { icon: Clock, label: "Hours", value: site.contact.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us about your research."
        lead="Tell us what you need to decide. A researcher, not an autoresponder, will reply within one working day."
        crumbs={[{ name: "Contact", href: "/contact" }]}
      />

      <Section labelledBy="contact-form-heading" className="!pt-14 sm:!pt-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:gap-10">
            <Reveal>
              <h2 id="contact-form-heading" className="mb-6 font-display text-h3 font-bold text-navy">
                Send us a message
              </h2>
              <ContactForm />
            </Reveal>

            <Reveal delay={0.1} className="space-y-5 lg:pt-14">
              <div className="on-dark rounded-[1.75rem] bg-navy p-7 text-white sm:p-8">
                <p className="font-display text-lg font-bold text-white">Contact details</p>
                <ul className="mt-6 space-y-5">
                  {details.map((item) => {
                    const Icon = item.icon;
                    const content = (
                      <>
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
                          <Icon className="size-[1.1rem] text-white" strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs text-white/55">{item.label}</span>
                          <span className="mt-0.5 block text-sm leading-relaxed [overflow-wrap:anywhere] text-white">{item.value}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="flex items-start gap-4 rounded-xl transition-colors hover:text-gold"
                          >
                            {content}
                          </a>
                        ) : (
                          <div className="flex items-start gap-4">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-7 border-t border-white/10 pt-5 text-sm text-white/70">{site.contact.responseTime}</p>
              </div>

              <Link
                href="/start-a-project"
                className="group flex items-center gap-5 rounded-[1.5rem] border border-mist bg-white p-6 transition-all hover:border-blue/30 hover:shadow-card"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-tint text-navy">
                  <ClipboardList className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block font-display font-bold text-navy">Prefer a structured brief?</span>
                  <span className="mt-0.5 block text-sm text-slate">Plan your study step by step and request a proposal.</span>
                </span>
                <ArrowRight className="size-5 text-slate transition-transform group-hover:translate-x-1 group-hover:text-blue" aria-hidden="true" />
              </Link>

              <div className="rounded-[1.5rem] border border-mist bg-cloud p-6 text-sm">
                <p className="font-display font-bold text-navy">Other enquiries</p>
                <ul className="mt-3 space-y-2 text-slate">
                  <li>
                    Joining our field team?{" "}
                    <Link href="/careers" className="font-semibold text-blue hover:text-navy">
                      Apply to our field network
                    </Link>
                  </li>
                  <li>
                    Training for your team?{" "}
                    <Link href="/training" className="font-semibold text-blue hover:text-navy">
                      See our courses
                    </Link>
                  </li>
                  <li>
                    Thesis or dissertation?{" "}
                    <Link href="/services/academic-research-support" className="font-semibold text-blue hover:text-navy">
                      Academic support
                    </Link>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="contact-faq-heading">
        <FaqJsonLd items={faqs} />
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading id="contact-faq-heading" eyebrow="Before you write" title="Questions we are often asked." />
            <Reveal>
              <Accordion items={faqs} />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
