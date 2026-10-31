import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <Logo layout="mark" width={40} className="mx-auto" />
        <h1 className="mt-6 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-slate">The page you asked for does not exist, or you do not have access to it.</p>
        <ButtonLink href="/dashboard" className="mt-6">
          Back to the dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
