import "server-only";

/**
 * Server configuration, read from environment variables. On Firebase App Hosting
 * the project, bucket and web API key are provided automatically through
 * FIREBASE_CONFIG and FIREBASE_WEBAPP_CONFIG; elsewhere set them explicitly.
 */

type FirebaseConfig = { projectId?: string; storageBucket?: string; apiKey?: string };

function parseJson(value: string | undefined): FirebaseConfig {
  if (!value) return {};
  try {
    return JSON.parse(value) as FirebaseConfig;
  } catch {
    return {};
  }
}

const appHosting = parseJson(process.env.FIREBASE_CONFIG);
const webApp = parseJson(process.env.FIREBASE_WEBAPP_CONFIG);

export const isProduction = process.env.NODE_ENV === "production";

export const usingEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST);

export function firebaseProjectId() {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    appHosting.projectId ||
    webApp.projectId ||
    (usingEmulators ? "demo-primeresearch" : undefined)
  );
}

export function storageBucketName() {
  const projectId = firebaseProjectId();
  return (
    process.env.FIREBASE_STORAGE_BUCKET ||
    appHosting.storageBucket ||
    webApp.storageBucket ||
    (projectId ? `${projectId}.firebasestorage.app` : undefined)
  );
}

export function firebaseWebApiKey() {
  return process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || webApp.apiKey || (usingEmulators ? "emulator-api-key" : undefined);
}

export function isFirebaseConfigured() {
  return Boolean(firebaseProjectId() && firebaseWebApiKey());
}

const DEV_SECRET = "development-only-secret-for-the-management-system-do-not-use";

/** Key that signs session and device cookies. Production refuses to run without a strong one. */
export function signingKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return new TextEncoder().encode(secret);
  if (!isProduction) return new TextEncoder().encode(DEV_SECRET);
  throw new Error("SESSION_SECRET must be set to a random value of at least 32 characters.");
}

/**
 * How to find the visitor's IP address behind the hosting platform's proxy.
 *  - "auto" (default): Firebase App Hosting's x-fah-client-ip or Vercel's
 *    x-real-ip, only when running on that platform; otherwise "unknown".
 *  - "x-forwarded-for:N" uses the Nth address from the right (1 = the last one),
 *    for a reverse proxy you run (nginx, Caddy) that appends the client address.
 *  - Any other value is read as a header name, for example "cf-connecting-ip".
 * The administrator's Office access page shows what was detected. See README.
 */
export function clientIpSource() {
  return (process.env.CLIENT_IP_SOURCE || "auto").trim().toLowerCase();
}
