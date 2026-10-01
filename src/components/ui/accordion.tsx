import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { question: string; answer: React.ReactNode };

/**
 * Accessible disclosure list built on native details/summary, so it works
 * without JavaScript. Height animates in browsers that support
 * interpolate-size; others simply open and close.
 */
export function Accordion({
  items,
  className,
  tone = "light",
}: {
  items: AccordionItem[];
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "divide-y rounded-card border",
        tone === "light" ? "divide-mist border-mist bg-white" : "divide-white/10 border-white/10 bg-white/[0.03]",
        className,
      )}
    >
      {items.map((item) => (
        <details
          key={item.question}
          className={cn(
            "group [interpolate-size:allow-keywords] [&::details-content]:h-0 [&::details-content]:overflow-hidden [&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-500 [&::details-content]:[transition-behavior:allow-discrete] open:[&::details-content]:h-auto",
          )}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 font-display text-[1.05rem] font-semibold transition-colors sm:px-7",
              tone === "light" ? "text-navy hover:text-blue" : "text-white hover:text-gold",
            )}
          >
            <span>{item.question}</span>
            <span
              className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300 group-open:rotate-45",
                tone === "light"
                  ? "border-mist text-navy group-open:border-blue group-open:bg-blue group-open:text-white"
                  : "border-white/20 text-white group-open:border-gold group-open:bg-gold group-open:text-navy",
              )}
            >
              <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            </span>
          </summary>
          <div
            className={cn(
              "px-6 pb-6 text-[0.98rem] leading-relaxed sm:px-7",
              tone === "light" ? "text-slate" : "text-white/75",
            )}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
