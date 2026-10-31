import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  info: { box: "border-blue/20 bg-blue-tint text-navy", icon: <Info aria-hidden="true" className="text-blue" /> },
  success: { box: "border-good/25 bg-good-tint text-navy", icon: <CircleCheck aria-hidden="true" className="text-good" /> },
  warning: { box: "border-warning/25 bg-warning-tint text-navy", icon: <TriangleAlert aria-hidden="true" className="text-warning" /> },
  danger: { box: "border-danger/25 bg-danger-tint text-navy", icon: <CircleAlert aria-hidden="true" className="text-danger" /> },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
  action,
}: {
  tone?: keyof typeof styles;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  const style = styles[tone];
  return (
    <div role={tone === "danger" ? "alert" : undefined} className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", style.box, className)}>
      <span className="mt-0.5 shrink-0 [&_svg]:size-[1.1rem]">{style.icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn("text-charcoal/85", title && "mt-0.5")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
