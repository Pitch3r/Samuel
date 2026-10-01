"use client";

import dynamic from "next/dynamic";

function WizardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the proposal form" className="rounded-[1.75rem] border border-mist bg-white p-9 shadow-card">
      <div className="h-5 w-2/3 animate-pulse rounded-full bg-cloud" />
      <div className="mt-4 h-1 w-full rounded-full bg-cloud" />
      <div className="mt-10 h-7 w-1/2 animate-pulse rounded-full bg-cloud" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-cloud" />
        ))}
      </div>
    </div>
  );
}

/** The wizard reads drafts from browser storage, so it renders on the client only. */
export const ProjectWizardLoader = dynamic(() => import("@/components/forms/project-wizard").then((mod) => mod.ProjectWizard), {
  ssr: false,
  loading: () => <WizardSkeleton />,
});
