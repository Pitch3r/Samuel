import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { SocialLinks } from "@/components/layout/social-links";
import { footerNav, site } from "@/config/site";
import { services } from "@/content/services";

export function Footer() {
  const year = new Date().getFullYear();
  const registrations = [
    site.legal.pacraNumber && `PACRA registration ${site.legal.pacraNumber}`,
    site.legal.tpin && `TPIN ${site.legal.tpin}`,
    site.legal.dataProtectionRegistration && `Data protection registration ${site.legal.dataProtectionRegistration}`,
  ].filter(Boolean);

  return (
    <footer className="on-dark relative isolate overflow-hidden bg-navy-deep text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 -bottom-72 -z-10 size-[42rem] rounded-full border-[3.5rem] border-white/[0.035]"
      />
      <div className="mx-auto max-w-[78rem] px-5 sm:px-8">
        <div className="grid gap-10 border-b border-white/10 py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">{site.newsletterName}</p>
            <p className="mt-4 max-w-xl font-display text-2xl leading-snug font-bold text-white sm:text-[1.75rem]">
              A short monthly note on methods, data and what the evidence says.
            </p>
          </div>
          <div>
            <NewsletterForm source="footer" />
            <p className="pl-5 text-xs text-white/50">
              No spam. Unsubscribe in one click. Read our{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-white">
                privacy notice
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="reversed" width={200} />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">
              A Zambian research and advisory firm. We design studies, collect and analyse data, and turn findings into decisions.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-white/75">
              <li>
                <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail className="size-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden="true" />
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.contact.phoneHref}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone className="size-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden="true" />
                  {site.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden="true" />
                <span>
                  {site.contact.address.street}, {site.contact.address.city}, {site.contact.address.country}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden="true" />
                <span>{site.contact.hours}</span>
              </li>
            </ul>
            <SocialLinks className="mt-7" />
          </div>

          <FooterColumn title="Services" links={services.map((service) => ({ label: service.shortTitle, href: `/services/${service.slug}` }))} />
          <FooterColumn title="Company" links={footerNav.company} />
          <FooterColumn title="Resources" links={footerNav.resources} />
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs leading-relaxed text-white/50 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-1">
            <p>
              © {year} {site.legalName}. {site.legal.line}
            </p>
            {registrations.length > 0 && <p>{registrations.join(" · ")}</p>}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerNav.legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <span className="text-white/40">{site.tagline}</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="font-display text-sm font-bold tracking-[0.14em] text-white/45 uppercase">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-white/75 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
