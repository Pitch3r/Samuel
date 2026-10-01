import { handleSubmission } from "@/lib/submissions";
import { careersSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleSubmission(request, { kind: "careers", schema: careersSchema, minFillMs: 5000 });
}
