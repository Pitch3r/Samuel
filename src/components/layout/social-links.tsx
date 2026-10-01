import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const icons = {
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-1.75 3.5-1.75 3.74 0 4.14 2.3 4.14 5.3v5.95h-4v-5.25c0-1.25-.02-2.86-1.75-2.86-1.75 0-2.02 1.37-2.02 2.77v5.34H9.5v-11Z" />
  ),
  facebook: (
    <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.7c0-.85.24-1.43 1.46-1.43h1.56V4.64A20.9 20.9 0 0 0 14.25 4.5c-2.25 0-3.79 1.37-3.79 3.89v2.17H7.92v2.94h2.54V21h3.04Z" />
  ),
  x: <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />,
} as const;

const labels = { linkedin: "LinkedIn", facebook: "Facebook", x: "X" } as const;

/** Renders only the social profiles that are configured in site.ts. */
export function SocialLinks({ className }: { className?: string }) {
  const entries = (Object.keys(icons) as (keyof typeof icons)[]).filter((key) => site.social[key]);
  if (!entries.length) return null;
  return (
    <ul className={cn("flex gap-2.5", className)}>
      {entries.map((key) => (
        <li key={key}>
          <a
            href={site.social[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.shortName} on ${labels[key]}`}
            className="grid size-10 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold hover:text-gold"
          >
            <svg viewBox="0 0 24 24" className="size-[1.05rem]" fill="currentColor" aria-hidden="true">
              {icons[key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
