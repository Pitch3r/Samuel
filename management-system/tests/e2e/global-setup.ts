import { execSync } from "node:child_process";

/** Reseeds the emulators with the demo data before the suite runs. */
export default function globalSetup() {
  execSync("npx tsx scripts/seed-demo.ts", {
    stdio: "inherit",
    env: {
      ...process.env,
      FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080",
      FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099",
      FIREBASE_PROJECT_ID: "demo-primeresearch",
    },
  });
}
