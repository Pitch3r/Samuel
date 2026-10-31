import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** A large link to one area of settings, with a live one-line status. */
export function SettingsLinkCard({
  href,
  icon,
  title,
  description,
  status,
  attention = false,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  status: ReactNode;
  attention?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-card border border-mist bg-white p-5 shadow-card transition-shadow hover:shadow-lift focus-visible:shadow-lift",
        attention && "border-warning/40 ring-1 ring-warning/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-blue-tint text-blue [&_svg]:size-5">{icon}</span>
        <ChevronRight className="size-5 text-slate transition-transform group-hover:translate-x-0.5 group-hover:text-navy" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-bold">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-slate">{description}</p>
      <div className="mt-4 border-t border-mist pt-3 text-[0.8125rem] font-semibold text-navy">{status}</div>
    </Link>
  );
}
