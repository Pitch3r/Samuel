"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Check, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-blue"
    />
  );
}

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, short: "in" },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, short: "X" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${link.label}`}
          className="grid size-10 place-items-center rounded-full border border-mist font-display text-sm font-bold text-navy transition-colors hover:border-blue hover:text-blue"
        >
          {link.short}
        </a>
      ))}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="grid size-10 place-items-center rounded-full border border-mist text-navy transition-colors hover:border-blue hover:text-blue"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard
            .writeText(url)
            .then(() => {
              setCopied(true);
              toast.success("Link copied");
              setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => toast.error("Could not copy the link"))
        }
        aria-label="Copy link"
        className={cn(
          "grid size-10 place-items-center rounded-full border transition-colors",
          copied ? "border-teal bg-teal-tint text-teal-dark" : "border-mist text-navy hover:border-blue hover:text-blue",
        )}
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

/** Highlights the contents entry for the section currently in view. */
export function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const elements = headings.map((heading) => document.getElementById(heading.id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page">
      <p className="font-display text-xs font-bold tracking-[0.16em] text-slate uppercase">On this page</p>
      <ul className="mt-4 space-y-1 border-l border-mist">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors",
                active === heading.id ? "border-blue font-semibold text-navy" : "border-transparent text-slate hover:text-navy",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
