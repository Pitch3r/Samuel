import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-blue text-white shadow-[0_8px_20px_-10px_rgb(43_103_197/0.7)] hover:bg-blue-dark hover:shadow-[0_12px_28px_-12px_rgb(43_103_197/0.85)]",
  gold: "bg-gold text-navy shadow-[0_10px_30px_-12px_rgb(228_172_63/0.65)] hover:bg-gold-dark",
  navy: "bg-navy text-white hover:bg-navy-soft",
  outline: "border border-mist bg-white text-navy hover:border-navy/40 hover:bg-cloud",
  "outline-light": "border border-white/25 text-white hover:border-white/50 hover:bg-white/10",
  ghost: "text-navy hover:bg-cloud",
  link: "px-0 text-blue hover:text-navy",
} as const;

const sizes = {
  sm: "h-9 gap-1.5 px-4 text-sm",
  md: "h-11 gap-2 px-5 text-[0.95rem]",
  lg: "h-13 gap-2.5 px-7 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "group/btn relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-display font-semibold tracking-[-0.01em] transition-all duration-300 ease-out-expo disabled:pointer-events-none disabled:opacity-60",
    sizes[size],
    variant === "link" && "h-auto",
    variants[variant],
    className,
  );
}

function Arrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={2}
      className="size-4 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1"
    />
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  arrow = false,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const classes = buttonClasses({ variant, size, className });
  if (external) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {arrow && <Arrow />}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant,
  size,
  arrow = false,
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
