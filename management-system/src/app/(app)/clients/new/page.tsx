import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { createClientAction } from "./actions";

export const metadata: Metadata = { title: "New client" };

export default async function NewClientPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        back={{ href: "/clients", label: "Clients" }}
        title="New client"
        description="Record who the work is for. Once the client exists you can link assignments to it and follow its work and fees in one place."
      />
      <ClientForm
        mode="create"
        action={createClientAction}
        cancelHref="/clients"
        values={{
          name: "",
          type: "Business or brand",
          sector: "",
          contactName: "",
          email: "",
          phone: "",
          institution: "",
          address: "",
          notes: "",
        }}
      />
    </div>
  );
}
