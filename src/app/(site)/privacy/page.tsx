import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { legalUpdated, privacyNotice } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Primeresearch Consultants collects, uses and protects personal data, in line with Zambia's Data Protection Act No. 3 of 2021.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy notice"
      lead="How we collect, use and protect personal data when you use this website, and the rights you have."
      href="/privacy"
      markdown={privacyNotice}
      updated={legalUpdated}
    />
  );
}
