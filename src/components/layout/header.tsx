"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Compass, Mail, Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { mainNav, site } from "@/config/site";
import { services } from "@/content/services";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaId = useId();
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 480 && y > lastY.current + 4);
      if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const openMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }, []);
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  }, []);

  const solid = scrolled || megaOpen;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-full bg-gold px-5 py-3 font-display text-sm font-semibold text-navy focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow,border-color] duration-500 ease-out-expo",
          hidden && !megaOpen && !mobileOpen ? "-translate-y-full" : "translate-y-0",
          solid
            ? "border-b border-mist/80 bg-white/90 shadow-[0_10px_30px_-20px_rgb(11_36_71/0.35)] backdrop-blur-xl"
            : "on-dark border-b border-transparent bg-transparent",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="mx-auto flex h-[4.75rem] w-full max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="Primeresearch Consultants home" className="relative shrink-0 py-2">
            <span className={cn("block transition-opacity duration-300", solid ? "opacity-0" : "opacity-100")}>
              <Logo variant="reversed" width={176} priority />
            </span>
            <span
              className={cn(
                "absolute inset-0 grid items-center transition-opacity duration-300",
                solid ? "opacity-100" : "opacity-0",
              )}
            >
              <Logo variant="color" width={176} priority />
            </span>
          </Link>

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) =>
                item.label === "Services" ? (
                  <li key={item.href} onMouseEnter={openMega}>
                    <button
                      type="button"
                      aria-expanded={megaOpen}
                      aria-controls={megaId}
                      onClick={() => (megaOpen ? setMegaOpen(false) : openMega())}
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-full px-4 font-display text-[0.94rem] font-semibold transition-colors",
                        solid ? "text-navy hover:bg-cloud" : "text-white/90 hover:bg-white/10 hover:text-white",
                        isActive("/services") && (solid ? "text-blue" : "text-gold"),
                      )}
                    >
                      Services
                      <ChevronDown
                        aria-hidden="true"
                        className={cn("size-4 transition-transform duration-300", megaOpen && "rotate-180")}
                        strokeWidth={2}
                      />
                    </button>
                  </li>
                ) : (
                  <li key={item.href} onMouseEnter={scheduleClose}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-10 items-center rounded-full px-4 font-display text-[0.94rem] font-semibold transition-colors",
                        solid ? "text-navy hover:bg-cloud" : "text-white/90 hover:bg-white/10 hover:text-white",
                        isActive(item.href) && (solid ? "text-blue" : "text-gold"),
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <ButtonLink
              href="/start-a-project"
              variant={solid ? "primary" : "gold"}
              size="md"
              arrow
              className="hidden sm:inline-flex"
            >
              Request a proposal
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className={cn(
                "grid size-11 place-items-center rounded-full border transition-colors xl:hidden",
                solid ? "border-mist text-navy hover:bg-cloud" : "border-white/25 text-white hover:bg-white/10",
              )}
            >
              <Menu className="size-5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <motion.div
              id={megaId}
              key="mega"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EASE }}
              onMouseEnter={openMega}
              className="absolute inset-x-0 top-full hidden border-t border-mist bg-white shadow-[0_30px_60px_-30px_rgb(11_36_71/0.45)] xl:block"
            >
              <div className="mx-auto grid max-w-[88rem] grid-cols-[1fr_20rem] gap-10 px-8 py-10">
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <p className="eyebrow">Eight practice areas</p>
                    <Link
                      href="/services"
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue hover:text-navy"
                    >
                      All services
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {services.map((service) => {
                      return (
                        <li key={service.slug}>
                          <Link
                            href={`/services/${service.slug}`}
                            className="group flex gap-4 rounded-2xl p-3.5 transition-colors hover:bg-cloud"
                          >
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-mist bg-white text-navy transition-colors group-hover:border-blue/30 group-hover:text-blue">
                              <Icon name={service.icon} className="size-5" strokeWidth={1.75} aria-hidden="true" />
                            </span>
                            <span>
                              <span className="block font-display text-[0.98rem] font-semibold text-navy group-hover:text-blue">
                                {service.shortTitle}
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-slate">{service.summary}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="relative overflow-hidden rounded-3xl bg-navy p-7 text-white">
                  <div className="absolute -top-16 -right-16 size-48 rounded-full border-[14px] border-white/[0.06]" aria-hidden="true" />
                  <Compass className="size-7 text-gold" strokeWidth={1.75} aria-hidden="true" />
                  <p className="mt-5 font-display text-xl font-bold leading-snug text-white">Not sure where to start?</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Tell us the decision you face. We will recommend the right study, at the right depth.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5">
                    <ButtonLink href="/start-a-project" variant="gold" size="sm" arrow>
                      Plan your study
                    </ButtonLink>
                    <ButtonLink href="/#study-finder" variant="outline-light" size="sm">
                      Use the study finder
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} isActive={isActive} />
    </>
  );
}

function MobileMenu({ open, onClose, isActive }: { open: boolean; onClose: () => void; isActive: (href: string) => boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter(
        (element) => element.offsetParent !== null,
      );
    focusable()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          className="fixed inset-0 z-[60] xl:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="on-dark absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-navy text-white"
          >
            <div className="flex h-[4.75rem] shrink-0 items-center justify-between px-5 sm:px-8">
              <Logo variant="reversed" width={160} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10"
              >
                <X className="size-5" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 px-5 pt-4 pb-8 sm:px-8">
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {mainNav.map((item) =>
                  item.label === "Services" ? (
                    <li key={item.href}>
                      <button
                        type="button"
                        aria-expanded={servicesOpen}
                        onClick={() => setServicesOpen((value) => !value)}
                        className="flex w-full items-center justify-between py-4 font-display text-xl font-semibold"
                      >
                        Services
                        <ChevronDown
                          className={cn("size-5 transition-transform", servicesOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {servicesOpen && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <li>
                              <Link href="/services" className="block py-2 pl-3 text-[0.95rem] font-semibold text-gold">
                                All services
                              </Link>
                            </li>
                            {services.map((service) => (
                              <li key={service.slug}>
                                <Link
                                  href={`/services/${service.slug}`}
                                  className="block py-2 pl-3 text-[0.95rem] text-white/80 hover:text-white"
                                >
                                  {service.shortTitle}
                                </Link>
                              </li>
                            ))}
                            <li className="h-3" aria-hidden="true" />
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "block py-4 font-display text-xl font-semibold",
                          isActive(item.href) ? "text-gold" : "text-white",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                <ButtonLink href="/start-a-project" variant="gold" size="lg" arrow>
                  Request a proposal
                </ButtonLink>
                <ButtonLink href="/tools/sample-size-calculator" variant="outline-light" size="lg">
                  Sample size calculator
                </ButtonLink>
              </div>
              <div className="mt-10 space-y-3 text-sm text-white/75">
                <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 hover:text-white">
                  <Mail className="size-4 text-gold" aria-hidden="true" /> {site.contact.email}
                </a>
                <a href={`tel:${site.contact.phoneHref}`} className="flex items-center gap-3 hover:text-white">
                  <Phone className="size-4 text-gold" aria-hidden="true" /> {site.contact.phone}
                </a>
              </div>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
