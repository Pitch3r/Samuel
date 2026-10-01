import { site } from "@/config/site";
import { services } from "@/content/services";
import { absoluteUrl } from "@/lib/utils";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganizationJsonLd() {
  const sameAs = Object.values(site.social).filter(Boolean);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": `${site.url}/#organization`,
        name: site.name,
        alternateName: site.shortName,
        slogan: site.tagline,
        description: site.description,
        url: site.url,
        logo: absoluteUrl("/brand/logo-horizontal-color-800.png"),
        image: absoluteUrl("/opengraph-image"),
        email: site.contact.email,
        telephone: site.contact.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.contact.address.street,
          addressLocality: site.contact.address.city,
          addressCountry: "ZM",
        },
        areaServed: [
          { "@type": "Country", name: "Zambia" },
          { "@type": "Place", name: "Southern Africa" },
          { "@type": "Place", name: "Eastern Africa" },
        ],
        knowsAbout: services.map((service) => service.title),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Research services",
          itemListElement: services.map((service) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: service.title, url: absoluteUrl(`/services/${service.slug}`) },
          })),
        },
        ...(sameAs.length ? { sameAs } : {}),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.href),
        })),
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}
