import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { organisation } from "@/lib/constants";
import "./globals.css";

const inter = localFont({ src: "./fonts/inter-latin-wght.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
const jakarta = localFont({ src: "./fonts/plus-jakarta-sans-latin-wght.woff2", variable: "--font-jakarta", display: "swap", weight: "200 800" });

export const metadata: Metadata = {
  title: { default: organisation.system, template: `%s | ${organisation.systemShort}` },
  description: `${organisation.system}: assignments, progress, performance and reporting for ${organisation.name}.`,
  robots: { index: false, follow: false },
  applicationName: organisation.system,
};

export const viewport: Viewport = { themeColor: "#0b2447" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster position="top-right" richColors closeButton toastOptions={{ className: "font-sans" }} />
      </body>
    </html>
  );
}
