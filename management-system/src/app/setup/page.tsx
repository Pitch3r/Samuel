import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { countAdmins } from "@/lib/data/users";
import { isFirebaseConfigured } from "@/lib/env";
import { organisation } from "@/lib/constants";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = { title: "First-time setup" };

export default async function SetupPage() {
  const configured = isFirebaseConfigured();
  const admins = configured ? await countAdmins().catch(() => null) : null;
  const keySet = (process.env.SETUP_KEY?.trim().length ?? 0) >= 12;

  return (
    <main className="grid min-h-dvh place-items-center bg-cloud px-6 py-12">
      <div className="w-full max-w-md rounded-panel border border-mist bg-white p-8 shadow-card">
        <Logo width={160} priority />
        <h1 className="mt-8 text-2xl font-bold">First-time setup</h1>
        <p className="mt-1.5 text-sm text-slate">Create the administrator account for the {organisation.system}.</p>
        <div className="mt-6">
          {!configured ? (
            <Callout tone="warning" title="Firebase is not connected yet">
              Add the Firebase settings described in the README, then reload this page.
            </Callout>
          ) : admins === null ? (
            <Callout tone="danger" title="Could not reach Firestore">
              Check the Firebase project settings and that Firestore has been created for the project.
            </Callout>
          ) : admins > 0 ? (
            <div className="space-y-4">
              <Callout tone="success" title="Setup is complete">
                An administrator account already exists. New staff accounts are created from the Team page.
              </Callout>
              <ButtonLink href="/login" className="w-full">
                Go to sign in
              </ButtonLink>
            </div>
          ) : !keySet ? (
            <Callout tone="warning" title="Set a setup key first">
              Add a SETUP_KEY of at least 12 characters to the server settings, restart, and reload this page.
            </Callout>
          ) : (
            <SetupForm />
          )}
        </div>
      </div>
    </main>
  );
}
