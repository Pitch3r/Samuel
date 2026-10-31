import { randomBytes, createHash } from "node:crypto";

/** URL-safe random identifier. */
export function newId(bytes = 15) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
