import type { ReactNode } from "react";
import { Building2, GraduationCap, HandHeart, Landmark, Store, UserRound } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/badge";
import type { ClientType } from "@/lib/constants";

/** Client types that come to the firm for academic research support; the rest are corporate. */
export const ACADEMIC_CLIENT_TYPES: ClientType[] = ["University or institute", "Student or researcher"];

export function isAcademicClient(type: ClientType) {
  return ACADEMIC_CLIENT_TYPES.includes(type);
}

const ICONS: Record<ClientType, ReactNode> = {
  "Business or brand": <Building2 aria-hidden="true" />,
  "Government or public agency": <Landmark aria-hidden="true" />,
  "NGO or development partner": <HandHeart aria-hidden="true" />,
  "University or institute": <GraduationCap aria-hidden="true" />,
  "Small or medium enterprise": <Store aria-hidden="true" />,
  "Student or researcher": <UserRound aria-hidden="true" />,
};

/** The icon that stands for a client type, for avatars and lists. */
export function clientTypeIcon(type: ClientType) {
  return ICONS[type] ?? <Building2 aria-hidden="true" />;
}

/** Academic clients in teal, corporate in blue, matching the track badges. */
export function ClientTypeBadge({ type }: { type: ClientType }) {
  const tone: Tone = isAcademicClient(type) ? "teal" : "blue";
  return (
    <Badge tone={tone} icon={clientTypeIcon(type)}>
      {type}
    </Badge>
  );
}
