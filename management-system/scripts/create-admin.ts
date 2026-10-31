/**
 * Creates (or promotes) an administrator account from the command line, as an
 * alternative to the /setup page. Uses the same Firebase settings as the app.
 *
 *   npm run create-admin -- --email you@example.com --name "Your Name"
 */
import { createInterface } from "node:readline/promises";
import { cert, applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { DEFAULT_TARGETS } from "../src/lib/constants";

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

function credential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (json) {
    const parsed = JSON.parse(json.startsWith("{") ? json : Buffer.from(json, "base64").toString("utf8"));
    return cert({ projectId: parsed.project_id, clientEmail: parsed.client_email, privateKey: parsed.private_key });
  }
  return process.env.FIRESTORE_EMULATOR_HOST ? undefined : applicationDefault();
}

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  const name = arg("name")?.trim();
  if (!email || !name) {
    console.error('Usage: npm run create-admin -- --email you@example.com --name "Your Name"');
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = (await rl.question("Password (10+ characters, letters and numbers): ")).trim();
  rl.close();
  if (password.length < 10 || !/[a-z]/i.test(password) || !/\d/.test(password)) {
    console.error("That password is too weak.");
    process.exit(1);
  }

  initializeApp({ credential: credential(), projectId: process.env.FIREBASE_PROJECT_ID });
  const auth = getAuth();
  const db = getFirestore();
  let uid: string;
  try {
    uid = (await auth.getUserByEmail(email)).uid;
    await auth.updateUser(uid, { password, displayName: name, disabled: false });
    console.log("Existing login found; updated its password.");
  } catch {
    uid = (await auth.createUser({ email, password, displayName: name, emailVerified: true })).uid;
  }
  await auth.setCustomUserClaims(uid, { role: "admin" });
  const now = new Date().toISOString();
  await db.collection("users").doc(uid).set(
    {
      email,
      role: "admin",
      status: "active",
      displayName: name,
      jobTitle: "Managing Consultant",
      department: "Management",
      targets: { ...DEFAULT_TARGETS },
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
  console.log(`Administrator ready: ${email}`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
