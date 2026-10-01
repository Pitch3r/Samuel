"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Inbox, LayoutDashboard, LogOut, Mail, Menu, Newspaper, X } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Submissions", href: "/admin/submissions", icon: Inbox },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Insights", href: "/admin/insights", icon: Newspaper },
];

export function AdminShell({ newCount, children }: { newCount: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const navigation = (
    <nav aria-label="Dashboard" className="flex flex-1 flex-col">
      <ul className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="size-[1.1rem]" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.label === "Submissions" && newCount > 0 && (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[0.7rem] font-bold text-navy">{newCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-[1.1rem]" strokeWidth={1.75} aria-hidden="true" />
          View website
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-[1.1rem]" strokeWidth={1.75} aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-cloud lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="on-dark sticky top-0 hidden h-dvh flex-col gap-8 bg-navy p-5 text-white lg:flex">
        <Link href="/admin" className="px-2 pt-2">
          <Logo variant="reversed" width={160} />
        </Link>
        {navigation}
      </aside>

      <div className="on-dark flex items-center justify-between bg-navy px-5 py-4 lg:hidden">
        <Logo variant="reversed" width={150} />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full border border-white/20 text-white"
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>
      {open && <div className="on-dark flex flex-col bg-navy px-5 pb-5 text-white lg:hidden">{navigation}</div>}

      <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
