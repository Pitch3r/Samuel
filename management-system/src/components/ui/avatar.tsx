import { cn, initials } from "@/lib/utils";

const sizes = { xs: "size-6 text-[0.6rem]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg", xl: "size-24 text-3xl" };

/** Profile photo when one is set (served through /api/avatar), otherwise initials. */
export function Avatar({
  name,
  uid,
  photoVersion,
  size = "md",
  className,
}: {
  name: string;
  uid?: string;
  photoVersion?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const classes = cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-navy font-display font-bold text-white ring-2 ring-white", sizes[size], className);
  if (uid && photoVersion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- private, authenticated image route
      <img src={`/api/avatar/${uid}?v=${encodeURIComponent(photoVersion)}`} alt="" className={cn(classes, "object-cover")} />
    );
  }
  return (
    <span className={classes} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
