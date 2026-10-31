import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, as: Tag = "section" }: { className?: string; children: ReactNode; as?: "section" | "div" | "article" }) {
  return <Tag className={cn("rounded-card border border-mist bg-white shadow-card", className)}>{children}</Tag>;
}

export function CardHeader({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-mist px-5 py-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-blue-tint text-blue [&_svg]:size-[1.1rem]">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-snug">{title}</h2>
          {description && <p className="mt-0.5 text-[0.8125rem] text-slate">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("border-t border-mist px-5 py-3", className)}>{children}</div>;
}
