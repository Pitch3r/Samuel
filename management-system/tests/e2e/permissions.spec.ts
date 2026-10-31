import { expect, test } from "@playwright/test";
import { ADMIN, CHANDA, admin, computer, resetDevicesAndLimits, setAccess, signIn, uidOf } from "./helpers";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await resetDevicesAndLimits();
  await setAccess({ enforce: false });
});

test("employees cannot open administrator pages", async ({ browser }) => {
  const pc = await computer(browser);
  const page = await signIn(pc, CHANDA);
  for (const path of ["/team", "/clients", "/reports", "/settings", "/settings/access", "/settings/activity", "/assignments/new"]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/dashboard\?denied=1/);
  }
  await pc.close();
});

test("employees only see their own assignments", async ({ browser }) => {
  const chanda = await uidOf(CHANDA);
  const { db } = admin();
  const all = await db.collection("assignments").get();
  const notMine = all.docs.find((doc) => !(doc.data().assigneeIds as string[]).includes(chanda))!;
  const mine = all.docs.find((doc) => (doc.data().assigneeIds as string[]).includes(chanda))!;

  const pc = await computer(browser);
  const page = await signIn(pc, CHANDA);
  await page.goto("/assignments");
  await expect(page.getByText(mine.data().title as string).first()).toBeVisible();
  await expect(page.getByText(notMine.data().title as string)).toHaveCount(0);

  const response = await page.goto(`/assignments/${notMine.id}`);
  expect(response?.status()).toBe(404);
  await pc.close();
});

test("API routes require a session and respect roles", async ({ browser, request }) => {
  const { db } = admin();
  const assignment = (await db.collection("assignments").limit(1).get()).docs[0]!;
  expect((await request.get(`/api/files/${assignment.id}/nope`)).status()).toBe(401);
  expect((await request.get("/api/export/assignments")).status()).toBe(401);
  expect((await request.get(`/api/avatar/${await uidOf(ADMIN)}`)).status()).toBe(401);

  const pc = await computer(browser);
  const page = await signIn(pc, CHANDA);
  expect((await page.request.get("/api/export/assignments")).status()).toBe(403);
  expect((await page.request.get("/api/export/time")).status()).toBe(200);
  await pc.close();
});
