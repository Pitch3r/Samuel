import { expect, test } from "@playwright/test";
import {
  ADMIN,
  CHANDA,
  HOME_IP,
  MUTALE,
  OFFICE_IP,
  admin,
  computer,
  expectRefused,
  expectSignedIn,
  resetDevicesAndLimits,
  setAccess,
  signIn,
  uidOf,
} from "./helpers";

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await resetDevicesAndLimits();
});

test("signs in and out, and refuses a wrong password", async ({ browser }) => {
  await setAccess({ enforce: false });
  const pc = await computer(browser);
  const page = await pc.newPage();
  await page.goto("/assignments");
  await expect(page).toHaveURL(/\/login\?next=%2Fassignments/);

  const wrong = await signIn(pc, ADMIN, "not-the-password1");
  await expectRefused(wrong, /email address or password is not correct/i);

  const ok = await signIn(pc, ADMIN);
  await expectSignedIn(ok);
  await ok.getByRole("button", { name: "Sign out" }).first().click();
  await expect(ok).toHaveURL(/reason=signed-out/);
  await ok.goto("/dashboard");
  await expect(ok).toHaveURL(/\/login/);
  await pc.close();
});

test("locks each employee to the first office computer they sign in on", async ({ browser }) => {
  await setAccess({ device: { enabled: true, mode: "first-sign-in", maxPerEmployee: 1 } });

  const pc1 = await computer(browser);
  await expectSignedIn(await signIn(pc1, CHANDA));

  // The same person on another computer is refused.
  const pc2 = await computer(browser);
  await expectRefused(await signIn(pc2, CHANDA), /already registered to another office computer/i);

  // Another employee cannot use a computer bound to someone else.
  const pc1b = await browser.newContext({ storageState: await pc1.storageState(), extraHTTPHeaders: { "x-forwarded-for": OFFICE_IP } });
  await pc1b.clearCookies({ name: "prms_session" });
  await expectRefused(await signIn(pc1b, MUTALE), /registered to another member of staff/i);

  // The administrator is never restricted.
  const laptop = await computer(browser, HOME_IP);
  await expectSignedIn(await signIn(laptop, ADMIN));

  // The device was recorded with its details.
  const devices = await admin().db.collection("devices").where("assignedUids", "array-contains", await uidOf(CHANDA)).get();
  expect(devices.size).toBe(1);
  expect(devices.docs[0]!.data().status).toBe("approved");
  expect(devices.docs[0]!.data().details.browser).toBeTruthy();

  await Promise.all([pc1.close(), pc2.close(), pc1b.close(), laptop.close()]);
});

test("only approved computers in registered mode, with a request sent to the administrator", async ({ browser }) => {
  await setAccess({ device: { enabled: true, mode: "registered", maxPerEmployee: 1 } });
  const pc = await computer(browser);
  await expectRefused(await signIn(pc, MUTALE), /not registered for your account/i);

  const pending = await admin().db.collection("devices").where("status", "==", "pending").get();
  expect(pending.size).toBe(1);
  const notes = await admin().db.collection("notifications").where("uid", "==", await uidOf(ADMIN)).get();
  expect(notes.docs.some((doc) => /new computer/i.test(doc.data().title))).toBe(true);

  // Once the administrator approves it, the same computer works.
  await pending.docs[0]!.ref.update({ status: "approved", assignedUids: [], label: "Office PC 2" });
  await expectSignedIn(await signIn(pc, MUTALE));
  await pc.close();
});

test("office network rule applies at sign-in and on every request", async ({ browser }) => {
  await setAccess({ network: { enabled: true, allowed: ["41.72.100.0/24"] } });

  const home = await computer(browser, HOME_IP);
  await expectRefused(await signIn(home, CHANDA), /office network/i);

  const office = await computer(browser, OFFICE_IP);
  const page = await signIn(office, CHANDA);
  await expectSignedIn(page);

  // Same session, but the requests now come from outside the office.
  await office.setExtraHTTPHeaders({ "x-forwarded-for": HOME_IP });
  await page.goto("/assignments");
  await expect(page).toHaveURL(/\/login\?reason=network/);

  // The administrator can still sign in from home.
  await expectSignedIn(await signIn(home, ADMIN));
  await Promise.all([home.close(), office.close()]);
});

test("office hours rule", async ({ browser }) => {
  // A window that is never open: no working days.
  await setAccess({ hours: { enabled: true, days: [], start: "07:00", end: "19:00" } });
  const pc = await computer(browser);
  await expectRefused(await signIn(pc, CHANDA), /office hours/i);
  await pc.close();
});

test("suspended accounts cannot sign in", async ({ browser }) => {
  await setAccess({ enforce: false });
  const { auth, db } = admin();
  const uid = await uidOf(MUTALE);
  await auth.updateUser(uid, { disabled: true });
  await db.collection("users").doc(uid).update({ status: "suspended" });
  const pc = await computer(browser);
  await expectRefused(await signIn(pc, MUTALE), /suspended/i);
  await auth.updateUser(uid, { disabled: false });
  await db.collection("users").doc(uid).update({ status: "active" });
  await pc.close();
});
