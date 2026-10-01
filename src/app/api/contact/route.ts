import { handleSubmission } from "@/lib/submissions";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleSubmission(request, { kind: "contact", schema: contactSchema });
}
