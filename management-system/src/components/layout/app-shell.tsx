"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, LogOut, Menu, Monitor, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { NAV } from "@/components/layout/nav";
import { cn } from "@/lib/utils";
import { organisation } from "@/lib/constants";

export type ShellViewer = {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
  jobTitle: string;
  photoVersion: string | null;
};

export type ShellCounts = { unread: number; pendingDevices: number; reviewQueue: number };

function isActive(pathname: string, href: string) {
  if (href === "/settings") return pathname === "/settings" || (pathname.startsWith("/settings/") && !pathname.startsWith("/settings/access"));
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  viewer,
  counts,
  computer,
  signOut,
  children,
}: {
  viewer: ShellViewer;
  counts: ShellCounts;
  computer: string | null;
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const nav = (
    <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
      {NAV.filter((section) => !section.adminOnly || viewer.isAdmin).map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-white/45 uppercase">{section.title}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              const count = item.badge ? counts[item.badge] : 0;
              const label = item.href === "/performance" && !viewer.isAdmin ? "My performance" : item.label;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                      active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gold" aria-hidden="true" />}
                    <Icon className="size-[1.05rem] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                    <span className="flex-1 truncate">{label}</span>
                    {count > 0 && (
                      <span className="rounded-full bg-white/15 px-1.5 py-px text-[0.7rem] font-bold text-white tabular">
                        {count > 99 ? "99+" : count}
                        <span className="sr-only"> new</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const userBlock = (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <Avatar name={viewer.name} uid={viewer.uid} photoVersion={viewer.photoVersion} size="sm" className="ring-white/20" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{viewer.name}</p>
          <p className="truncate text-xs text-white/55">{viewer.isAdmin ? "Administrator" : viewer.jobTitle || "Employee"}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="on-dark sticky top-0 hidden h-dvh flex-col bg-navy lg:flex">
        <Link href="/dashboard" className="block px-6 pt-6 pb-2">
          <Logo variant="reversed" width={150} priority />
        </Link>
        <p className="px-6 pb-6 text-[0.6875rem] font-semibold tracking-[0.08em] text-gold uppercase">Management system</p>
        {nav}
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", open ? "visible" : "invisible")} aria-hidden={!open}>
        <div className={cn("absolute inset-0 bg-navy/50 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <aside
          className={cn(
            "on-dark absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col bg-navy transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-5">
            <Logo variant="reversed" width={140} />
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10" aria-label="Close menu">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {nav}
          {userBlock}
        </aside>
      </div>

      <div className="flex min-w-0 flex-col">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-mist bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="-ml-1 rounded-lg p-2 text-navy hover:bg-cloud lg:hidden" aria-label="Open menu">
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <Link href="/dashboard" className="lg:hidden">
            <Logo layout="mark" width={22} />
          </Link>
          <p className="hidden truncate text-sm font-semibold text-navy sm:block lg:hidden">{organisation.systemShort}</p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {computer && (
              <span className="hidden items-center gap-1.5 rounded-full border border-mist bg-cloud px-3 py-1 text-xs font-semibold text-slate md:inline-flex" title="This computer is registered for office use">
                <Monitor className="size-3.5" aria-hidden="true" />
                {computer}
              </span>
            )}
            <span className="hidden rounded-full bg-blue-tint px-3 py-1 text-xs font-semibold text-blue-dark sm:inline-flex">
              {viewer.isAdmin ? "Administrator" : "Employee"}
            </span>
            <Link href="/notifications" className="relative rounded-lg p-2 text-navy hover:bg-cloud" aria-label={`Notifications${counts.unread ? `, ${counts.unread} unread` : ""}`}>
              <Bell className="size-5" aria-hidden="true" />
              {counts.unread > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-white" aria-hidden="true" />}
            </Link>
            <Link href="/profile" className="rounded-full" aria-label="My profile">
              <Avatar name={viewer.name} uid={viewer.uid} photoVersion={viewer.photoVersion} size="sm" className="ring-mist" />
            </Link>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <footer className="no-print border-t border-mist px-4 py-4 text-xs text-slate sm:px-6 lg:px-8">
          {organisation.system} · {organisation.name}, {organisation.city}
        </footer>
      </div>
    </div>
  );
}
