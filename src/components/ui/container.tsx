import { cn } from "@/lib/utils";

export function Container({
  className,
  size = "default",
  children,
}: {
  className?: string;
  size?: "default" | "narrow" | "wide";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "default" && "max-w-[78rem]",
        size === "narrow" && "max-w-[50rem]",
        size === "wide" && "max-w-[88rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const tones = {
  white: "bg-white",
  cloud: "bg-cloud",
  navy: "on-dark bg-navy text-white",
  deep: "on-dark bg-navy-deep text-white",
} as const;

export function Section({
  id,
  tone = "white",
  className,
  children,
  spacing = "default",
  labelledBy,
}: {
  id?: string;
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
  spacing?: "default" | "compact" | "none";
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative isolate",
        tones[tone],
        spacing === "default" && "py-20 sm:py-24 lg:py-32",
        spacing === "compact" && "py-14 sm:py-16 lg:py-20",
        className,
      )}
    >
      {children}
    </section>
  );
}
