import "server-only";
import { cert, getApps, initializeApp, applicationDefault, type App, type Credential } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseProjectId, storageBucketName, usingEmulators } from "@/lib/env";

/**
 * Firebase Admin SDK. Every read and write in the management system happens on
 * the server through this module, after the session and office checks have run.
 * The Firestore and Storage security rules deny all direct access from browsers.
 */

function credential(): Credential | undefined {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (json) {
    const parsed = JSON.parse(json.startsWith("{") ? json : Buffer.from(json, "base64").toString("utf8")) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    return cert({ projectId: parsed.project_id, clientEmail: parsed.client_email, privateKey: parsed.private_key });
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return cert({ projectId: firebaseProjectId(), clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") });
  }
  if (usingEmulators) return undefined;
  // Firebase App Hosting, Cloud Run and machines with `gcloud auth application-default login`.
  return applicationDefault();
}

let firestore: Firestore | undefined;

export function adminApp(): App {
  const existing = getApps().find((app) => app.name === "[DEFAULT]");
  if (existing) return existing;
  const cred = credential();
  return initializeApp({
    ...(cred ? { credential: cred } : {}),
    projectId: firebaseProjectId(),
    storageBucket: storageBucketName(),
  });
}

export function db(): Firestore {
  if (firestore) return firestore;
  firestore = getFirestore(adminApp());
  firestore.settings({ ignoreUndefinedProperties: true });
  return firestore;
}

export function adminAuth() {
  return getAuth(adminApp());
}

export function bucket() {
  return getStorage(adminApp()).bucket(storageBucketName());
}
