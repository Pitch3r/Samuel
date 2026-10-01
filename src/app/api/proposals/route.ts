import { handleSubmission } from "@/lib/submissions";
import { proposalSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleSubmission(request, { kind: "proposal", schema: proposalSchema, minFillMs: 5000 });
}
