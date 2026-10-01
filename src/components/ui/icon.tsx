import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { icons, type IconName } from "@/lib/icons";

/** Brand line icon by name: 1.75px stroke, decorative unless labelled. */
export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  return createElement(icons[name], { strokeWidth: 1.75, "aria-hidden": true, ...props });
}
