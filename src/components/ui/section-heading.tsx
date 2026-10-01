import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
  className,
  titleClassName,
  as: Tag = "h2",
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2" | "h3";
  children?: React.ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center [&_.eyebrow]:justify-center",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag
        id={id}
        className={cn(
          "font-display font-bold",
          Tag === "h1" ? "text-h1" : "text-h2",
          eyebrow && "mt-5",
          titleClassName,
        )}
      >
        {title}
      </Tag>
      {lead && (
        <p className="mt-6 text-lead text-slate in-[.on-dark]:text-white/75">
          {lead}
        </p>
      )}
      {children}
    </Reveal>
  );
}
