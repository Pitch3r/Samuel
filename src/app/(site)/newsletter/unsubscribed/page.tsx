import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Newsletter preferences",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function UnsubscribedPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const done = status === "done";
  return (
    <PageHero
      eyebrow={site.newsletterName}
      title={done ? "You have been unsubscribed." : "We could not find that subscription."}
      lead={
        done
          ? "You will not receive any more editions. If this was a mistake, you can subscribe again at any time from the footer of any page."
          : `The link may have expired or already been used. If you keep receiving emails, write to us at ${site.contact.email} and we will remove you.`
      }
    >
      <ButtonLink href="/" variant="gold" size="lg" arrow>
        Back to the home page
      </ButtonLink>
    </PageHero>
  );
}
