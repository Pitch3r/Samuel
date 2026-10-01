import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { clientTypes } from "@/content/company";
import { Icon } from "@/components/ui/icon";

export function ClientStrip() {
  return (
    <section aria-label="Who we work with" className="border-b border-mist bg-white py-10">
      <Container size="wide">
        <div className="flex flex-col gap-6">
          <p className="font-display text-xs font-bold tracking-[0.18em] text-slate uppercase">Research for</p>
          <Stagger as="ul" className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-6" stagger={0.05}>
            {clientTypes.map((client) => {
              return (
                <StaggerItem as="li" key={client.title} className="flex items-center gap-3">
                  <Icon name={client.icon} className="size-5 shrink-0 text-blue" strokeWidth={1.75} aria-hidden="true" />
                  <span className="text-sm leading-snug font-medium text-navy">{client.title}</span>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
