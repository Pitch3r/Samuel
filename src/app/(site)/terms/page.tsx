import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { legalUpdated, termsOfUse } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms that apply to your use of the Primeresearch Consultants website and its tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      lead="The terms that apply when you use this website, its articles and its tools."
      href="/terms"
      markdown={termsOfUse}
      updated={legalUpdated}
    />
  );
}
