import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getClient } from "@/lib/data/clients";
import { PageHeader } from "@/components/ui/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { updateClientAction } from "./actions";

export const metadata: Metadata = { title: "Edit client" };

export default async function EditClientPage(props: PageProps<"/clients/[id]/edit">) {
  await requireAdmin();
  const { id } = await props.params;
  const client = id.length <= 128 && !id.includes("/") ? await getClient(id) : null;
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        back={{ href: `/clients/${client.id}`, label: client.name }}
        title="Edit client"
        description="Changing the name also updates it on this client's assignments."
      />
      <ClientForm
        mode="edit"
        id={client.id}
        action={updateClientAction}
        cancelHref={`/clients/${client.id}`}
        values={{
          name: client.name,
          type: client.type,
          sector: client.sector,
          contactName: client.contactName,
          email: client.email,
          phone: client.phone,
          institution: client.institution,
          address: client.address,
          notes: client.notes,
        }}
      />
    </div>
  );
}
