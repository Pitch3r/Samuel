import { CircleCheck } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { IconTile } from "@/components/ui/icon-tile";
import { commitments, reasons } from "@/content/company";
import { getIcon } from "@/lib/icons";

export function ReasonsGrid() {
  return (
    <Stagger className="grid gap-px overflow-hidden rounded-[1.75rem] border border-mist bg-mist sm:grid-cols-2 lg:grid-cols-3">
      {reasons.map((reason) => (
        <StaggerItem key={reason.title} className="group bg-white p-8 transition-colors duration-300 hover:bg-cloud">
          <IconTile icon={getIcon(reason.icon)} className="group-hover:border-blue/20 group-hover:bg-white" />
          <h3 className="mt-6 font-display text-xl font-bold text-navy">{reason.title}</h3>
          <p className="mt-2.5 leading-relaxed text-slate">{reason.detail}</p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function CommitmentsPanel() {
  return (
    <Reveal>
      <div className="on-dark grid gap-10 rounded-[1.75rem] bg-navy p-8 text-white sm:p-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow">Our commitments</p>
          <h3 className="mt-5 font-display text-[1.85rem] leading-tight font-bold text-white">Promises we put in writing.</h3>
          <p className="mt-4 leading-relaxed text-white/70">
            Every engagement comes with the same standards, stated up front, so you know exactly what to expect from us.
          </p>
        </div>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {commitments.map((item) => (
            <li key={item.title} className="flex gap-3.5">
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="font-display font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
