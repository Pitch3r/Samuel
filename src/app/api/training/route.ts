import { handleSubmission } from "@/lib/submissions";
import { trainingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleSubmission(request, { kind: "training", schema: trainingSchema });
}
